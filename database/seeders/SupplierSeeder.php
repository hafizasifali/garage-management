<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        DB::table('suppliers')->insert([
            [
                'name' => 'Canadian Auto Parts Ltd.',
                'email' => 'sales@canadianautoparts.ca',
                'phone' => '+1 416 555 1100',
                'address' => '350 Queen St W, Toronto, ON, Canada',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Prairie Lubricants Inc.',
                'email' => 'orders@prairielube.ca',
                'phone' => '+1 306 555 2200',
                'address' => '980 Broad St, Regina, SK, Canada',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Pacific Tire Supply',
                'email' => 'info@pacifictiresupply.ca',
                'phone' => '+1 604 555 3300',
                'address' => '1250 Marine Dr, North Vancouver, BC, Canada',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Northern Battery Co.',
                'email' => 'support@northernbattery.ca',
                'phone' => '+1 705 555 4400',
                'address' => '77 Algonquin Blvd E, Timmins, ON, Canada',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Atlantic Auto Distributors',
                'email' => 'sales@atlanticauto.ca',
                'phone' => '+1 902 555 5500',
                'address' => '210 Barrington St, Halifax, NS, Canada',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
