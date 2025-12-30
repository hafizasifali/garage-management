<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
class PartnerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        // =====================
        // Companies
        // =====================
        $abcTradingId = DB::table('partners')->insertGetId([
            'name' => 'ABC Trading Co.',
            'is_company' => 1,
            'customer_rank' => 1,
            'supplier_rank' => 0,
            'email' => 'sales@abctrading.com',
            'phone' => '+1 555 100 200',
            'address' => '123 Market Street, New York, USA',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $globalSuppliesId = DB::table('partners')->insertGetId([
            'name' => 'Global Supplies Ltd.',
            'is_company' => 1,
            'customer_rank' => 0,
            'supplier_rank' => 1,
            'email' => 'contact@globalsupplies.com',
            'phone' => '+44 20 7946 0123',
            'address' => '88 Industrial Road, London, UK',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $universalTradeId = DB::table('partners')->insertGetId([
            'name' => 'Universal Trade Group',
            'is_company' => 1,
            'customer_rank' => 0,
            'supplier_rank' => 1,
            'email' => 'info@universaltrade.com',
            'phone' => '+49 30 1234 5678',
            'address' => 'Berlin Commercial Center, Germany',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // =====================
        // Contacts (individuals)
        // =====================
        DB::table('partners')->insert([
            [
                'name' => 'John Smith',
                'is_company' => 0,
                'customer_rank' => 1,
                'email' => 'john.smith@abctrading.com',
                'phone' => '+1 555 222 333',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Emma Brown',
                'is_company' => 0,
                'customer_rank' => 1,
                'email' => 'emma.brown@globalsupplies.com',
                'phone' => '+44 20 8888 9999',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Alice Johnson',
                'is_company' => 0,
                'customer_rank' => 1,
                'email' => 'alice.johnson@universaltrade.com',
                'phone' => '+49 30 5678 1234',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // =====================
        // Standalone individual customer
        // =====================
        DB::table('partners')->insert([
            [
                'name' => 'Michael Davis',
                'is_company' => 0,
                'customer_rank' => 1,
                'supplier_rank' => 0,
                'email' => 'michael.davis@gmail.com',
                'phone' => '+1 555 300 400',
                'address' => '45 Sunset Blvd, Los Angeles, USA',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
