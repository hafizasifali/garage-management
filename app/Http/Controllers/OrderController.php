<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Customer;
use App\Models\Vehicle;
use App\Models\Employee;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

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

    public function edit(Order $garageJob)
    {
        $garageJob->load(['lines', 'employees']);

        return Inertia::render('orders/form', [
            'customers' => Customer::select('id','name')->get(),
            'vehicles' => Vehicle::all()->map(function($vehicle) {
                return [
                    'id' => $vehicle->id,
                    'name' => $vehicle->display_name, // computed field
                ];
            }),
            'employees' => Employee::all(),
            'products' => Product::all(),
            'record' => $garageJob,
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
            'lines' => 'array',
            'lines.*.product_id' => 'required|exists:products,id',
            'lines.*.employee_id' => 'nullable|exists:employees,id',
            'lines.*.quantity' => 'required|numeric',
            'lines.*.unit_price' => 'nullable|numeric',
            'lines.*.tax' => 'nullable|numeric',
            'lines.*.discount' => 'nullable|numeric',
            'lines.*.subtotal' => 'nullable|numeric',
        ]);

        $customer = Customer::find($validated['customer_id']);
        if ($customer) {
            $validated['customer_name'] = $customer->name;
            $validated['customer_email'] = $customer->email;
            $validated['customer_phone'] = $customer->phone;
            $validated['customer_address'] = $customer->address;
        }
        $vehicle = Vehicle::find($validated['vehicle_id']);
        if ($vehicle) {
            $validated['vehicle_name'] = $vehicle->name;
            $validated['vehicle_model'] = $vehicle->model;
            $validated['vehicle_license_plate'] = $vehicle->license_plate;
            $validated['vehicle_vin'] = $vehicle->vin;
        }

        $order = Order::create($validated);

        if (isset($validated['employees'])) {
            $order->employees()->sync($validated['employees']);
        }

        if (isset($validated['lines'])) {
            foreach ($validated['lines'] as $line) {
                $order->lines()->create($line);
            }
            $order->total_amount = $order->lines->sum('subtotal');
            $order->total_tax = $order->lines->sum('unit_price') * 0.13; // assuming 13% tax
            $order->total_discount = $order->lines->sum('discount');
        }

        return redirect()->route('orders.index')->with('success', 'Order created.');
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            // 'customer_id' => 'required|exists:customers,id',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'customer_address' => 'nullable|string|max:500',
            'vehicle_id' => 'required|exists:vehicles,id',
            'order_date' => 'required|date',
            'state' => 'required',
            'employees' => 'array',
            'employees.*' => 'exists:employees,id',
            'lines' => 'array',
            'lines.*.product_id' => 'required|exists:products,id',
            'lines.*.quantity' => 'required|numeric',
            'lines.*.unit_price' => 'nullable|numeric',
            'lines.*.employee_id' => 'nullable|exists:employees,id',
            'lines.*.tax' => 'nullable|numeric',
            'lines.*.discount' => 'nullable|numeric',
            'lines.*.subtotal' => 'nullable|numeric',
        ]);

        $order->update($validated);

        if (isset($validated['employees'])) {
            $order->employees()->sync($validated['employees']);
        }

        if (isset($validated['lines'])) {
            // delete old lines and recreate
            $order->lines()->delete();
            foreach ($validated['lines'] as $line) {
                $order->lines()->create($line);
            }
        }

        return redirect()->route('orders.index')->with('success', 'Order updated.');
    }

    public function destroy(Order $order)
    {
        $order->lines()->delete();
        $order->delete();

        return redirect()->route('orders.index')->with('success', 'Order deleted.');
    }
}
