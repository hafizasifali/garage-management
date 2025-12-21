<?php

namespace App\Http\Controllers;

use App\Models\Uom;
use App\Models\UomCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Uoms/Index', [
            'uoms' => Uom::with('category')->orderBy('name')->get(),
            'categories' => UomCategory::orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created resource.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'category_id' => 'required|exists:uom_categories,id',
            'factor'      => 'required|numeric|min:0.000001',
        ]);

        Uom::create($request->only([
            'name',
            'category_id',
            'factor',
        ]));

        return redirect()->back()->with('success', 'UOM created successfully.');
    }

    /**
     * Update the specified resource.
     */
    public function update(Request $request, Uom $uom)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'category_id' => 'required|exists:uom_categories,id',
            'factor'      => 'required|numeric|min:0.000001',
        ]);

        $uom->update($request->only([
            'name',
            'category_id',
            'factor',
        ]));

        return redirect()->back()->with('success', 'UOM updated successfully.');
    }

    /**
     * Remove the specified resource.
     */
    public function destroy(Uom $uom)
    {
        // Prevent delete if UOM is used by products
        if ($uom->products()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete UOM used by products.');
        }

        $uom->delete();

        return redirect()->back()->with('success', 'UOM deleted successfully.');
    }
}
