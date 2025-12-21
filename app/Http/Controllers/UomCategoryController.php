<?php

namespace App\Http\Controllers;

use App\Models\UomCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UomCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('UomCategories/Index', [
            'categories' => UomCategory::orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created resource.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        UomCategory::create($request->only('name'));

        return redirect()->back()->with('success', 'UOM Category created successfully.');
    }

    /**
     * Update the specified resource.
     */
    public function update(Request $request, UomCategory $uomCategory)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $uomCategory->update($request->only('name'));

        return redirect()->back()->with('success', 'UOM Category updated successfully.');
    }

    /**
     * Remove the specified resource.
     */
    public function destroy(UomCategory $uomCategory)
    {
        // Prevent delete if used
        if ($uomCategory->uoms()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete category with UOMs.');
        }

        $uomCategory->delete();

        return redirect()->back()->with('success', 'UOM Category deleted.');
    }
}
