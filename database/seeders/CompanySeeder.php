<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companies = [
            [
                'id' => 1,
                'name' => 'Teejay Auto Workshop',
                'address' => null,
                'logo' => null,
                'email' => 'info@teajayworkshop.uk',
                'phone' => null,
                'mobile' => 'htts://teajayworkshop.uk',
                'vat' => null,
                'website' => null,
                'active' => 1,
                'country_id' => 38,
                'currency_id' => 3,
                'created_at' => '2025-12-24 15:06:10',
                'updated_at' => '2025-12-24 15:06:10',
            ],
        ];

        DB::table('companies')->insert($companies);

        $this->command->info('Seeded ' . count($companies) . ' companies.');
    }
}
