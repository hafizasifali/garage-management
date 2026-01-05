<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Uom;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with(['category', 'uom'])
            ->when(
                $request->search,
                fn($q) =>
                $q->where('name', 'like', "%{$request->search}%")
            )
            ->when(
                $request->type,
                fn($q) =>
                $q->where('type', $request->type)
            )
            ->when(
                $request->active !== null,
                fn($q) =>
                $q->where('active', $request->active)
            )
            ->paginate($request->per_page ?? 50)
            ->withQueryString();

        return Inertia::render('products/index', [
            'products' => $products,
            'filters' => $request->only(['search', 'type', 'active', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('products/form', [
            'fields' => Product::fields(),
            'record' => null,
            'categories' => ProductCategory::select('id', 'name')->get(),
            'uoms' => Uom::select('id', 'name')->get(),
        ]);
    }

    public function edit(Product $product)
    {
        return Inertia::render('products/form', [
            'fields' => Product::fields(),
            'record' => $product,
            'categories' => ProductCategory::select('id', 'name')->get(),
            'uoms' => Uom::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'category_id' => 'required|exists:product_categories,id',
            'uom_id'      => 'required|exists:uoms,id',
            'type'        => 'required|in:product,service',
            'cost_price'  => 'nullable|numeric',
            'sale_price'  => 'required|numeric',
            'active'      => 'boolean',
        ]);

        $product = Product::create($data);

        return redirect()
            ->route('products.edit', $product->id)
            ->with('success', 'Product created successfully.');
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'category_id' => 'required|exists:product_categories,id',
            'uom_id'      => 'required|exists:uoms,id',
            'type'        => 'required|in:product,service',
            'cost_price'  => 'nullable|numeric',
            'sale_price'  => 'required|numeric',
            'active'      => 'boolean',
        ]);

        $product->update($data);

        return redirect()->back()->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        $product->update(['active' => false]);

        return redirect()->back()->with('success', 'Product deactivated successfully.');
    }
}
