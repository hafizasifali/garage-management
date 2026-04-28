<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\User;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define all permissions
        $permissions = [
            // Order permissions
            'order view',
            'order create',
            'order edit',
            'order delete',

            // Product permissions
            'product view',
            'product create',
            'product edit',
            'product delete',

            // Customer permissions
            'customer view',
            'customer create',
            'customer edit',
            'customer delete',

            // Employee/Mechanic permissions
            'employee view',
            'employee create',
            'employee edit',
            'employee delete',

            // Supplier permissions
            // 'supplier view',
            // 'supplier create',
            // 'supplier edit',
            // 'supplier delete',

            // Vehicle permissions
            // 'vehicle view',
            // 'vehicle create',
            // 'vehicle edit',
            // 'vehicle delete',

            // Company permissions
            'company view',
            'company create',
            'company edit',
            'company delete',

            // User permissions
            'user view',
            'user create',
            'user edit',
            'user delete',

            // Report permissions
            'report view',
            'report create',
            'report export',

            // Purchase Order permissions
            // 'purchase view',
            // 'purchase create',
            // 'purchase edit',
            // 'purchase delete',

            // Payment permissions
            // 'payment view',
            // 'payment create',
            // 'payment edit',
            // 'payment delete',

            // Access Control / Settings
            'permission manage',
            'role manage',
            'setting manage',
        ];

        // Create permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create roles and assign permissions
        $this->createRolesWithPermissions();
    }

    /**
     * Create roles and assign appropriate permissions
     */
    protected function createRolesWithPermissions(): void
    {
        // Admin - Full access
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->givePermissionTo(Permission::all());

        

        // Mechanic - Limited access
        $mechanic = Role::firstOrCreate(['name' => 'mechanic', 'guard_name' => 'web']);
        $mechanic->givePermissionTo([
            'order view',
            'order edit',
            'product view',
            'customer view',
        ]);

        

        // Viewer - Read only
        $customer = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
        $customer->givePermissionTo([
            'report view',
        ]);

        
    }

}