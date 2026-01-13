import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import {} from '@/lib/chart';
import { Bar } from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({
    kpis,
    statusChart,
    revenueChart,
    recentOrders,
}) {
   


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-4">
                {/* ================= KPI CARDS ================= */}
                <div className="grid gap-4 md:grid-cols-4">
                    {kpis.map((kpi) => {
                        // Map some colors based on label or index
                        const bgColorClass = (() => {
                            switch (kpi.label) {
                                case 'Today Orders':
                                    return 'bg-indigo-100 text-indigo-800'; // Odoo purple-ish
                                case 'Pending Orders':
                                    return 'bg-orange-100 text-orange-800'; // Odoo orange
                                case 'Completed Orders':
                                    return 'bg-green-100 text-green-800';  // Odoo green
                                case 'Today Revenue':
                                    return 'bg-pink-100 text-pink-800';   // Odoo pink/magenta
                                default:
                                    return 'bg-gray-100 text-gray-800';    // fallback neutral
                            }
                        })();

                        return (
                            <Card key={kpi.label} className={`text-center ${bgColorClass}`}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {kpi.label}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{kpi.value}</div>
                                </CardContent>
                            </Card>
                        );
                    })}

                </div>

                {/* ================= CHARTS ================= */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Orders by Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Bar data={statusChart} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <div className="w-[260px]">
                                <Doughnut data={revenueChart} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ================= RECENT Orders ================= */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Amount
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentOrders.map((job) => (
                                    <TableRow key={job.id}>
                                        <TableCell>{job.customer}</TableCell>
                                        <TableCell>{job.vehicle}</TableCell>
                                        <TableCell>{job.status}</TableCell>
                                        <TableCell className="text-right">
                                            {job.amount}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
