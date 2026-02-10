<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::with('roles')
            ->when($request->search, fn($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
            )
            ->paginate($request->per_page ?? 50)
            ->withQueryString();

        return Inertia::render('users/index', [
            'users' => $users,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('users/form', [
            'roles' => Role::select('id', 'name')->get(),
            'fields' => User::fields(),
            'record' => null,
        ]);
    }

    public function edit(User $user)
    {
        return Inertia::render('users/form', [
            'roles' => Role::select('id', 'name')->get(),
            'fields' => User::fields(),
            'record' => $user->load('roles'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'roles.*' => 'exists:roles,id',
            'active' => 'boolean',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'active' => $request->active ?? true,
        ]);

        if ($request->filled('roles')) {
            $role=Role::where(['id' => $request->roles])->first();
            $user->assignRole($role['name']);
        }

        // Creating employee
        Employee::create([
            'user_id' => $user->id,
            'name' => $request->name,
            'email' => $request->email,
            'company_id' => 1,
        ]);
    return redirect()->route('users.edit', $user->id)->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => "required|email|unique:users,email,{$user->id}",
            'password' => 'nullable|string|min:6|confirmed',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,id',
            'active' => 'boolean',
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'active' => $request->active ?? true,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        $user->syncRoles($request->roles ?? []);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $user->update(['active' => false]);

        return redirect()->back()->with('success', 'User deactivated successfully.');
    }
}
