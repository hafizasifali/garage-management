<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductCategory;

class ProductSeeder extends Seeder
{
    public function run()
    {
        $products = [

            /*
            |--------------------------------------------------------------------------
            | BRAKE SERVICES (LABOR)
            |--------------------------------------------------------------------------
            */
            [
                'name' => 'Brake Inspection',
                'type' => 'service',
                'category' => 'Brake Service',
                'cost_price' => 25,
                'sale_price' => 60,
            ],
            [
                'name' => 'Front Brake Pads Replacement (Labour)',
                'type' => 'service',
                'category' => 'Brake Service',
                'cost_price' => 80,
                'sale_price' => 150,
            ],
            [
                'name' => 'Rear Brake Pads Replacement (Labour)',
                'type' => 'service',
                'category' => 'Brake Service',
                'cost_price' => 80,
                'sale_price' => 150,
            ],
            [
                'name' => 'Front Pads & Rotors Replacement (Labour)',
                'type' => 'service',
                'category' => 'Brake Service',
                'cost_price' => 120,
                'sale_price' => 220,
            ],
            [
                'name' => 'All Four Brakes & Rotors Replacement (Labour)',
                'type' => 'service',
                'category' => 'Brake Service',
                'cost_price' => 220,
                'sale_price' => 420,
            ],

            /*
            |--------------------------------------------------------------------------
            | BRAKE PARTS (PRODUCTS)
            |--------------------------------------------------------------------------
            */
            [
                'name' => 'Brake Pads (Front Set)',
                'type' => 'product',
                'category' => 'Brake Parts',
                'cost_price' => 60,
                'sale_price' => 120,
            ],
            [
                'name' => 'Brake Pads (Rear Set)',
                'type' => 'product',
                'category' => 'Brake Parts',
                'cost_price' => 55,
                'sale_price' => 110,
            ],
            [
                'name' => 'Brake Rotors (Pair)',
                'type' => 'product',
                'category' => 'Brake Parts',
                'cost_price' => 120,
                'sale_price' => 220,
            ],

            /*
            |--------------------------------------------------------------------------
            | ENGINE & MAINTENANCE SERVICES
            |--------------------------------------------------------------------------
            */
            [
                'name' => 'Engine Oil Change (Labour)',
                'type' => 'service',
                'category' => 'Engine & Maintenance',
                'cost_price' => 20,
                'sale_price' => 50,
            ],
            [
                'name' => 'Spark Plugs Replacement (Labour)',
                'type' => 'service',
                'category' => 'Engine & Maintenance',
                'cost_price' => 60,
                'sale_price' => 120,
            ],
            [
                'name' => 'Alternator Replacement (Labour)',
                'type' => 'service',
                'category' => 'Engine & Maintenance',
                'cost_price' => 150,
                'sale_price' => 300,
            ],

            /*
            |--------------------------------------------------------------------------
            | ENGINE PARTS & CONSUMABLES
            |--------------------------------------------------------------------------
            */
            [
                'name' => 'Engine Oil (5W-30)',
                'type' => 'consumable',
                'category' => 'Fluids & Consumables',
                'cost_price' => 25,
                'sale_price' => 55,
            ],
            [
                'name' => 'Oil Filter',
                'type' => 'product',
                'category' => 'Fluids & Consumables',
                'cost_price' => 8,
                'sale_price' => 18,
            ],
            [
                'name' => 'Spark Plug',
                'type' => 'product',
                'category' => 'Engine Parts',
                'cost_price' => 6,
                'sale_price' => 15,
            ],

            /*
            |--------------------------------------------------------------------------
            | SUSPENSION & STEERING
            |--------------------------------------------------------------------------
            */
            [
                'name' => 'Wheel Alignment',
                'type' => 'service',
                'category' => 'Steering & Alignment',
                'cost_price' => 40,
                'sale_price' => 110,
            ],
            [
                'name' => 'Front Shock Replacement (Labour)',
                'type' => 'service',
                'category' => 'Shocks & Suspension',
                'cost_price' => 120,
                'sale_price' => 240,
            ],
            [
                'name' => 'Sway Bar Link',
                'type' => 'product',
                'category' => 'Suspension Parts',
                'cost_price' => 25,
                'sale_price' => 65,
            ],

            /*
            |--------------------------------------------------------------------------
            | FLUID SERVICES
            |--------------------------------------------------------------------------
            */
            [
                'name' => 'Brake Fluid Flush',
                'type' => 'service',
                'category' => 'Fluids & Miscellaneous',
                'cost_price' => 40,
                'sale_price' => 110,
            ],
            [
                'name' => 'Coolant Flush',
                'type' => 'service',
                'category' => 'Fluids & Miscellaneous',
                'cost_price' => 50,
                'sale_price' => 130,
            ],
            [
                'name' => 'Brake Fluid DOT-4',
                'type' => 'consumable',
                'category' => 'Fluids & Miscellaneous',
                'cost_price' => 12,
                'sale_price' => 28,
            ],
        ];

        foreach ($products as $prod) {
            /** ✅ Ensure category always exists */
            $category = ProductCategory::firstOrCreate(
                ['name' => $prod['category']],
                [
                    'name' => $prod['category'],
                ]
            );

            Product::updateOrCreate(
                ['name' => $prod['name']],
                [
                    'type'        => $prod['type'],
                    'category_id' => $category?->id,
                    'cost_price' => $prod['cost_price'],
                    'sale_price' => $prod['sale_price'],
                    // ✅ Add qty_on_hand
                    'qty_on_hand' => $prod['type'] === 'product' || $prod['type'] === 'consumable'
                        ? rand(5, 50) // random initial stock
                        : 0,          // services start with 0 stock
                ]
            );
        }
    }
}
