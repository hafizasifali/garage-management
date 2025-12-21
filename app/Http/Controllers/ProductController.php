<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Uom;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render('Products/Index', [
            'products'   => Product::with(['category', 'uom'])->orderBy('name')->get(),
            'categories' => ProductCategory::orderBy('name')->get(),
            'uoms'       => Uom::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'category_id' => 'required|exists:product_categories,id',
            'uom_id'      => 'required|exists:uoms,id',
            'cost_price'  => 'required|numeric|min:0',
            'sale_price'  => 'required|numeric|min:0',
            'type'        => 'nullable|string|max:50',
        ]);

        Product::create($request->all());

        return redirect()->back()->with('success', 'Product created successfully.');
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'category_id' => 'required|exists:product_categories,id',
            'uom_id'      => 'required|exists:uoms,id',
            'cost_price'  => 'required|numeric|min:0',
            'sale_price'  => 'required|numeric|min:0',
            'type'        => 'nullable|string|max:50',
        ]);

        $product->update($request->all());

        return redirect()->back()->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        if ($product->garageJobLines()->exists() || $product->invoiceLines()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete product used in jobs or invoices.');
        }

        $product->delete();

        return redirect()->back()->with('success', 'Product deleted successfully.');
    }
}
