<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Customer;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index()
    {
        return Inertia::render('Invoices/Index', [
            'invoices' => Invoice::with(['partner', 'lines.product', 'garageJobs'])->orderBy('invoice_date', 'desc')->get(),
            'partners' => Customer::where('active', true)->get(),
            'garageJobs' => Order::where('state', 'completed')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Invoices/Create', [
            'partners'   => Customer::where('active', true)->get(),
            'garageJobs' => Order::where('state', 'completed')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'partner_id' => 'required|exists:partners,id',
            'invoice_date' => 'required|date',
            'due_date' => 'nullable|date',
            'total_tax' => 'nullable|numeric|min:0',
            'total_discount' => 'nullable|numeric|min:0',
            'total_amount' => 'nullable|numeric|min:0',
            'state' => 'required|string',
            'garage_job_ids' => 'nullable|array',
            'garage_job_ids.*' => 'exists:garage_jobs,id',
        ]);

        $invoice = Invoice::create($request->only([
            'partner_id',
            'invoice_date',
            'due_date',
            'total_tax',
            'total_discount',
            'total_amount',
            'state'
        ]));

        if ($request->garage_job_ids) {
            $invoice->garageJobs()->sync($request->garage_job_ids);
        }

        return redirect()->route('invoices.index')->with('success', 'Invoice created successfully.');
    }

    public function update(Request $request, Invoice $invoice)
    {
        $request->validate([
            'partner_id' => 'required|exists:partners,id',
            'invoice_date' => 'required|date',
            'due_date' => 'nullable|date',
            'total_tax' => 'nullable|numeric|min:0',
            'total_discount' => 'nullable|numeric|min:0',
            'total_amount' => 'nullable|numeric|min:0',
            'state' => 'required|string',
        ]);

        $invoice->update($request->only([
            'partner_id',
            'invoice_date',
            'due_date',
            'total_tax',
            'total_discount',
            'total_amount',
            'state'
        ]));

        return redirect()->route('invoices.index')->with('success', 'Invoice updated successfully.');
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->lines()->delete();
        $invoice->garageJobs()->detach();
        $invoice->delete();

        return redirect()->route('invoices.index')->with('success', 'Invoice deleted successfully.');
    }
}
