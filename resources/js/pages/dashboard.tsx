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

export default function Dashboard() {
    /* =========================
     * SAMPLE STATIC DATA
     * ========================= */
    const kpis = [
        { label: 'Today Jobs', value: 12 },
        { label: 'Pending Jobs', value: 5 },
        { label: 'Completed Jobs', value: 7 },
        { label: 'Today Revenue', value: '$1,850' },
    ];

const jobsStatusChart = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [
        {
            label: 'Jobs',
            data: [5, 4, 7],
            backgroundColor: [
                '#F59E0B', // Pending - soft amber
                '#3B82F6', // In Progress - calm blue
                '#10B981', // Completed - emerald green
            ],
        },
    ],
};


    const revenueChart = {
        labels: ['Labor', 'Parts'],
        datasets: [
            {
                data: [1200, 650],
                backgroundColor: ['#6366f1', '#fb7185'],
            },
        ],
    };

    const recentJobs = [
        {
            id: 1,
            customer: 'John Doe',
            vehicle: 'Toyota Corolla',
            status: 'In Progress',
            amount: '$320',
        },
        {
            id: 2,
            customer: 'Mr. Lube',
            vehicle: 'On-site Service',
            status: 'Completed',
            amount: '$1,200',
        },
        {
            id: 3,
            customer: 'Sarah Khan',
            vehicle: 'Honda Civic',
            status: 'Pending',
            amount: '$180',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Garage Dashboard" />

            <div className="flex flex-col gap-6 p-4">
                {/* ================= KPI CARDS ================= */}
                <div className="grid gap-4 md:grid-cols-4">
                    {kpis.map((kpi) => (
                        <Card key={kpi.label}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {kpi.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {kpi.value}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* ================= CHARTS ================= */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Jobs by Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Bar data={jobsStatusChart} />
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

                {/* ================= RECENT JOBS ================= */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Jobs</CardTitle>
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
                                {recentJobs.map((job) => (
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
