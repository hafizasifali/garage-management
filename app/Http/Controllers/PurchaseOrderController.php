<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class PurchaseOrderController extends Controller
{
    public function index()
    {
        $orders = PurchaseOrder::with(['supplier', 'lines.product'])->paginate(10);

        return Inertia::render('purchaseOrders/index', [
            'orders' => $orders,
        ]);
    }

    public function create()
    {
        return Inertia::render('purchaseOrders/create', [
            'suppliers' => Supplier::select('id', 'name')->get(),
            'products' => Product::all(),
            'states' => PurchaseOrder::states(),
            'fields' => PurchaseOrder::fields(),
            'suppliers_fields' => Supplier::fields(),
            'record' => null,
        ]);
    }

    public function edit(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load(['lines.product']);

        return Inertia::render('purchaseOrders/edit', [
            'suppliers' => Supplier::select('id', 'name')->get(),
            'products' => Product::all(),
            'states' => PurchaseOrder::states(),
            'fields' => PurchaseOrder::editFields(),
            'record' => $purchaseOrder,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'order_date' => 'required|date',
            'state' => 'required',
            'lines' => 'array',
            'lines.*.product_id' => 'required|exists:products,id',
            'lines.*.quantity' => 'required|numeric',
            'lines.*.unit_price' => 'nullable|numeric',
            'lines.*.discount' => 'nullable|numeric',
            'lines.*.subtotal' => 'nullable|numeric',
        ]);

        $supplier = Supplier::find($validated['supplier_id']);
        if ($supplier) {
            $validated['supplier_name'] = $supplier->name;
            $validated['supplier_email'] = $supplier->email;
            $validated['supplier_phone'] = $supplier->phone;
            $validated['supplier_address'] = $supplier->address;
        }

        $purchaseOrder = PurchaseOrder::create($validated);

        if (isset($validated['lines'])) {
            foreach ($validated['lines'] as $line) {
                $line['tax'] = $line['subtotal'] * 0.13;
                $line['discount'] = 0;
                $purchaseOrder->lines()->create($line);
            }
            $purchaseOrder->recalculateTotal();
        }

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase Order created.');
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        $validated = $request->validate([
            'supplier_name' => 'required|string|max:255',
            'supplier_email' => 'nullable|email|max:255',
            'supplier_phone' => 'nullable|string|max:50',
            'supplier_address' => 'nullable|string|max:500',
            'order_date' => 'required|date',
            'state' => 'required',
            'lines' => 'array',
            'lines.*.product_id' => 'required|exists:products,id',
            'lines.*.quantity' => 'required|numeric',
            'lines.*.unit_price' => 'nullable|numeric',
            'lines.*.tax' => 'nullable|numeric',
            'lines.*.discount' => 'nullable|numeric',
            'lines.*.subtotal' => 'nullable|numeric',
        ]);

        $purchaseOrder->update($validated);

        if (isset($validated['lines'])) {
            $purchaseOrder->lines()->delete();
            foreach ($validated['lines'] as $line) {
                $purchaseOrder->lines()->create($line);
            }
            $purchaseOrder->recalculateTotal();
        }

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase Order updated.');
    }

    public function destroy(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->lines()->delete();
        $purchaseOrder->delete();

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase Order deleted.');
    }

    public function downloadInvoice($id)
    {
        $purchaseOrder = PurchaseOrder::with(['lines.product', 'supplier'])->findOrFail($id);
        $company = Company::first();

        $pdf = Pdf::loadView('invoices.purchase-order', compact('purchaseOrder', 'company'));
        return $pdf->stream("invoice_purchase_order_{$purchaseOrder->id}.pdf");
        // return $pdf->download("invoice_purchase_order_{$purchaseOrder->id}.pdf");
    }
}
