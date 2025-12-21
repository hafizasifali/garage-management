<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\GarageJob;
use App\Models\GarageJobLine;
use App\Models\Partner;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GarageJobController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('GarageJobs/Index', [
            'jobs'      => GarageJob::with(['partner', 'vehicle', 'employees', 'lines.product'])
                ->orderBy('job_date', 'desc')
                ->get(),
            'partners'  => Partner::where('active', true)->get(),
            'vehicles'  => Vehicle::where('active', true)->get(),
            'employees' => Employee::whereNotNull('id')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Return an Inertia page with the form
        return Inertia::render('GarageJobs/Create', [
            'partners'  => Partner::where('active', true)->get(),
            'vehicles'  => Vehicle::where('active', true)->get(),
            'employees' => Employee::all(),
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'garage_job_id' => 'required|exists:garage_jobs,id',
            'product_id'    => 'required|exists:products,id',
            'quantity'      => 'required|numeric|min:0.01',
            'unit_price'    => 'required|numeric|min:0',
            'tax'           => 'nullable|numeric|min:0',
            'discount'      => 'nullable|numeric|min:0',
        ]);

        $subtotal = ($request->quantity * $request->unit_price) + ($request->tax ?? 0) - ($request->discount ?? 0);

        GarageJobLine::create([
            'garage_job_id' => $request->garage_job_id,
            'product_id'    => $request->product_id,
            'quantity'      => $request->quantity,
            'unit_price'    => $request->unit_price,
            'tax'           => $request->tax ?? 0,
            'discount'      => $request->discount ?? 0,
            'subtotal'      => $subtotal,
        ]);

        return redirect()->back()->with('success', 'Job line added successfully.');
    }
    /**
     * Display the specified resource.
     */
    public function show(GarageJob $garageJob)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(GarageJob $garageJob)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, GarageJobLine $garageJobLine)
    {
        $request->validate([
            'quantity'   => 'required|numeric|min:0.01',
            'unit_price' => 'required|numeric|min:0',
            'tax'        => 'nullable|numeric|min:0',
            'discount'   => 'nullable|numeric|min:0',
        ]);

        $garageJobLine->update([
            'quantity'   => $request->quantity,
            'unit_price' => $request->unit_price,
            'tax'        => $request->tax ?? 0,
            'discount'   => $request->discount ?? 0,
            'subtotal'   => ($request->quantity * $request->unit_price) + ($request->tax ?? 0) - ($request->discount ?? 0),
        ]);

        return redirect()->back()->with('success', 'Job line updated successfully.');
    }



    /**
     * Remove the specified resource from storage.
     */
    public function destroy(GarageJob $garageJob)
    {
        //
    }
}
