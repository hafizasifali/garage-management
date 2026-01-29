<p>Dear {{ $order->customer_name }},</p>

<p>
    We hope this message finds you well.
    Please find attached the invoice for your recent service order with us.
</p>

<p>
    <strong>Order Number:</strong> #{{ $order->id }}<br>
    <strong>Vehicle:</strong> {{ $order->vehicle_name ?? 'N/A' }}<br>
    <strong>Service Date:</strong> {{ \Carbon\Carbon::parse($order->order_date)->format('d-M-Y') }}
</p>

<p>
    If you have any questions regarding this invoice or the services provided, feel free to contact us anytime.
</p>

<p>
    Thank you for choosing <strong>{{ $company->name }}</strong>. We truly appreciate your business and look forward to serving you again.
</p>

<p>
    Warm regards,<br>
    <strong>{{ $company->name }}</strong><br>
    {{ $company->email ?? '' }}<br>
    {{ $company->phone ?? '' }}
</p>
