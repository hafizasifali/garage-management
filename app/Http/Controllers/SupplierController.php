<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $suppliers = Supplier::query()
            ->when($request->search, fn ($q) =>
            $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%")
            )
            ->when($request->active !== null, fn ($q) =>
            $q->where('active', $request->active)
            )
            ->paginate($request->per_page ?? 50)
            ->withQueryString();

        return Inertia::render('suppliers/index', [
            'suppliers' => $suppliers,
            'filters' => $request->only(['search', 'active', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('suppliers/form', [
            'fields' => Supplier::fields(),
            'record' => null,
        ]);
    }

    public function edit(Supplier $supplier)
    {
        return Inertia::render('suppliers/form', [
            'fields' => Supplier::fields(),
            'record' => $supplier,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'active' => 'boolean',
        ]);

        $supplier = Supplier::create($data);

        return redirect()
            ->route('suppliers.edit', $supplier->id)
            ->with('success', 'Supplier created successfully.');
    }

    public function quickCreate(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'active' => 'boolean',
        ]);

        $supplier = Supplier::create($data);

        return response()->json([
            'id' => $supplier->id,
            'name' => $supplier->name,
            'label' => $supplier->name,
        ]);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'active' => 'boolean',
        ]);

        $supplier->update($data);

        return redirect()->back()->with('success', 'Supplier updated successfully.');
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->update(['active' => false]);

        return redirect()->back()->with('success', 'Supplier archived successfully.');
    }
}
