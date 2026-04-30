<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AccessControlController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->get();

        $permissions = Permission::orderBy('feature')->orderBy('name')->get()
            ->groupBy('feature')
            ->map(fn($group) => $group->values());

        return Inertia::render('access-control/index', [
            'roles' => $roles->map(fn($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->values(),
            ]),
            'permissionsByFeature' => $permissions,
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $role->syncPermissions($request->permissions ?? []);

        return redirect()->back()->with('success', "Permissions for \"{$role->name}\" updated successfully.");
    }
}
