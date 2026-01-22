<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Order;
use App\Models\Customer;
use App\Models\Vehicle;
use App\Models\Employee;
use App\Models\Product;
use App\Support\QueryFilter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
class OrderController extends Controller
{

    public function index(Request $request)
    {
        $filters = session('orders.filters', []);
        $search  = session('orders.search', '');

        $query = Order::query()->with(['customer', 'vehicle']);

        // Apply structured filters
        $query = QueryFilter::apply($query, $filters);

        // Apply global search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%$search%")
                    ->orWhere('vehicle_name', 'like', "%$search%")
                    ->orWhere('vehicle_license_plate', 'like', "%$search%");
            });
        }

        // Cascading vehicle filter
        $customerId = collect($filters)->firstWhere('field', 'customer_id')['value'] ?? null;
        $vehicles = Vehicle::when($customerId, fn($q) => $q->where('customer_id', $customerId))
            ->select('id', 'license_plate', 'name')
            ->orderBy('license_plate')
            ->get();

        return inertia('orders/index', [
            'orders' => $query->latest()->paginate(80),
            'activeFilters' => $filters,
            'search' => $search,
            'customers' => Customer::select('id', 'name')->orderBy('name')->get(),
            'states' => Order::states(),
            'partsBy' => Order::partsBy(),
        ]);
    }


    public function create()
    {
        return Inertia::render('orders/form', [
            'customers' => Customer::select('id','name')->get(), // only customers,
            'vehicles' => Vehicle::all()->map(function($vehicle) {
                return [
                    'id' => $vehicle->id,
                    'customer_id'=>$vehicle->customer_id,
                    'name' => $vehicle->display_name, // computed field
                ];
            }),
            'employees' => Employee::all(),
            'products' => Product::all(),
            'states' => Order::states(),
            'parts_by' => Order::partsBy(),
            'fields' => Order::fields(),
            'customers_fields' => Customer::fields(),
            'vehicles_fields' => Vehicle::fields(),
            'record' => null,
        ]);
    }

    public function edit(Order $order)
    {
        $order->load(['lines']);

        return Inertia::render('orders/edit', [
            'customers' => Customer::select('id','name')->get(),
            'vehicles' => Vehicle::all()->map(function($vehicle) {
                return [
                    'id' => $vehicle->id,
                    'customer_id'=> $vehicle->customer_id,
                    'name' => $vehicle->display_name, // computed field
                ];
            }),
            'employees' => Employee::all(),
            'products' => Product::all(),
            'states' => Order::states(),
            'parts_by' => Order::partsBy(),
            'fields' => Order::editFields(),
            'record' => $order,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'vehicle_id' => 'required|exists:vehicles,id',
            'order_date' => 'required|date',
            'parts_by' => 'nullable',
            'employees' => 'array',
            'employees.*' => 'exists:employees,id',

            'lines' => 'required|array',
            'lines.*.product_id' => 'required|exists:products,id',
            'lines.*.employee_id' => 'nullable|exists:employees,id',
            'lines.*.quantity' => 'required|numeric|min:1',
            'lines.*.unit_price' => 'required|numeric|min:0',
            'lines.*.discount' => 'nullable|numeric|min:0',
        ]);

        /* ----------------------------
     | Snapshot customer data
     |-----------------------------*/
        $customer = Customer::findOrFail($validated['customer_id']);
        $vehicle = Vehicle::find($validated['vehicle_id']);
        if ($vehicle) {
            $validated['vehicle_name'] = $vehicle->name;
            $validated['vehicle_model'] = $vehicle->model;
            $validated['vehicle_license_plate'] = $vehicle->license_plate;
            $validated['vehicle_vin'] = $vehicle->vin;
        }

        $order = Order::create([
            'customer_id' => $customer->id,
            'customer_name' => $customer->name,
            'customer_email' => $customer->email,
            'customer_phone' => $customer->phone,
            'customer_address' => $customer->address,

            'vehicle_id' => $validated['vehicle_id'],
            'vehicle_name' => $validated['vehicle_name']?? null,
            'vehicle_model' => $validated['vehicle_model']?? null,
            'vehicle_license_plate' => $validated['vehicle_license_plate']?? null,
            'vehicle_vin' => $validated['vehicle_vin']?? null,
            'order_date' => $validated['order_date'],
            'state' => $validated['state'],
        ]);


        /* ----------------------------
     | Create lines & calculate totals
     |-----------------------------*/
        $subtotal = 0;
        $totalDiscount = 0;

        foreach ($validated['lines'] as $line) {
            $qty = $line['quantity'];
            $price = $line['unit_price'];
            $discount = $line['discount'] ?? 0;

            $lineTotal = ($qty * $price) - $discount;

            $order->lines()->create([
                'product_id' => $line['product_id'],
                'employee_id' => $line['employee_id'] ?? null,
                'quantity' => $qty,
                'unit_price' => $price,
                'discount' => $discount,
                'subtotal' => $lineTotal,
            ]);

            $subtotal += $lineTotal;
            $totalDiscount += $discount;
        }

        /* ----------------------------
     | Order-level tax (13%)
     |-----------------------------*/
        $taxRate = 0.13;
        $taxAmount = $subtotal * $taxRate;

        $order->update([
            'subtotal' => $subtotal,
            'tax_rate' => $taxRate,
            'total_tax' => $taxAmount,
            'total_discount' => $totalDiscount,
            'total_amount' => $subtotal + $taxAmount,
        ]);

        return redirect()
            ->route('orders.index')
            ->with('success', 'Order created successfully.');
    }


    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'customer_address' => 'nullable|string|max:500',
            'vehicle_name' => 'nullable',
            'vehicle_model' => 'nullable',
            'vehicle_license_plate' => 'nullable',
            'vehicle_vin' => 'nullable',
            'order_date' => 'required|date',
            'parts_by' => 'nullable',
            'state' => 'nullable',
            'lines' => 'required|array',
            'lines.*.product_id' => 'required|exists:products,id',
            'lines.*.employee_id' => 'nullable|exists:employees,id',
            'lines.*.quantity' => 'required|numeric|min:1',
            'lines.*.unit_price' => 'required|numeric|min:0',
            'lines.*.discount' => 'nullable|numeric|min:0',
        ]);

        /* ----------------------------
     | Update order basic fields
     |-----------------------------*/
        $order->update([
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'] ?? null,
            'customer_phone' => $validated['customer_phone'] ?? null,
            'customer_address' => $validated['customer_address'] ?? null,
            'vehicle_name'=> $validated['vehicle_name'],
            'vehicle_model'=> $validated['vehicle_model'],
            'vehicle_license_plate'=> $validated['vehicle_license_plate'],
            'vehicle_vin'=> $validated['vehicle_vin'],
            'order_date' => $validated['order_date'],
            'parts_by' => $validated['parts_by'],
            'state' => $validated['state'],
        ]);

        /* ----------------------------
     | Recalculate totals
     |-----------------------------*/
        $subtotal = 0;
        $totalDiscount = 0;

        // Remove old lines
        $order->lines()->delete();

        foreach ($validated['lines'] as $line) {
            $qty = $line['quantity'];
            $price = $line['unit_price'];
            $discount = $line['discount'] ?? 0;

            $lineTotal = ($qty * $price) - $discount;

            $order->lines()->create([
                'product_id' => $line['product_id'],
                'employee_id' => $line['employee_id'] ?? null,
                'quantity' => $qty,
                'unit_price' => $price,
                'discount' => $discount,
                'subtotal' => $lineTotal,
            ]);

            $subtotal += $lineTotal;
            $totalDiscount += $discount;
        }

        /* ----------------------------
     | Order-level tax (13%)
     |-----------------------------*/
        $taxRate = 0.13;
        $taxAmount = $subtotal * $taxRate;

        $order->update([
            'subtotal' => $subtotal,
            'tax_rate' => $taxRate,
            'total_tax' => $taxAmount,
            'total_discount' => $totalDiscount,
            'total_amount' => $subtotal + $taxAmount,
        ]);

        return redirect()
            ->route('orders.index')
            ->with('success', 'Order updated successfully.');
    }


    public function destroy(Order $order)
    {
        $order->lines()->delete();
        $order->delete();

        return redirect()->route('orders.index')->with('success', 'Order deleted.');
    }

    public function downloadInvoice($id)
    {
        $order = Order::with(['lines'])->findOrFail($id);
        $company=Company::first();

        $pdf = Pdf::loadView('invoices.order', compact('order','company'));
        return $pdf->stream("invoice_order_{$order->id}.pdf"); // opens in browser
//        return $pdf->download("invoice_order_{$order->id}.pdf");
    }

    public function billingReport(Request $request)
    {
        $filters = session('reports.billing.filters', []);
        $search  = session('reports.billing.search', '');

        $query = Order::query()->with([
            'lines.product',
            'vehicle',
            'customer',
        ]);

        // Apply structured filters
        $query = QueryFilter::apply($query, $filters);

        // Global search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%$search%")
                    ->orWhere('vehicle_license_plate', 'like', "%$search%")
                    ->orWhereHas('vehicle', fn ($v) =>
                    $v->where('license_plate', 'like', "%$search%")
                    );
            });
        }

        $orders = $query
            ->orderBy('order_date', 'desc')
            ->paginate(80)
            ->through(function ($order) {

                $partsLines = $order->lines->filter(fn ($l) => $l->product?->type === 'part');
                $labourLines = $order->lines->filter(fn ($l) => $l->product?->type === 'labour');

                $brakeFluidLines = $order->lines->filter(fn ($l) =>
                str_contains(strtolower($l->product?->name ?? ''), 'brake')
                );

                $otherLines = $order->lines->diff($partsLines)->diff($labourLines);

                $partsCost = $partsLines->sum('subtotal');
                $labourTotal = $labourLines->sum('subtotal');
                $labourPerHour = $labourLines->avg('unit_price') ?? 0;
                $brakeFluidCost = $brakeFluidLines->sum('subtotal');
                $otherCost = $otherLines->sum('subtotal');

                return [
                    'id' => $order->id,
                    'date' => optional($order->order_date)->format('Y-m-d'),
                    'invoice_number' => 'INV-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
                    'license_plate' => $order->vehicle_license_plate ?? $order->vehicle?->license_plate ?? '-',
                    'description' => $order->lines->pluck('product.name')->filter()->implode(', '),
                    'parts_cost' => round($partsCost, 2),
                    'brake_fluid_cost' => round($brakeFluidCost, 2),
                    'mention' => ucfirst(str_replace('_', ' ', $order->state)),
                    'other_cost' => round($otherCost, 2),
                    'labour_per_hour' => round($labourPerHour, 2),
                    'total_labour' => round($labourTotal, 2),
                    'subtotal' => round($partsCost + $labourTotal, 2),
                    'parts' => round($partsCost, 2),
                    'hst' => round($order->total_tax ?? 0, 2),
                    'invoice_total' => round($order->total_amount ?? ($partsCost + $labourTotal + ($order->total_tax ?? 0)), 2),
                    'parts_teejay' => $order->parts_by === 'us' ? 'Yes' : 'No',
                ];
            });

        return inertia('reports/BillingReport', [
            'reports' => $orders,
            'activeFilters' => $filters,
            'search' => $search,
            'customers' => Customer::select('id', 'name')->orderBy('name')->get(),
            'vehicles' => Vehicle::select('id', 'license_plate', 'name')->orderBy('license_plate')->get(),
            'states' => Order::states(),
            'partsBy' => Order::partsBy(),
        ]);
    }



    public function updateState(Request $request, Order $order)
    {
        $request->validate([
            'state' => 'required|string', // use your states
        ]);

        $order->update(['state' => $request->state]);

        return redirect()->back()->with('success', 'Order state updated!');
    }


    // New filter POST method
    public function filter(Request $request)
    {
        // Ensure filters/search are arrays/strings
        $filters = $request->input('filters', []);
        $search  = $request->input('search', '');

        // Store in session
        session([
            'orders.filters' => $filters,
            'orders.search'  => $search,
        ]);

        // Redirect to index
        return redirect()->route('orders.index');
    }

    public function filterBillingReport(Request $request)
    {
        // Ensure filters/search are arrays/strings
        $filters = $request->input('filters', []);
        $search  = $request->input('search', '');

        // Store in session
        session([
            'reports.billing.filters' => $filters,
            'reports.billing.search'  => $search,
        ]);

        // Redirect to index
        return redirect()->route('reports.billingReport');
    }
}
