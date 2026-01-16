<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $customers = Customer::query()
            ->when($request->search, fn ($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                   ->orWhere('email', 'like', "%{$request->search}%")
            )
            ->when($request->active !== null, fn ($q) =>
                $q->where('active', $request->active)
            )
            ->paginate($request->per_page ?? 50)
            ->withQueryString();

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'active', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('customers/form', [
            'fields' => Customer::fields(),
            'record' => null,
        ]);
    }

    public function edit(Customer $customer)
    {
        return Inertia::render('customers/form', [
            'fields' => Customer::fields(),
            'record' => $customer,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'type' => 'required|in:individual,company',
        ]);


        $customer = Customer::create($data);

        return redirect()
            ->route('customers.edit', $customer->id)
            ->with('success', 'Customer created successfully.');
    }
    public function quickCreate(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'nullable|email',
            'phone'      => 'nullable|string|max:50',
            'address'    => 'nullable|string|max:255',
            'type'       => 'required|in:individual,company',
        ]);

        $customer = Customer::create($data);

        return response()->json([
            'id'    => $customer->id,
            'name'  => $customer->name,
            'label' => $customer->name,
        ]);
    }


    public function update(Request $request, Customer $customer)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'is_company' => 'boolean',
            'type' => 'required|in:individual,company',
        ]);

        $customer->update($data);

        return redirect()->back()->with('success', 'Customer updated successfully.');
    }

    public function destroy(Customer $customer)
    {
        $customer->update(['active' => false]);

        return redirect()->back()->with('success', 'Customer archived successfully.');
    }
}
