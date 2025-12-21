<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index()
    {
        return Inertia::render('Payments/Index', [
            'payments' => Payment::with('invoice.partner')->orderBy('payment_date', 'desc')->get(),
            'invoices' => Invoice::where('state', '!=', 'draft')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Payments/Create', [
            'invoices' => Invoice::where('state', '!=', 'draft')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'invoice_id'     => 'required|exists:invoices,id',
            'payment_date'   => 'required|date',
            'amount'         => 'required|numeric|min:0.01',
            'payment_method' => 'nullable|string|max:50',
            'reference'      => 'nullable|string|max:255',
        ]);

        $payment = Payment::create($request->only([
            'invoice_id',
            'payment_date',
            'amount',
            'payment_method',
            'reference'
        ]));

        // Update invoice state if fully paid
        $invoice = $payment->invoice;
        $totalPaid = $invoice->payments()->sum('amount');

        if ($totalPaid >= $invoice->total_amount) {
            $invoice->update(['state' => 'paid']);
        } else {
            $invoice->update(['state' => 'partial']);
        }

        return redirect()->route('payments.index')->with('success', 'Payment recorded successfully.');
    }

    public function update(Request $request, Payment $payment)
    {
        $request->validate([
            'payment_date'   => 'required|date',
            'amount'         => 'required|numeric|min:0.01',
            'payment_method' => 'nullable|string|max:50',
            'reference'      => 'nullable|string|max:255',
        ]);

        $payment->update($request->only([
            'payment_date',
            'amount',
            'payment_method',
            'reference'
        ]));

        return redirect()->route('payments.index')->with('success', 'Payment updated successfully.');
    }

    public function destroy(Payment $payment)
    {
        $payment->delete();

        return redirect()->route('payments.index')->with('success', 'Payment deleted successfully.');
    }
}
