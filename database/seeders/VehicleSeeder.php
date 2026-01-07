<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // Fetch all customers (customers with customer_rank > 0)
        $customers = DB::table('customers')
            ->pluck('id');

        if ($customers->isEmpty()) {
            $this->command->warn('No customers found. Run PartnerSeeder first.');
            return;
        }

        // Popular vehicles in Canada
        $vehicleModels = [
            'Honda Civic',
            'Toyota Corolla',
            'Toyota RAV4',
            'Ford F-150',
            'Chevrolet Silverado',
            'Mazda CX-5',
            'Hyundai Elantra',
            'Nissan Rogue',
            'Subaru Outback',
            'Volkswagen Golf',
        ];

        // Canadian provinces & territories
        $provinces = [
            'ON',
            'QC',
            'BC',
            'AB',
            'MB',
            'SK',
            'NS',
            'NB',
            'NL',
            'PE',
        ];

        $vehicles = [];

        foreach ($customers as $customerId) {
            // 1–3 vehicles per customer (realistic)
            $vehicleCount = rand(1, 3);

            for ($i = 0; $i < $vehicleCount; $i++) {
                $model = $vehicleModels[array_rand($vehicleModels)];
                $year  = rand(2008, (int) now()->format('Y'));

                // Province-based license plate (e.g., ON ABC-123)
                $province = $provinces[array_rand($provinces)];
                $plate = sprintf(
                    '%s %s-%03d',
                    $province,
                    strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 3)),
                    rand(100, 999)
                );

                // VIN (17 chars, Canada/US compatible)
                $vin = strtoupper(substr(str_shuffle(
                    'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'
                ), 0, 17));

                $vehicles[] = [
                    'name'           => "{$model} {$year}",
                    'customer_id'     => $customerId,
                    'vin'            => $vin,
                    'license_plate'  => $plate,
                    'model'          => $model,
                    'year'           => $year,
                    'created_at'     => $now,
                    'updated_at'     => $now,
                ];
            }
        }

        DB::table('vehicles')->insert($vehicles);

        $this->command->info('✅ Seeded ' . count($vehicles) . ' Canadian vehicles.');
    }
}
