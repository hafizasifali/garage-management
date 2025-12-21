<?php

namespace App\Http\Controllers;

use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductCategoryController extends Controller
{
    /**
     * Display a listing of product categories.
     */
    public function index()
    {
        return Inertia::render('ProductCategories/Index', [
            'categories' => ProductCategory::with('parent')
                ->orderBy('name')
                ->get(),
        ]);
    }

    /**
     * Store a new product category.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'      => 'required|string|max:255',
            'parent_id' => 'nullable|exists:product_categories,id',
            'active'    => 'boolean',
        ]);

        ProductCategory::create([
            'name'      => $request->name,
            'parent_id' => $request->parent_id,
            'active'    => $request->active ?? true,
        ]);

        return redirect()->back()->with('success', 'Product category created successfully.');
    }

    /**
     * Update product category.
     */
    public function update(Request $request, ProductCategory $category)
    {
        $request->validate([
            'name'      => 'required|string|max:255',
            'parent_id' => 'nullable|exists:product_categories,id',
            'active'    => 'boolean',
        ]);

        $category->update($request->only('name', 'parent_id', 'active'));

        return redirect()->back()->with('success', 'Product category updated successfully.');
    }

    /**
     * Soft deactivate instead of delete.
     */
    public function destroy(ProductCategory $category)
    {
        if ($category->products()->exists() || $category->children()->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot deactivate category with products or subcategories.');
        }

        $category->update(['active' => false]);

        return redirect()->back()->with('success', 'Product category deactivated successfully.');
    }
}
