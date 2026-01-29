<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\Product;
use App\Support\QueryFilter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $filters = session('purchase_orders.filters', []);
        $search  = session('purchase_orders.search', '');

        $query = PurchaseOrder::query()->with(['supplier']);

        // Apply structured filters
        $query = QueryFilter::apply($query, $filters);

        // Apply global search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('supplier_name', 'like', "%$search%")
                    ->orWhere('supplier_email', 'like', "%$search%")
                    ->orWhere('supplier_phone', 'like', "%$search%");
            });
        }

        return inertia('purchaseOrders/index', [
            'orders' => $query->latest()->paginate(80),
            'activeFilters' => $filters,
            'search' => $search,
            'suppliers' => Supplier::select('id', 'name')->orderBy('name')->get(),
            'states' => PurchaseOrder::states(),
        ]);
    }


    public function create()
    {
        return Inertia::render('purchaseOrders/create', [
            'suppliers' => Supplier::select('id', 'name')->get(),
            'products' => Product::where('type','=','product')->get(),
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
            'products' => Product::where('type','=','product')->get(),
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

    public function updateState(Request $request, PurchaseOrder $order)
    {
        $request->validate([
            'state' => 'required|string', // use your states
        ]);

        $order->update(['state' => $request->state]);

        return redirect()->back()->with('success', 'Order state updated!');
    }


    public function filter(Request $request)
    {
        // Ensure filters/search are arrays/strings
        $filters = $request->input('filters', []);
        $search  = $request->input('search', '');

        // Store in session
        session([
            'purchase_orders.filters' => $filters,
            'purchase_orders.search'  => $search,
        ]);

        // Redirect to index
        return redirect()->route('purchase-orders.index');
    }



}
