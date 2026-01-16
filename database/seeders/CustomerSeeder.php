<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        DB::table('customers')->insert([
            [
                'name' => 'John Smith',
                'type' => 'individual',
                'email' => 'john.smith@gmail.com',
                'phone' => '+1 416 555 2233',
                'address' => '120 King St W, Toronto, ON, Canada',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Emma Brown',
                'type' => 'company',
                'email' => 'emma.brown@globalsupplies.com',
                'phone' => '+1 604 555 8899',
                'address' => '455 Burrard St, Vancouver, BC, Canada',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Mr. Lube',
                'type' => 'company',
                'email' => 'info@mrlube.ca',
                'phone' => '+1 905 555 7788',
                'address' => '8900 Jane St, Vaughan, ON, Canada',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Michael Davis',
                'type' => 'individual',
                'email' => 'michael.davis@gmail.com',
                'phone' => '+1 403 555 4400',
                'address' => '22 17 Ave SW, Calgary, AB, Canada',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
