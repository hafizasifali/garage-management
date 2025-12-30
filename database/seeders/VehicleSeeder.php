<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class VehicleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        // Fetch all customers from partners table
        $customers = DB::table('partners')
            ->where('customer_rank', '>', 0)
            ->pluck('id');

        if ($customers->isEmpty()) {
            $this->command->info('No customers found. Please run PartnerSeeder first.');
            return;
        }

        // Example Canadian vehicle models
        $vehicleModels = [
            'Honda Civic', 'Toyota Corolla', 'Ford F-150', 'Chevrolet Silverado',
            'Mazda 3', 'Hyundai Elantra', 'Nissan Rogue', 'Subaru Outback'
        ];

        $provinces = ['ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE'];

        $vehicles = [];

        foreach ($customers as $customerId) {
            // Assign 1–3 vehicles per customer
            $vehicleCount = rand(1, 3);

            for ($i = 0; $i < $vehicleCount; $i++) {
                $model = $vehicleModels[array_rand($vehicleModels)];
                $year = rand(2005, 2024); // realistic car years

                // Canadian-style license plate (e.g., ON ABC1234)
                $province = $provinces[array_rand($provinces)];
                $plate = $province . ' ' . strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 3))
                         . rand(1000, 9999);

                $vehicles[] = [
                    'partner_id' => $customerId,
                    'license_plate' => $plate,
                    'model' => $model,
                    'year' => $year,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        DB::table('vehicles')->insert($vehicles);

        $this->command->info('Seeded ' . count($vehicles) . ' vehicles.');
    }
}
