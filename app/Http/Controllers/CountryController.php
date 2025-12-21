<?php

namespace App\Http\Controllers;

use App\Models\Country;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CountryController extends Controller
{
    public function index()
    {
        return Inertia::render('Countries/Index', [
            'countries' => Country::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'   => 'required|string|max:255',
            'code'   => 'nullable|string|max:5',
            'active' => 'boolean',
        ]);

        Country::create([
            'name'   => $request->name,
            'code'   => $request->code,
            'active' => $request->active ?? true,
        ]);

        return redirect()->back()->with('success', 'Country created successfully.');
    }

    public function update(Request $request, Country $country)
    {
        $request->validate([
            'name'   => 'required|string|max:255',
            'code'   => 'nullable|string|max:5',
            'active' => 'boolean',
        ]);

        $country->update($request->only('name', 'code', 'active'));

        return redirect()->back()->with('success', 'Country updated successfully.');
    }

    /**
     * Soft deactivate instead of delete
     */
    public function destroy(Country $country)
    {
        if ($country->companies()->exists()) {
            return redirect()->back()->with('error', 'Cannot deactivate country in use.');
        }

        $country->update(['active' => false]);

        return redirect()->back()->with('success', 'Country deactivated successfully.');
    }
}
