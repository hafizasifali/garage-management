<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderLine;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Vehicle;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OrderSeeder extends Seeder
{
    public function run()
    {
        $customers = Customer::all();
        $vehicles  = Vehicle::all();
        $employees = Employee::all();
        $products  = Product::all();

        if ($customers->isEmpty() || $vehicles->isEmpty() || $products->isEmpty()) {
            return;
        }

        $orderCount = rand(20, 40); // 🔥 realistic demo volume

        DB::transaction(function () use ($orderCount, $customers, $vehicles, $employees, $products) {

            for ($i = 1; $i <= $orderCount; $i++) {

                $customer = $customers->random();
                $vehicle  = $vehicles->random();
                $employee = $employees->random();

                $orderDate = Carbon::now()->subDays(rand(0, 30));
                $state = collect(['in_progress', 'completed'])->random();

                /*
                |--------------------------------------------------------------------------
                | Create Order
                |--------------------------------------------------------------------------
                */
                $order = Order::create([
                    'customer_id' => $customer->id,
                    'customer_name' => $customer->name,
                    'customer_email' => $customer->email,
                    'customer_phone' => $customer->phone,
                    'customer_address' => $customer->address,
                    'vehicle_id' => $vehicle->id,
                    'vehicle_name' => $vehicle->name,
                    'vehicle_model' => $vehicle->model,
                    'vehicle_license_plate' => $vehicle->license_plate,
                    'vehicle_vin' => $vehicle->vin,
                    'order_date' => $orderDate,
                    'state' => $state,
                    'tax_rate' => 13,
                    'total_discount' => 0,
                ]);

                /*
                |--------------------------------------------------------------------------
                | Order Lines
                |--------------------------------------------------------------------------
                */
                $lineCount = rand(2, 6);
                $selectedProducts = $products->random($lineCount);

                $totalParts  = 0;
                $totalLabor = 0;

                foreach ($selectedProducts as $product) {

                    $qty = $product->type === 'service' ? 1 : rand(1, 2);
                    $subtotal = $qty * $product->sale_price;

                    OrderLine::create([
                        'order_id' => $order->id,
                        'employee_id' => $employee?->id,
                        'product_id' => $product->id,
                        'quantity' => $qty,
                        'unit_price' => $product->sale_price,
                        'tax' => 0, // ❌ no line tax
                        'discount' => 0,
                        'subtotal' => $subtotal,
                    ]);

                    if ($product->type === 'service') {
                        $totalLabor += $subtotal;
                    } else {
                        $totalParts += $subtotal;
                    }
                }

                /*
                |--------------------------------------------------------------------------
                | Totals (Canada: 13% Order-Level Tax)
                |--------------------------------------------------------------------------
                */
                $subTotal = $totalParts + $totalLabor;
                $totalTax = round($subTotal * 0.13, 2);

                $order->update([
                    'total_parts_cost' => $totalParts,
                    'total_labor_cost' => $totalLabor,
                    'total_tax' => $totalTax,
                    'total_amount' => $subTotal + $totalTax,
                ]);
            }
        });
    }
}
