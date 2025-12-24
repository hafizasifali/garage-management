<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductCategory;
class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $products = [
            // Brake Service - Labor
            ['name' => 'All four brakes and rotors replaced', 'type' => 'service', 'category' => 'Brake Service'],
            ['name' => 'Front pads and rotors replaced', 'type' => 'service', 'category' => 'Brake Service'],
            ['name' => 'Rear brakes and rotors replaced', 'type' => 'service', 'category' => 'Brake Service'],
            ['name' => 'Front pads replaced', 'type' => 'service', 'category' => 'Brake Service'],
            ['name' => 'Rear pads replaced', 'type' => 'service', 'category' => 'Brake Service'],
            ['name' => 'Front pads and rotors and rear drums replaced', 'type' => 'service', 'category' => 'Brake Service'],
            ['name' => 'Front pads and rotors and rear drums replaced and shoes serviced', 'type' => 'service', 'category' => 'Brake Service'],
            ['name' => 'Rear drums replaced and shoes serviced', 'type' => 'service', 'category' => 'Brake Service'],
            ['name' => 'Rear drums and shoes replaced', 'type' => 'service', 'category' => 'Brake Service'],
            ['name' => 'All four brakes and rotors serviced', 'type' => 'service', 'category' => 'Brake Service'],
            ['name' => 'Front pads and rotors replaced and rear pads and rotors replaced', 'type' => 'service', 'category' => 'Brake Service'],

            // Fluids & Miscellaneous
            ['name' => 'Brakes fluid flush service', 'type' => 'consumable', 'category' => 'Fluids & Miscellaneous'],

            // Engine & Transmission - Labor
            ['name' => 'Engine oil pan replaced', 'type' => 'service', 'category' => 'Engine & Transmission'],
            ['name' => 'Transmission oil pan replaced', 'type' => 'service', 'category' => 'Engine & Transmission'],
            ['name' => 'Alternator replaced', 'type' => 'service', 'category' => 'Engine & Transmission'],

            // Shocks & Suspension - Labor
            ['name' => 'Front shocks replaced', 'type' => 'service', 'category' => 'Shocks & Suspension'],
            ['name' => 'Rear shock replaced', 'type' => 'service', 'category' => 'Shocks & Suspension'],

            // Steering & Alignment
            ['name' => 'Our tie rod replaced', 'type' => 'service', 'category' => 'Steering & Alignment'],
            ['name' => 'Inner tie rod replaced', 'type' => 'service', 'category' => 'Steering & Alignment'],
            ['name' => 'Sway bar links replaced', 'type' => 'service', 'category' => 'Steering & Alignment'],

            // Fluids & Consumables
            ['name' => 'Spare plugs replaced', 'type' => 'consumable', 'category' => 'Fluids & Miscellaneous'],
        ];

        foreach ($products as $prod) {
            $category = ProductCategory::where('name', $prod['category'])->first();

            Product::updateOrCreate(
                ['name' => $prod['name']],
                [
                    'type' => $prod['type'],
                    'category_id' => $category ? $category->id : null,
                    'sale_price' => 0,
                    'cost_price' => 0,
                    //'tax' => 15, // default tax percentage
                ]
            );
        }
    }
}
