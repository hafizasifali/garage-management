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
    /**
     * Display a listing of employees.
     */
    public function index()
    {
        return Inertia::render('Employees/Index', [
            'employees' => Employee::with(['company', 'country', 'user'])
                ->orderBy('name')
                ->get(),
            'companies' => Company::where('active', true)->get(),
            'countries' => Country::orderBy('name')->get(),
            'users'     => User::orderBy('name')->get(),
        ]);
    }

    /**
     * Store a new employee.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'nullable|email|unique:employees,email',
            'phone'        => 'nullable|string|max:50',
            'address'      => 'nullable|string',
            'joining_date' => 'nullable|date',
            'birthday'     => 'nullable|date',
            'company_id'   => 'required|exists:companies,id',
            'country_id'   => 'nullable|exists:countries,id',
            'user_id'      => 'nullable|exists:users,id',
        ]);

        Employee::create($request->all());

        return redirect()->back()->with('success', 'Employee created successfully.');
    }

    /**
     * Update employee.
     */
    public function update(Request $request, Employee $employee)
    {
        $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'nullable|email|unique:employees,email,' . $employee->id,
            'phone'        => 'nullable|string|max:50',
            'address'      => 'nullable|string',
            'joining_date' => 'nullable|date',
            'birthday'     => 'nullable|date',
            'company_id'   => 'required|exists:companies,id',
            'country_id'   => 'nullable|exists:countries,id',
            'user_id'      => 'nullable|exists:users,id',
        ]);

        $employee->update($request->all());

        return redirect()->back()->with('success', 'Employee updated successfully.');
    }

    /**
     * Do NOT hard delete (history matters)
     */
    public function destroy(Employee $employee)
    {
        if ($employee->garageJobs()->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete employee assigned to garage jobs.');
        }

        $employee->delete();

        return redirect()->back()->with('success', 'Employee removed successfully.');
    }
}
