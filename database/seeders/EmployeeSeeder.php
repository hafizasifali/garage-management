<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Faker\Factory as Faker;
class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('en_CA'); // Canadian locale
        $now = Carbon::now();

        // Fetch all companies (assuming companies are partners with is_company=1)
        $companies = DB::table('companies')
            ->pluck('id');

        if ($companies->isEmpty()) {
            $this->command->info('No companies found. Please run CustomerSeeder first.');
            return;
        }

        // Fetch all countries (optional, if country table exists)
        $countries = DB::table('countries')->pluck('id')->toArray();

        $employees = [];

        // Create 5–10 employees per company
        foreach ($companies as $companyId) {
            $employeeCount = rand(5, 10);

            for ($i = 0; $i < $employeeCount; $i++) {
                $birthday = $faker->dateTimeBetween('-60 years', '-18 years'); // age 18–60
                $joiningDate = $faker->dateTimeBetween($birthday, 'now');

                $employees[] = [
                    'name' => $faker->name,
                    'email' => $faker->unique()->safeEmail,
                    'phone' => $faker->phoneNumber,
                    'address' => $faker->address,
                    'birthday' => $birthday->format('Y-m-d'),
                    'joining_date' => $joiningDate->format('Y-m-d'),
                    'company_id' => $companyId,
                    'country_id' => $countries ? $faker->randomElement($countries) : null,
                    'user_id' => null, // optional, if you link employees to users
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        DB::table('employees')->insert($employees);

        $this->command->info('Seeded ' . count($employees) . ' employees.');
    }
}
