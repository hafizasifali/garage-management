<?php

namespace App\Http\Controllers;

use App\Mail\OrderInvoiceMail;
use App\Models\Company;
use App\Models\CustomerPrice;
use App\Models\Order;
use App\Models\Customer;
use App\Models\CustomerGroup;
use App\Models\Vehicle;
use App\Models\Employee;
use App\Models\Product;
use App\Support\QueryFilter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
class OrderController extends Controller
{

    public function index(Request $request)
    {
        $from = Carbon::now()->startOfWeek(Carbon::SUNDAY)->format('Y-m-d');
        $to = Carbon::now()->format('Y-m-d');
        $defaultFilters = [
            ['field' => 'order_date_from','label' => 'From', 'operator' => '>=', 'value' => $from],
            ['field' => 'order_date_to',   'label' => 'To', 'operator' => '<=', 'value' => $to],
        ];
        $filters = session('orders.filters', $defaultFilters);
        $search  = session('orders.search', '');
        $sort    = session('orders.sort', 'id_desc');

        $query = Order::query()->with([
            'customer:id,name',
            'vehicle:id,license_plate,name',
        ]);

        // Remap virtual date fields to real column before applying
        $mappedFilters = collect($filters)->map(function ($rule) {
            if ($rule['field'] === 'order_date_from') {
                return array_merge($rule, ['field' => 'order_date', 'operator' => '>=']);
            }
            if ($rule['field'] === 'order_date_to') {
                return array_merge($rule, ['field' => 'order_date', 'operator' => '<=']);
            }
            return $rule;
        })->toArray();

        // Apply structured filters
        $query = QueryFilter::apply($query, $mappedFilters);

        // Apply global search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%$search%")
                    ->orWhere('vehicle_name', 'like', "%$search%")
                    ->orWhere('vehicle_license_plate', 'like', "%$search%");
            });
        }

        // Apply sorting
        switch ($sort) {
            case 'id_asc':
                $query->orderBy('id', 'asc');
                break;
            case 'id_desc':
                $query->orderBy('id', 'desc');
                break;
            case 'order_date_asc':
                $query->orderBy('order_date', 'asc');
                break;
            case 'order_date_desc':
                $query->orderBy('order_date', 'desc');
                break;
            case 'customer_name_asc':
                $query->orderBy('customer_name', 'asc');
                break;
            case 'customer_name_desc':
                $query->orderBy('customer_name', 'desc');
                break;
            default:
                $query->latest();
        }

        // Cascading vehicle filter
        $customerId = collect($filters)->firstWhere('field', 'customer_id')['value'] ?? null;
        $vehicle_license_plates = Order::whereNotNull('vehicle_license_plate')
                ->where('vehicle_license_plate', '!=', '')
                ->distinct()
                ->pluck('vehicle_license_plate')
                ->sort()
                ->values();

        return inertia('orders/index', [
            'orders' => $query->paginate(80),
            'activeFilters' => $filters,
            'search' => $search,
            'sort' => $sort,
            'vehicle_license_plates'=> $vehicle_license_plates,
            'customers' => Customer::select('id', 'name')->orderBy('name')->get(),
            'states' => Order::states(),
            'partsBy' => Order::partsBy(),
        ]);
    }


    public function create()
    {
        $products = Product::all();
        // Load customer prices
        $customerPrices = CustomerPrice::all()->mapWithKeys(function($cp) {
            return [
                $cp->customer_id.'_'.$cp->product_id => $cp->price
            ];
        });

        // Distinct makes from past orders
    $vehicleMakes = Order::whereNotNull('vehicle_make')
        ->where('vehicle_make', '!=', '')
        ->distinct()
        ->pluck('vehicle_make')
        ->sort()
        ->values();

    // All make→models grouped
    $vehicleModels = Order::whereNotNull('vehicle_make')
        ->whereNotNull('vehicle_model')
        ->where('vehicle_model', '!=', '')
        ->select('vehicle_make', 'vehicle_model')
        ->distinct()
        ->get()
        ->groupBy('vehicle_make')
        ->map(fn($rows) => $rows->pluck('vehicle_model')->sort()->values());

        $tz=config('app.timezone', 'UTC');
        $currentDate = now()->setTimezone($tz)->format('Y-m-d');

        return Inertia::render('orders/form', [
            'customers' => Customer::select('id','name', 'email', 'phone', 'address')->get(), // only customers,
            'customer_groups' => CustomerGroup::select('id','name')->get(),
            'vehicles' => Vehicle::all()->map(function($vehicle) {
                return [
                    'id' => $vehicle->id,
                    'customer_id'=>$vehicle->customer_id,
                    'name' => $vehicle->name, // computed field
                ];
            }),
            'employees' => Employee::all(),
            'products' => $products,
            'states' => Order::states(),
            'parts_by' => Order::partsBy(),
            'fields' => Order::fields(),
            'customers_fields' => Customer::fields(),
            'vehicles_fields' => Vehicle::fields(),
            'customer_prices' => $customerPrices, // new
            'vehicle_license_plates' => Order::whereNotNull('vehicle_license_plate')
                ->where('vehicle_license_plate', '!=', '')
                ->distinct()
                ->pluck('vehicle_license_plate')
                ->sort()
                ->values(),
            'record' => null,
            'vehicle_makes'  => $vehicleMakes,
            'vehicle_models' => $vehicleModels,
            'current_date' => $currentDate,
        ]);
    }

    public function edit(Order $order)
    {
        $order->load(['lines']);

        $products = Product::all();
        // Load customer prices
        $customerPrices = CustomerPrice::all()->mapWithKeys(function($cp) {
            return [
                $cp->customer_id.'_'.$cp->product_id => $cp->price
            ];
        });

        return Inertia::render('orders/edit', [
            'customers' => Customer::select('id','name', 'email', 'phone', 'address')->get(),
            'vehicles' => Vehicle::all()->map(function($vehicle) {
                return [
                    'id' => $vehicle->id,
                    'customer_id'=> $vehicle->customer_id,
                    'name' => $vehicle->display_name, // computed field
                ];
            }),
            'employees' => Employee::all(),
            'products' => $products,
            'states' => Order::states(),
            'parts_by' => Order::partsBy(),
            'fields' => Order::editFields(),
            'customer_prices' => $customerPrices,
            'vehicle_license_plates' => Order::whereNotNull('vehicle_license_plate')
                ->where('vehicle_license_plate', '!=', '')
                ->distinct()
                ->pluck('vehicle_license_plate')
                ->sort()
                ->values(),
            'record' => $order,
        ]);
    }

    public function store(Request $request)
    {
        
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            // 'vehicle_id' => 'required|exists:vehicles,id',
            'vehicle_model' => 'nullable',
            'vehicle_year'=>'nullable',
            'vehicle_make'=>'nullable',
            'vehicle_license_plate' => 'nullable',
            'order_date' => 'required|date',
            'state' => 'required',
            'parts_by' => 'nullable',
            'is_brake_fluid_order' => 'boolean',
            'note'=>'nullable',
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
        // $vehicle = Vehicle::find($validated['vehicle_id']);
//         if ($vehicle) {
//             $validated['vehicle_name'] = $vehicle->name;
// //            $validated['vehicle_model'] = $vehicle->model;
// //            $validated['vehicle_license_plate'] = $vehicle->license_plate;
// //            $validated['vehicle_vin'] = $vehicle->vin;
//         }
        $validated['vehicle_name']= $validated['vehicle_make'] . ' ' . $validated['vehicle_model'];
        $tz = config('app.timezone', 'UTC');
        $order_date = Carbon::parse($validated['order_date'])->setTimezone($tz)->format('Y-m-d');

        $order = Order::create([
            'customer_id' => $customer->id,
            'customer_name' => $customer->name,
            'customer_email' => $customer->email,
            'customer_phone' => $customer->phone,
            'customer_address' => $customer->address,

            // 'vehicle_id' => $validated['vehicle_id'],
            'vehicle_name' => $validated['vehicle_name']?? null,
            'vehicle_model'=> $validated['vehicle_model']?? null,
            'vehicle_year'=> $validated['vehicle_year']?? null,
            'vehicle_make'=> $validated['vehicle_make']?? null,
            'vehicle_license_plate' => $validated['vehicle_license_plate']?? null,
            'vehicle_vin' => $validated['vehicle_vin']?? null,
            'note'=>$validated['note']?? null,
            'order_date' => $order_date,
            'parts_by'=> $validated['parts_by']?? null,
            'is_brake_fluid_order' => $validated['is_brake_fluid_order'] ?? false,
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
            ->route('orders.edit',$order->id)
            ->with('success', 'Order created successfully.');
    }


    public function update(Request $request, Order $order)
    {
       
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'customer_email' => 'nullable|email|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'customer_address' => 'nullable|string|max:500',
            'vehicle_model' => 'nullable',
            'vehicle_year'=>'nullable',
            'vehicle_make'=>'nullable',
            'vehicle_license_plate' => 'nullable',
            // 'vehicle_vin' => 'nullable',
            'note' => 'nullable',
            'order_date' => 'required|date',
            'parts_by' => 'nullable',
            'is_brake_fluid_order' => 'boolean',
            'is_revised_invoice' => 'nullable',
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
     $validated['vehicle_name']= $validated['vehicle_make'] . ' ' . $validated['vehicle_model'];
     $tz = config('app.timezone', 'UTC');
     $validated['order_date'] = Carbon::parse($validated['order_date'])->setTimezone($tz)->format('Y-m-d');
     $customer = Customer::findOrFail($validated['customer_id']);
     $order->update([
            'customer_name' => $customer->name,
            'customer_email' => $customer->email ?? null,
            'customer_phone' => $customer->phone ?? null,
            'customer_address' => $customer->address ?? null,
            'vehicle_name' => $validated['vehicle_name']?? null,
            'vehicle_model'=> $validated['vehicle_model']?? null,
            'vehicle_year'=> $validated['vehicle_year']?? null,
            'vehicle_make'=> $validated['vehicle_make']?? null,
            'vehicle_license_plate'=> $validated['vehicle_license_plate'],
            // 'vehicle_vin'=> $validated['vehicle_vin'],
            'note'=>$validated['note']?? null,
            'order_date' => $validated['order_date'],
            'parts_by' => $validated['parts_by'],
            'state' => $validated['state'],
            'is_brake_fluid_order' => $validated['is_brake_fluid_order'] ?? false,
            'is_revised_invoice' => $request->boolean('is_revised_invoice'),        ]);

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
            ->route('orders.edit',$order->id)
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
        $order = Order::with(['lines','customer'])->findOrFail($id);
        $company=Company::first();

        $pdf = Pdf::loadView('invoices.order', compact('order','company'));
        return $pdf->stream("invoice_order_{$order->id}.pdf"); // opens in browser
//        return $pdf->download("invoice_order_{$order->id}.pdf");
    }


    public function sendInvoice(Order $order)
    {
        $order->load('lines', 'customer');
        $company = Company::first();

        $pdf = Pdf::loadView('invoices.order', compact('order', 'company'));

        Mail::to($order->customer_email)
            ->send(new OrderInvoiceMail($order, $company, $pdf->output()));

        $order->update(['state' => 'invoiced']);
        return redirect()->back()->with('success', 'Invoice sent successfully.');
    }

    public function billingReport(Request $request)
    {
        $from = Carbon::now()->startOfWeek(Carbon::SUNDAY)->format('Y-m-d');
        $to = Carbon::now()->format('Y-m-d');
        $defaultFilters = [
            ['field' => 'order_date_from', 'label' => 'From', 'operator' => '>=', 'value' => $from],
            ['field' => 'order_date_to',   'label' => 'To', 'operator' => '<=', 'value' => $to],
        ];
        $filters = session('reports.billing.filters', $defaultFilters);
        $search  = session('reports.billing.search', '');
        $sort    = session('reports.billing.sort', 'order_date_desc');

        /** @var \App\Models\User|null $user */
        $user = $request->user();

        $query = Order::query()->where('is_brake_fluid_order', false);

        if ($user && $user->groups()->exists()) {
            $customerIds = $user->accessibleCustomers()->pluck('id')->toArray();
            $query->whereIn('customer_id', $customerIds);
        }

        $query->with([
            'lines.product',
            'vehicle',
            'customer',
        ]);

        // Remap virtual date fields to real column before applying
        $mappedFilters = collect($filters)->map(function ($rule) {
            if ($rule['field'] === 'order_date_from') {
                return array_merge($rule, ['field' => 'order_date', 'operator' => '>=']);
            }
            if ($rule['field'] === 'order_date_to') {
                return array_merge($rule, ['field' => 'order_date', 'operator' => '<=']);
            }
            return $rule;
        })->toArray();

        // Apply structured filters
        $query = QueryFilter::apply($query, $mappedFilters);

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

        // Apply sorting
        switch ($sort) {
            case 'order_date_asc':
                $query->orderBy('order_date', 'asc');
                break;
            case 'order_date_desc':
                $query->orderBy('order_date', 'desc');
                break;
            case 'customer_name_asc':
                $query->orderBy('customer_name', 'asc');
                break;
            case 'customer_name_desc':
                $query->orderBy('customer_name', 'desc');
                break;
            case 'license_plate_asc':
                $query->orderBy('vehicle_license_plate', 'asc');
                break;
            case 'license_plate_desc':
                $query->orderBy('vehicle_license_plate', 'desc');
                break;
            case 'invoice_total_asc':
                $query->orderBy('total_amount', 'asc');
                break;
            case 'invoice_total_desc':
                $query->orderBy('total_amount', 'desc');
                break;
            default:
                $query->orderBy('order_date', 'desc');
        }

        $orders = $query
            ->paginate(80)
            ->through(function ($order) {

                $partsLines = $order->lines->filter(fn ($l) => $l->product?->type === 'product');
                $labourLines = $order->lines->filter(fn ($l) => $l->product?->type === 'service');

                $brakeFluidLines = $order->lines->filter(fn ($l) =>$l->product?->type === 'consumable');

                $otherLines = $order->lines->diff($partsLines)->diff($labourLines);

                $partsCost = $partsLines->sum('subtotal');
                $labourTotal = $labourLines->sum('subtotal');
                $labourPerHour = $labourLines->avg('unit_price') ?? 0;
                $hours=$labourLines->sum('quantity');
                $brakeFluidCost = $brakeFluidLines->sum('subtotal');
                $otherCost = 0;

                return [
                    'id' => $order->id,
                    'date' => optional($order->order_date)->format('Y-m-d'),
                    'invoice_number' => $order->customer->shop_no.'-'. date('ymd',strtotime($order->order_date)).'-'.$order->id,
                    'license_plate' => $order->vehicle_license_plate ?? $order->vehicle?->license_plate ?? '-',
                    'description' => $order->lines->pluck('product.name')->filter()->implode(', '),
                    'parts_cost' => round($partsCost, 2),
                    'brake_fluid_cost' => round($brakeFluidCost, 2),
                    'mention' => '',
                    'other_cost' => round($otherCost, 2),
                    'hours'=>$hours,
                    'labour_per_hour' => round($labourPerHour, 2),
                    'total_labour' => round($labourTotal, 2),
                    'subtotal' => round($partsCost + $labourTotal, 2),
                    'parts' => round($partsCost, 2),
                    'hst' => round($order->total_tax ?? 0, 2),
                    'invoice_total' => round($order->total_amount ?? ($partsCost + $labourTotal + ($order->total_tax ?? 0)), 2),
                    'parts_by' => $order->parts_by === 'us' ? 'Yes' : 'No',
                    'note' => $order->note,
                ];
            });

        $customers = Customer::select('id', 'name')
            ->when($user && $user->groups()->exists(), function ($q) use ($user) {
                $groupIds = $user->groups()->pluck('customer_groups.id')->toArray();
                $q->whereIn('customer_group_id', $groupIds);
            })
            ->orderBy('name')
            ->get();

        return inertia('reports/BillingReport', [
            'reports' => $orders,
            'activeFilters' => $filters,
            'search' => $search,
            'sort' => $sort,
            'customers' => $customers,
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
        // Ensure filters/search/sort are arrays/strings
        $filters = $request->input('filters', []);
        $search  = $request->input('search', '');
        $sort    = $request->input('sort', 'id_desc');

        // Store in session
        session([
            'orders.filters' => $filters,
            'orders.search'  => $search,
            'orders.sort'    => $sort,
        ]);

        // Redirect to index
        return redirect()->route('orders.index');
    }

    public function filterBillingReport(Request $request)
    {
        // Ensure filters/search/sort are arrays/strings
        $filters = $request->input('filters', []);
        $search  = $request->input('search', '');
        $sort    = $request->input('sort', 'order_date_desc');

        // Store in session
        session([
            'reports.billing.filters' => $filters,
            'reports.billing.search'  => $search,
            'reports.billing.sort'    => $sort,
        ]);

        // Redirect to index
        return redirect()->route('reports.billingReport');
    }

    public function brakeFluidBillingReport(Request $request)
    {
        $from = Carbon::now()->startOfWeek(Carbon::SUNDAY)->format('Y-m-d');
        $to = Carbon::now()->format('Y-m-d');
        $defaultFilters = [
            ['field' => 'order_date_from', 'label' => 'From', 'operator' => '>=', 'value' => $from],
            ['field' => 'order_date_to',   'label' => 'To', 'operator' => '<=', 'value' => $to],
        ];
        $filters = session('reports.brake_fluid_billing.filters', $defaultFilters);
        $search  = session('reports.brake_fluid_billing.search', '');
        $sort    = session('reports.brake_fluid_billing.sort', 'order_date_desc');

        /** @var \App\Models\User|null $user */
        $user = $request->user();

        $query = Order::query()->where('is_brake_fluid_order', true);

        if ($user && $user->groups()->exists()) {
            $groupIds = $user->groups()->pluck('customer_groups.id')->toArray();
            $query->whereHas('customer', fn ($q) => $q->whereIn('customer_group_id', $groupIds));
        }

        $query->with([
            'lines.product',
            'vehicle',
            'customer',
        ]);


        // Remap virtual date fields to real column before applying
        $mappedFilters = collect($filters)->map(function ($rule) {
            if ($rule['field'] === 'order_date_from') {
                return array_merge($rule, ['field' => 'order_date', 'operator' => '>=']);
            }
            if ($rule['field'] === 'order_date_to') {
                return array_merge($rule, ['field' => 'order_date', 'operator' => '<=']);
            }
            return $rule;
        })->toArray();

        // Apply structured filters
        $query = QueryFilter::apply($query, $mappedFilters);

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

        // Apply sorting
        switch ($sort) {
            case 'order_date_asc':
                $query->orderBy('order_date', 'asc');
                break;
            case 'order_date_desc':
                $query->orderBy('order_date', 'desc');
                break;
            case 'customer_name_asc':
                $query->orderBy('customer_name', 'asc');
                break;
            case 'customer_name_desc':
                $query->orderBy('customer_name', 'desc');
                break;
            case 'license_plate_asc':
                $query->orderBy('vehicle_license_plate', 'asc');
                break;
            case 'license_plate_desc':
                $query->orderBy('vehicle_license_plate', 'desc');
                break;
            default:
                $query->orderBy('order_date', 'desc');
        }

        $orders = $query
            ->paginate(80)
            ->through(function ($order) {

                
                return [
                    'date' => optional($order->order_date)->format('F j, Y'),
                    'customer_name' => $order->customer_name,
                    'invoice_number' => $order->customer->shop_no.'-'. date('ymd',strtotime($order->order_date)).'-'.$order->id,
                    'license_plate' => $order->vehicle_license_plate ?? $order->vehicle?->license_plate ?? '-',
                    'brake_fluid_cost' => round($order->lines->sum('subtotal'), 2),
                    'hst' => round($order->total_tax, 2),
                    'grand_total' => round($order->total_amount, 2),
                ];
            });

        $customers = Customer::select('id', 'name')
            ->when($user && $user->groups()->exists(), function ($q) use ($user) {
                $groupIds = $user->groups()->pluck('customer_groups.id')->toArray();
                $q->whereIn('customer_group_id', $groupIds);
            })
            ->orderBy('name')
            ->get();

        return inertia('reports/BrakeFluidBillingReport', [
            'reports' => $orders,
            'activeFilters' => $filters,
            'search' => $search,
            'sort' => $sort,
            'customers' => $customers,
            'vehicles' => Vehicle::select('id', 'license_plate', 'name')->orderBy('license_plate')->get(),
        ]);
    }


    public function filterBrakeFluidBillingReport(Request $request)
    {
        // Ensure filters/search/sort are arrays/strings
        $filters = $request->input('filters', []);
        $search  = $request->input('search', '');
        $sort    = $request->input('sort', 'order_date_desc');

        // Store in session
        session([
            'reports.brake_fluid_billing.filters' => $filters,
            'reports.brake_fluid_billing.search'  => $search,
            'reports.brake_fluid_billing.sort'    => $sort,
        ]);

        // Redirect to index
        return redirect()->route('reports.brakeFluidBillingReport');
    }   
}
