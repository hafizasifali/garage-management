<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\Partner;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $vehicles = Vehicle::with('partner')
            ->when($request->search, fn($q) =>
                $q->where('license_plate', 'like', "%{$request->search}%")
                  ->orWhere('model', 'like', "%{$request->search}%")
            )
            ->when($request->active !== null, fn($q) =>
                $q->where('active', $request->active)
            )
            ->paginate($request->per_page ?? 50)
            ->withQueryString();

        return Inertia::render('vehicles/index', [
            'vehicles' => $vehicles,
            'filters' => $request->only(['search', 'active', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('vehicles/form', [
            'fields' => Vehicle::fields(),
            'record' => null,
            'partners' => Partner::select('id', 'name')->get(),
        ]);
    }

    public function edit(Vehicle $vehicle)
    {
        return Inertia::render('vehicles/form', [
            'fields' => Vehicle::fields(),
            'record' => $vehicle,
            'partners' => Partner::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'partner_id' => 'required|exists:partners,id',
            'license_plate' => 'required|string|max:20',
            'model' => 'required|string|max:255',
            'year' => 'nullable|integer',
            'active' => 'boolean',
        ]);

        $vehicle = Vehicle::create($request->only([
            'partner_id', 'license_plate', 'model', 'year', 'active'
        ]));

        return redirect()
            ->route('vehicles.edit', $vehicle->id)
            ->with('success', 'Vehicle created successfully.');
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        $request->validate([
            'partner_id' => 'required|exists:partners,id',
            'license_plate' => 'required|string|max:20',
            'model' => 'required|string|max:255',
            'year' => 'nullable|integer',
            'active' => 'boolean',
        ]);

        $vehicle->update($request->only([
            'partner_id', 'license_plate', 'model', 'year', 'active'
        ]));

        return redirect()->back()->with('success', 'Vehicle updated successfully.');
    }

    public function destroy(Vehicle $vehicle)
    {
        $vehicle->update(['active' => false]);

        return redirect()->back()->with('success', 'Vehicle deactivated successfully.');
    }
}
