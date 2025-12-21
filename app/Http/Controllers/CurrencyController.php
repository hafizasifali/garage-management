<?php

namespace App\Http\Controllers;

use App\Models\Currency;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CurrencyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Currencies/Index', [
            'currencies' => Currency::orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created resource.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'   => 'required|string|max:50',
            'symbol' => 'required|string|max:10',
            'rate'   => 'required|numeric|min:0.000001',
        ]);

        Currency::create($request->only([
            'name',
            'symbol',
            'rate',
        ]));

        return redirect()->back()->with('success', 'Currency created successfully.');
    }

    /**
     * Update the specified resource.
     */
    public function update(Request $request, Currency $currency)
    {
        $request->validate([
            'name'   => 'required|string|max:50',
            'symbol' => 'required|string|max:10',
            'rate'   => 'required|numeric|min:0.000001',
        ]);

        $currency->update($request->only([
            'name',
            'symbol',
            'rate',
        ]));

        return redirect()->back()->with('success', 'Currency updated successfully.');
    }

    /**
     * Remove the specified resource.
     */
    public function destroy(Currency $currency)
    {
        // Prevent delete if used by companies
        if ($currency->companies()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete currency assigned to a company.');
        }

        $currency->delete();

        return redirect()->back()->with('success', 'Currency deleted successfully.');
    }
}
