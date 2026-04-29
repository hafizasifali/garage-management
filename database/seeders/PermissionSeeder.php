<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Order
            ['feature' => 'Order', 'name' => 'order view'],
            ['feature' => 'Order', 'name' => 'order create'],
            ['feature' => 'Order', 'name' => 'order edit'],
            ['feature' => 'Order', 'name' => 'order delete'],

            // Product
            ['feature' => 'Product', 'name' => 'product view'],
            ['feature' => 'Product', 'name' => 'product create'],
            ['feature' => 'Product', 'name' => 'product edit'],
            ['feature' => 'Product', 'name' => 'product delete'],

            // Customer
            ['feature' => 'Customer', 'name' => 'customer view'],
            ['feature' => 'Customer', 'name' => 'customer create'],
            ['feature' => 'Customer', 'name' => 'customer edit'],
            ['feature' => 'Customer', 'name' => 'customer delete'],

            // Employee
            ['feature' => 'Employee', 'name' => 'employee view'],
            ['feature' => 'Employee', 'name' => 'employee create'],
            ['feature' => 'Employee', 'name' => 'employee edit'],
            ['feature' => 'Employee', 'name' => 'employee delete'],

            // Company
            ['feature' => 'Company', 'name' => 'company view'],
            ['feature' => 'Company', 'name' => 'company create'],
            ['feature' => 'Company', 'name' => 'company edit'],
            ['feature' => 'Company', 'name' => 'company delete'],

            // User
            ['feature' => 'User', 'name' => 'user view'],
            ['feature' => 'User', 'name' => 'user create'],
            ['feature' => 'User', 'name' => 'user edit'],
            ['feature' => 'User', 'name' => 'user delete'],

            // Report
            ['feature' => 'Report', 'name' => 'report view'],
            ['feature' => 'Report', 'name' => 'report create'],
            ['feature' => 'Report', 'name' => 'report export'],

            // Access Control
            ['feature' => 'Access Control', 'name' => 'permission manage'],
            ['feature' => 'Access Control', 'name' => 'role manage'],
            ['feature' => 'Access Control', 'name' => 'setting manage'],
        ];

        foreach ($permissions as $perm) {
            Permission::updateOrCreate(
                ['name' => $perm['name'], 'guard_name' => 'web'],
                ['feature' => $perm['feature']]
            );
        }

        $this->createRolesWithPermissions();
    }

    protected function createRolesWithPermissions(): void
    {
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->givePermissionTo(Permission::all());

        $mechanic = Role::firstOrCreate(['name' => 'mechanic', 'guard_name' => 'web']);
        $mechanic->syncPermissions([
            'order view',
            'order edit',
            'product view',
            'customer view',
        ]);

        $customer = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
        $customer->syncPermissions([
            'report view',
        ]);
    }
}
