<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice #{{ $order->id }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f0f0f0; }
        .total-row td { font-weight: bold; }
        .header { display: flex; justify-content: space-between; }

        .header-table{
            width: 100%; border-collapse: collapse; margin-top: 20px;
        }
        .header-table td{
            border: none !important;
        }
    </style>
</head>
<body>
<h1 style="text-align: center;">{{strtoupper($company->name)}}</h1>
<h3 style="text-align: center">{{$company->address}}</h3>
<div class="header">
    <table class="header-table">
        <tr>
            <td style="font-weight: bold">Invoice #:</td>
            <td>{{$order->id}}</td>
            <td style="font-weight: bold">Date:</td>
            <td>{{$order->order_date}}</td>
        </tr>
        <tr>
            <td style="font-weight: bold">Name:</td>
            <td>{{$order->customer_name}}</td>
            <td style="font-weight: bold">Make:</td>
            <td>{{$order->vehicle_name}}</td>
        </tr>
        <tr>
            <td style="font-weight: bold">Address:</td>
            <td>{{$order->customer_address}}</td>
            <td style="font-weight: bold">Model:</td>
            <td>{{$order->vehicle_model}}</td>
        </tr>
        <tr>
            <td style="font-weight: bold">Telephone #:</td>
            <td>{{$order->customer_phone}}</td>
            <td style="font-weight: bold">Year:</td>
            <td>{{$order->vehicle_model}}</td>
        </tr>
        <tr>
            <td style="font-weight: bold">License Plate:</td>
            <td>{{$order->vehicle_license_plate}}</td>
            <td style="font-weight: bold"></td>
            <td></td>
        </tr>

    </table>
</div>

<table>
    <thead>
    <tr>
        <th>S.NO</th>
        <th>Repairs Description/Details</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Subtotal</th>
    </tr>
    </thead>
    <tbody>
    @foreach($order->lines as $index=>$line)
        <tr>
            <td>{{$index+1}}</td>
            <td>{{ $line->product->name ?? '-' }}</td>
            <td>{{ $line->quantity }}</td>
            <td>${{ number_format($line->unit_price, 2) }}</td>
            <td>${{ number_format($line->subtotal, 2) }}</td>
        </tr>
    @endforeach
    <tr class="total-row">
        <td colspan="4">Untaxed Amount</td>
        <td>${{ number_format($order->lines->sum(fn($l) => $l->subtotal), 2) }}</td>
    </tr>
    <tr class="total-row">
        <td colspan="4">Tax 13%</td>
        <td>${{ number_format($order->lines->sum(fn($l) => $l->subtotal) * 0.13, 2) }}</td>
    </tr>
    <tr class="total-row">
        <td colspan="4">Total</td>
        <td>${{ number_format($order->lines->sum(fn($l) => $l->subtotal) * 1.13, 2) }}</td>
    </tr>
    </tbody>
</table>
</body>
</html>
