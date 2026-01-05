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
        $jobs = Order::with(['partner', 'vehicle', 'employees', 'lines.product'])->paginate(10);

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
            'partner_id' => 'required|exists:partners,id',
            'vehicle_id' => 'required|exists:vehicles,id',
            'job_date' => 'required|date',
            'state' => 'required|in:pending,in_progress,completed',
            'employees' => 'array',
            'employees.*' => 'exists:employees,id',
            'lines' => 'array',
            'lines.*.product_id' => 'required|exists:products,id',
            'lines.*.quantity' => 'required|numeric',
            'lines.*.unit_price' => 'nullable|numeric',
            'lines.*.tax' => 'nullable|numeric',
            'lines.*.discount' => 'nullable|numeric',
            'lines.*.subtotal' => 'nullable|numeric',
        ]);

        $job = Order::create($validated);

        if (isset($validated['employees'])) {
            $job->employees()->sync($validated['employees']);
        }

        if (isset($validated['lines'])) {
            foreach ($validated['lines'] as $line) {
                $job->lines()->create($line);
            }
        }

        return redirect()->route('garage-jobs.index')->with('success', 'Garage job created.');
    }

    public function update(Request $request, Order $garageJob)
    {
        $validated = $request->validate([
            'partner_id' => 'required|exists:partners,id',
            'vehicle_id' => 'required|exists:vehicles,id',
            'job_date' => 'required|date',
            'state' => 'required|in:pending,in_progress,completed',
            'employees' => 'array',
            'employees.*' => 'exists:employees,id',
            'lines' => 'array',
            'lines.*.product_id' => 'required|exists:products,id',
            'lines.*.quantity' => 'required|numeric',
            'lines.*.unit_price' => 'nullable|numeric',
            'lines.*.tax' => 'nullable|numeric',
            'lines.*.discount' => 'nullable|numeric',
            'lines.*.subtotal' => 'nullable|numeric',
        ]);

        $garageJob->update($validated);

        if (isset($validated['employees'])) {
            $garageJob->employees()->sync($validated['employees']);
        }

        if (isset($validated['lines'])) {
            // delete old lines and recreate
            $garageJob->lines()->delete();
            foreach ($validated['lines'] as $line) {
                $garageJob->lines()->create($line);
            }
        }

        return redirect()->route('garage-jobs.index')->with('success', 'Garage job updated.');
    }

    public function destroy(Order $garageJob)
    {
        $garageJob->lines()->delete();
        $garageJob->delete();

        return redirect()->route('garage-jobs.index')->with('success', 'Garage job deleted.');
    }
}
