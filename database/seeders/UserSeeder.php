<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure roles exist
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $mechanicRole = Role::firstOrCreate(['name' => 'Mechanic']);
        $accountantRole = Role::firstOrCreate(['name' => 'Accountant']);

        // Admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@teejaysautos.com'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('password'),
            ]
        );
        $admin->assignRole($adminRole);

        // Mechanic user
        $mechanic = User::firstOrCreate(
            ['email' => 'mechanic@teejaysautos.com'],
            [
                'name' => 'Garage Mechanic',
                'password' => Hash::make('password'),
            ]
        );
        $mechanic->assignRole($mechanicRole);

        // Accountant user
        $accountant = User::firstOrCreate(
            ['email' => 'accountant@teejaysautos.com'],
            [
                'name' => 'Accountant',
                'password' => Hash::make('password'),
            ]
        );
        $accountant->assignRole($accountantRole);
    }
}
