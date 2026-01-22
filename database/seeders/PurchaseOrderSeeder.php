<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderLine;
use App\Models\Product;
use App\Models\Supplier;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PurchaseOrderSeeder extends Seeder
{
    public function run()
    {
        $suppliers = Supplier::all();
        $products  = Product::where('type','=','product')->get();

        if ($suppliers->isEmpty() || $products->isEmpty()) {
            return;
        }

        $orderCount = rand(15, 30); // 🔥 realistic demo volume

        DB::transaction(function () use ($orderCount, $suppliers, $products) {

            for ($i = 1; $i <= $orderCount; $i++) {

                $supplier = $suppliers->random();
                $orderDate = Carbon::now()->subDays(rand(0, 30));
                $state = collect(['draft', 'confirmed', 'received', 'cancelled'])->random();

                /*
                |--------------------------------------------------------------------------
                | Create Purchase Order
                |--------------------------------------------------------------------------
                */
                $purchaseOrder = PurchaseOrder::create([
                    'supplier_id' => $supplier->id,
                    'supplier_name' => $supplier->name,
                    'supplier_email' => $supplier->email,
                    'supplier_phone' => $supplier->phone,
                    'supplier_address' => $supplier->address,
                    'order_date' => $orderDate,
                    'state' => $state,
                    'total_tax' => 0,
                    'total_discount' => 0,
                    'total_amount' => 0,
                ]);

                /*
                |--------------------------------------------------------------------------
                | Purchase Order Lines
                |--------------------------------------------------------------------------
                */
                $lineCount = rand(2, 6);
                $selectedProducts = $products->random($lineCount);

                $subTotal = 0;

                foreach ($selectedProducts as $product) {

                    $qty = rand(1, 5);
                    $unitPrice = $product->cost_price ?? $product->sale_price;
                    $lineSubtotal = $qty * $unitPrice;

                    PurchaseOrderLine::create([
                        'purchase_order_id' => $purchaseOrder->id,
                        'product_id' => $product->id,
                        'quantity' => $qty,
                        'unit_price' => $unitPrice,
                        'tax' => 0, // ❌ no line tax
                        'discount' => 0,
                        'subtotal' => $lineSubtotal,
                    ]);

                    $subTotal += $lineSubtotal;
                }

                /*
                |--------------------------------------------------------------------------
                | Totals (13% Order-Level Tax)
                |--------------------------------------------------------------------------
                */
                $totalTax = round($subTotal * 0.13, 2);

                $purchaseOrder->update([
                    'total_tax' => $totalTax,
                    'total_amount' => $subTotal + $totalTax,
                ]);
            }
        });
    }
}
