<?php

namespace App\Http\Controllers;

use App\Models\Partner;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PartnerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Partners/Index', [
            'partners' => Partner::orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created resource.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'   => 'required|string|max:255',
            'type'   => 'required|in:walk-in,mr_lube,corporate',
            'email'  => 'nullable|email|max:255',
            'phone'  => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'active' => 'boolean',
        ]);

        Partner::create([
            'name'    => $request->name,
            'type'    => $request->type,
            'email'   => $request->email,
            'phone'   => $request->phone,
            'address' => $request->address,
            'active'  => $request->active ?? true,
        ]);

        return redirect()->back()->with('success', 'Customer created successfully.');
    }

    /**
     * Update the specified resource.
     */
    public function update(Request $request, Partner $partner)
    {
        $request->validate([
            'name'   => 'required|string|max:255',
            'type'   => 'required|in:walk-in,mr_lube,corporate',
            'email'  => 'nullable|email|max:255',
            'phone'  => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'active' => 'boolean',
        ]);

        $partner->update($request->only([
            'name',
            'type',
            'email',
            'phone',
            'address',
            'active',
        ]));

        return redirect()->back()->with('success', 'Customer updated successfully.');
    }

    /**
     * Soft deactivate instead of delete
     */
    public function destroy(Partner $partner)
    {
        if (
            $partner->garageJobs()->exists() ||
            $partner->invoices()->exists()
        ) {
            return redirect()->back()->with('error', 'Cannot deactivate customer with transactions.');
        }

        $partner->update(['active' => false]);

        return redirect()->back()->with('success', 'Customer deactivated successfully.');
    }
}
