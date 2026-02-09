<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Country;
use App\Models\Currency;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $companies = Company::with(['country', 'currency'])
            ->when(
                $request->search,
                fn($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%")
            )
            ->when(
                $request->active !== null,
                fn($q) =>
                $q->where('active', $request->active)
            )
            ->paginate($request->per_page ?? 80)
            ->withQueryString();

        return Inertia::render('companies/index', [
            'companies' => $companies,
            'filters' => $request->only(['search', 'active', 'per_page']),
        ]);
    }


    public function create()
    {
        return inertia('companies/form', [
            'fields' => Company::fields(),
            'record' => null,
            'countries' => Country::select('id', 'name')->get(),
            'currencies' => Currency::select('id', 'name')->get(),
        ]);
    }

    public function edit(Company $company)
    {
        return inertia('companies/form', [
            'fields' => Company::fields(),
            'record' => $company,
            'countries' => Country::select('id', 'name')->get(),
            'currencies' => Currency::select('id', 'name')->get(),
        ]);
    }

    /**
     * Store a newly created resource.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'address'     => 'nullable|string|max:255',
            'logo'        => 'nullable|image|max:2048',
            'email'       => 'nullable|email|max:255',
            'phone'       => 'nullable|string|max:50',
            'mobile'      => 'nullable|string|max:50',
            'website' => 'nullable|string|max:255',
            'vat' => 'nullable|string|max:255',
            'active'      => 'boolean',
            'country_id'  => 'required|exists:countries,id',
            'currency_id' => 'required|exists:currencies,id',
        ]);

        $data = $request->only([
            'name',
            'address',
            'email',
            'phone',
            'mobile',
            'active',
            'vat',
            'website',
            'country_id',
            'currency_id',
        ]);

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('company-logos', 'public');
        }

        $company=Company::create($data);

        return redirect()
            ->route('companies.edit', $company->id)
            ->with('success', 'Company created successfully.');
            }

    /**
     * Update the specified resource.
     */
    public function update(Request $request, Company $company)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'address'     => 'nullable|string|max:255',
            'logo'        => 'nullable|image|max:2048',
            'email'       => 'nullable|email|max:255',
            'phone'       => 'nullable|string|max:50',
            'mobile'      => 'nullable|string|max:50',
            'website' => 'nullable|string|max:255',
            'vat' => 'nullable|string|max:255',
            'active'      => 'boolean',
            'country_id'  => 'required|exists:countries,id',
            'currency_id' => 'required|exists:currencies,id',
        ]);

        $data = $request->only([
            'name',
            'address',
            'email',
            'phone',
            'mobile',
            'active',
            'vat',
            'website',
            'country_id',
            'currency_id',
        ]);

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('company-logos', 'public');
        }

        $company->update($data);

        return redirect()->back()->with('success', 'Company updated successfully.');
    }

    /**
     * Soft deactivate instead of delete
     */
    public function destroy(Company $company)
    {
        if ($company->users()->exists()) {
            return redirect()->back()->with('error', 'Cannot deactivate company with assigned users.');
        }

        $company->update(['active' => false]);

        return redirect()->back()->with('success', 'Company deactivated successfully.');
    }
}
