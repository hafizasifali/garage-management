<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ProductCategory;
class ProductCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Brake Service'],
            ['name' => 'Shocks & Suspension'],
            ['name' => 'Engine & Transmission'],
            ['name' => 'Steering & Alignment'],
            ['name' => 'Fluids & Miscellaneous'],
        ];

        foreach ($categories as $category) {
            ProductCategory::updateOrCreate(['name' => $category['name']]);
        }
    }
}
