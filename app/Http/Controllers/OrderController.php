<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Order;
use App\Models\Customer;
use App\Models\Vehicle;
use App\Models\Employee;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
class OrderController extends Controller
{
    public function index()
    {
        $jobs = Order::with(['vehicle', 'lines.product'])->paginate(10);

        return Inertia::render('orders/index', [
            'jobs' => $jobs,
        ]);
    }

    public function create()
    {
        return Inertia::render('orders/form', [
            'customers' => Customer::select('id','name')->get(), // only customers,
            'vehicles' => Vehicle::all()->map(function($vehicle) {
                return [
                    'id' => $vehicle->id,
                    'name' => $vehicle->display_name, // computed field
                ];
            }),
            'employees' => Employee::all(),
            'products' => Product::all(),
            'states' => Order::states(),
            'fields' => Order::fields(),
            'customers_fields' => Customer::fields(),
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
                    'name' => $vehicle->display_name, // computed field
                ];
            }),
            'employees' => Employee::all(),
            'products' => Product::all(),
            'states' => Order::states(),
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
            'state' => 'required',

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
            'state' => 'required',
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

    public function salesReport()
    {
        $orders = Order::with(['lines'])->orderBy('order_date', 'desc')->where('id',0)->paginate(80);

        return Inertia::render('reports/SalesReport', [
            'reports' => $orders,
        ]);
    }       
}
