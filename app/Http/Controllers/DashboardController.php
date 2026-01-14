<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();

        // KPIs
        $kpis = [
            ['label' => 'Today Orders', 'value' => Order::whereDate('order_date', $today)->count()],
            ['label' => 'Pending Orders', 'value' => Order::where('state', 'pending')->count()],
            ['label' => 'Completed Orders', 'value' => Order::where('state', 'completed')->count()],
            ['label' => 'Today Revenue', 'value' => '$' . number_format(Order::whereDate('order_date', $today)->sum('total_amount'), 2)],
        ];

        // Orders by Status Chart
        $statusChart = [
            'labels' => ['Pending', 'In Progress', 'Completed'],
            'datasets' => [
                [
                    'label' => 'Orders',
                    'data' => [
                        Order::where('state', 'pending')->count(),
                        Order::where('state', 'in_progress')->count(),
                        Order::where('state', 'completed')->count(),
                    ],
                    'backgroundColor' => ['#FBBF24', '#3B82F6', '#10B981'], // Amber, Blue, Green
                ],
            ],
        ];


        // Revenue Breakdown
        $revenueChart = [
            'labels' => ['Labor', 'Parts'],
            'datasets' => [
                [
                    'data' => [
                        Order::sum('total_labor_cost'),
                        Order::sum('total_parts_cost'),
                    ],
                    'backgroundColor' => ['#6366F1', '#F472B6'], // Indigo, Pink
                ],
            ],
        ];


        // Recent Jobs
        $recentOrders = Order::with(['customer', 'vehicle'])
            ->orderBy('order_date', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'customer' => $order->customer_name ?? $order->customer->name ?? '-',
                    'vehicle' => $order->vehicle_name ?? $order->vehicle->vehicle_model ?? '-',
                    'status' => ucfirst($order->state),
                    'amount' => '$' . number_format($order->total_amount, 2),
                ];
            });

        return Inertia::render('dashboard', [
            'kpis' => $kpis,
            'statusChart' => $statusChart,
            'revenueChart' => $revenueChart,
            'recentOrders' => $recentOrders,
        ]);
    }
}
