<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Company;
use App\Models\Country;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $employees = Employee::with(['company', 'country', 'user'])
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
            ->paginate($request->per_page ?? 50)
            ->withQueryString();

        return Inertia::render('employees/index', [
            'employees' => $employees,
            'filters' => $request->only(['search', 'active', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('employees/form', [
            'fields' => Employee::fields(),
            'record' => null,
            'companies' => Company::select('id', 'name')->get(),
            'countries' => Country::select('id', 'name')->get(),
            'users' => User::select('id', 'name')->get(),
        ]);
    }

    public function edit(Employee $employee)
    {
        return Inertia::render('employees/form', [
            'fields' => Employee::fields(),
            'record' => $employee,
            'companies' => Company::select('id', 'name')->get(),
            'countries' => Country::select('id', 'name')->get(),
            'users' => User::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'required|email|unique:employees,email',
            'phone'        => 'nullable|string|max:50',
            'address'      => 'nullable|string',
            'joining_date' => 'required|date',
            'birthday'     => 'nullable|date',
            'company_id'   => 'required|exists:companies,id',
            'country_id'   => 'nullable|exists:countries,id',
            'user_id'      => 'nullable|exists:users,id',
        ]);

        $data['active'] = 1;
        $employee = Employee::create($data);

        return redirect()
            ->route('employees.edit', $employee->id)
            ->with('success', 'Employee created successfully.');
    }

    public function update(Request $request, Employee $employee)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'required|email|unique:employees,email,' . $employee->id,
            'phone'        => 'nullable|string|max:50',
            'address'      => 'nullable|string',
            'joining_date' => 'required|date',
            'birthday'     => 'nullable|date',
            'company_id'   => 'required|exists:companies,id',
            'country_id'   => 'nullable|exists:countries,id',
            'user_id'      => 'nullable|exists:users,id',
        ]);
        $employee->update($data);

        return redirect()->back()->with('success', 'Employee updated successfully.');
    }

    public function destroy(Employee $employee)
    {
        $employee->update(['active' => false]);

        return redirect()->back()->with('success', 'Employee deactivated successfully.');
    }
}
