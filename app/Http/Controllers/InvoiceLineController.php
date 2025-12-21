<?php

namespace App\Http\Controllers;

use App\Models\InvoiceLine;
use Illuminate\Http\Request;

class InvoiceLineController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|numeric|min:0.01',
            'unit_price' => 'required|numeric|min:0',
            'tax'        => 'nullable|numeric|min:0',
            'discount'   => 'nullable|numeric|min:0',
        ]);

        $subtotal = ($request->quantity * $request->unit_price) + ($request->tax ?? 0) - ($request->discount ?? 0);

        InvoiceLine::create([
            'invoice_id' => $request->invoice_id,
            'product_id' => $request->product_id,
            'quantity'   => $request->quantity,
            'unit_price' => $request->unit_price,
            'tax'        => $request->tax ?? 0,
            'discount'   => $request->discount ?? 0,
            'subtotal'   => $subtotal,
        ]);

        return redirect()->back()->with('success', 'Invoice line added successfully.');
    }

    public function update(Request $request, InvoiceLine $invoiceLine)
    {
        $request->validate([
            'quantity'   => 'required|numeric|min:0.01',
            'unit_price' => 'required|numeric|min:0',
            'tax'        => 'nullable|numeric|min:0',
            'discount'   => 'nullable|numeric|min:0',
        ]);

        $invoiceLine->update([
            'quantity'   => $request->quantity,
            'unit_price' => $request->unit_price,
            'tax'        => $request->tax ?? 0,
            'discount'   => $request->discount ?? 0,
            'subtotal'   => ($request->quantity * $request->unit_price) + ($request->tax ?? 0) - ($request->discount ?? 0),
        ]);

        return redirect()->back()->with('success', 'Invoice line updated successfully.');
    }

    public function destroy(InvoiceLine $invoiceLine)
    {
        $invoiceLine->delete();

        return redirect()->back()->with('success', 'Invoice line deleted successfully.');
    }
}
