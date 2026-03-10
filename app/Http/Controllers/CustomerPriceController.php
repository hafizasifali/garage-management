<?php
namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Product;
use App\Models\CustomerPrice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerPriceController extends Controller
{
    public function index(Customer $customer)
    {
        $products = Product::select('id','name','sale_price')->where('type','=','service')->get();

        $prices = CustomerPrice::where('customer_id', $customer->id)
            ->pluck('price','product_id');

        return Inertia::render('customers/prices', [
            'customer' => $customer,
            'products' => $products,
            'prices' => $prices
        ]);
    }

    public function bulkUpdate(Request $request, Customer $customer)
    {
        $data = $request->validate([
            'prices' => 'array'
        ]);

        foreach ($data['prices'] as $productId => $price) {

            if(!$price) {
                continue;
            }

            \App\Models\CustomerPrice::updateOrCreate(
                [
                    'customer_id' => $customer->id,
                    'product_id' => $productId
                ],
                [
                    'price' => $price
                ]
            );
        }

        return back()->with('success','Prices updated successfully');
    }
}
