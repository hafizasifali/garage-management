<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\Partner;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Vehicles/Index', [
            'vehicles' => Vehicle::with('partner')->orderBy('id', 'desc')->get(),
            'partners' => Partner::where('active', true)->orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created resource.
     */
    public function store(Request $request)
    {
        $request->validate([
            'partner_id'    => 'required|exists:partners,id',
            'license_plate' => 'nullable|string|max:50',
            'model'         => 'nullable|string|max:255',
            'year'          => 'nullable|integer|min:1900|max:' . date('Y'),
            'active'        => 'boolean',
        ]);

        Vehicle::create([
            'partner_id'    => $request->partner_id,
            'license_plate' => $request->license_plate,
            'model'         => $request->model,
            'year'          => $request->year,
            'active'        => $request->active ?? true,
        ]);

        return redirect()->back()->with('success', 'Vehicle added successfully.');
    }

    /**
     * Update the specified resource.
     */
    public function update(Request $request, Vehicle $vehicle)
    {
        $request->validate([
            'partner_id'    => 'required|exists:partners,id',
            'license_plate' => 'nullable|string|max:50',
            'model'         => 'nullable|string|max:255',
            'year'          => 'nullable|integer|min:1900|max:' . date('Y'),
            'active'        => 'boolean',
        ]);

        $vehicle->update($request->only([
            'partner_id',
            'license_plate',
            'model',
            'year',
            'active',
        ]));

        return redirect()->back()->with('success', 'Vehicle updated successfully.');
    }

    /**
     * Soft deactivate instead of delete
     */
    public function destroy(Vehicle $vehicle)
    {
        if ($vehicle->garageJobs()->exists()) {
            return redirect()->back()->with('error', 'Cannot deactivate vehicle with service history.');
        }

        $vehicle->update(['active' => false]);

        return redirect()->back()->with('success', 'Vehicle deactivated successfully.');
    }
}
