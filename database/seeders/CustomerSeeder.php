<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();



        // =====================
        // Standalone individual customer
        // =====================
        DB::table('customers')->insert([
            [
                'name' => 'John Smith',
                'email' => 'john.smith@abctrading.com',
                'phone' => '+1 555 222 333',
                'address'=> null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Emma Brown',
                'email' => 'emma.brown@globalsupplies.com',
                'phone' => '+44 20 8888 9999',
                'address'=> null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Alice Johnson',
                'email' => 'alice.johnson@universaltrade.com',
                'phone' => '+49 30 5678 1234',
                'address'=> null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Michael Davis',
                'email' => 'michael.davis@gmail.com',
                'phone' => '+1 555 300 400',
                'address' => '45 Sunset Blvd, Los Angeles, USA',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
