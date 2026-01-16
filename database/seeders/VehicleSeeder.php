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

        // Fetch all customers
        $customers = DB::table('customers')->pluck('id');

        if ($customers->isEmpty()) {
            $this->command->warn('No customers found. Run PartnerSeeder first.');
            return;
        }

        // Make => Models
        $vehiclesByMake = [
            'Honda' => ['Civic', 'CR-V', 'Accord'],
            'Toyota' => ['Corolla', 'Camry', 'RAV4'],
            'Ford' => ['F-150', 'Escape', 'Explorer'],
            'Chevrolet' => ['Silverado', 'Equinox', 'Malibu'],
            'Mazda' => ['CX-5', 'Mazda3'],
            'Hyundai' => ['Elantra', 'Tucson'],
            'Nissan' => ['Rogue', 'Altima'],
            'Subaru' => ['Outback', 'Forester'],
            'Volkswagen' => ['Golf', 'Passat'],
        ];

        $provinces = ['ON','QC','BC','AB','MB','SK','NS','NB','NL','PE'];

        $vehicles = [];

        foreach ($customers as $customerId) {
            $vehicleCount = rand(1, 3);

            for ($i = 0; $i < $vehicleCount; $i++) {
                $make = array_rand($vehiclesByMake);
                $model = $vehiclesByMake[$make][array_rand($vehiclesByMake[$make])];
                $year = rand(2008, (int) now()->format('Y'));

                $province = $provinces[array_rand($provinces)];
                $plate = sprintf(
                    '%s %s-%03d',
                    $province,
                    strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 3)),
                    rand(100, 999)
                );

                $vin = strtoupper(substr(str_shuffle(
                    'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'
                ), 0, 17));

                $vehicles[] = [
                    'name'          => "{$make} {$model} {$year}",
                    'customer_id'   => $customerId,
                    'make'          => $make,
                    'model'         => $model,
                    'year'          => $year,
                    'vin'           => $vin,
                    'license_plate' => $plate,
                    'created_at'    => $now,
                    'updated_at'    => $now,
                ];
            }
        }

        DB::table('vehicles')->insert($vehicles);

        $this->command->info('✅ Seeded ' . count($vehicles) . ' vehicles with make & model.');
    }
}
