<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

class OrderInvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $company;
    protected $pdf;

    public function __construct($order, $company, $pdf)
    {
        $this->order = $order;
        $this->company = $company;
        $this->pdf = $pdf;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Invoice for Order #' . $this->order->id,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.invoice',
            with: [
                'order' => $this->order,
                'company' => $this->company,
            ],
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromData(fn () => $this->pdf, "invoice_order_{$this->order->id}.pdf")
                ->withMime('application/pdf'),
        ];
    }
}
