import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

/* Reusable index components */
import IndexHeader from '@/components/index/IndexHeader';
import IndexFilters from '@/components/index/IndexFilters';
import DataTable from '@/components/index/DataTable';
import Pagination from '@/components/index/Pagination';

/* ---------------- Types ---------------- */
type SaleReportRow = {
    id: number;
    date: string;
    invoice_number: string;
    license_plate: string;
    description: string;
    parts_cost: number;
    brake_fluid_cost: number;
    mention: string;
    other_cost: number;
    labour_per_hour: number;
    total_labour: number;
    subtotal: number;
    parts: number;
    hst: number;
    invoice_total: number;
    invoice_by: string;
};

export default function Index() {
    const { reports, filters } = usePage().props as any;

    const [view, setView] = useState<'list' | 'kanban'>('list');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Reports', href: route('reports.billingReport') },
        { title: 'Billing Report', href: route('reports.billingReport') },
    ];

    /* ---------------- Per-page options ---------------- */
    const perPageOptions = [10, 25, 50, 100, 500];

    const handlePerPageChange = (value: number) => {
        router.get(
            route('reports.billingReport'),
            { ...filters, per_page: value },
            { preserveState: true, replace: true }
        );
    };

    /* ---------------- Filters ---------------- */
    const handleFilterChange = (key: string, value: any) => {
        router.get(
            route('reports.billingReport'),
            { ...filters, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    /* ---------------- Table Columns ---------------- */
    const columns = [
        { label: 'Date', render: (row: SaleReportRow) => row.date },
        {
            label: 'Invoice #',
            render: (row: SaleReportRow) => row.invoice_number,
        },
        {
            label: 'License Plate',
            render: (row: SaleReportRow) => row.license_plate,
        },
        {
            label: 'Description',
            render: (row: SaleReportRow) => row.description || '-',
        },
        {
            label: 'Parts Cost',
            render: (row: SaleReportRow) =>
                `$${row.parts_cost.toFixed(2)}`,
        },
        {
            label: 'Brake Fluid Cost',
            render: (row: SaleReportRow) =>
                `$${row.brake_fluid_cost.toFixed(2)}`,
        },
        {
            label: 'Mention',
            render: (row: SaleReportRow) => row.mention || '-',
        },
        {
            label: 'Other Cost',
            render: (row: SaleReportRow) =>
                `$${row.other_cost.toFixed(2)}`,
        },
        {
            label: 'Labour / Hour',
            render: (row: SaleReportRow) =>
                `$${row.labour_per_hour.toFixed(2)}`,
        },
        {
            label: 'Total Labour',
            render: (row: SaleReportRow) =>
                `$${row.total_labour.toFixed(2)}`,
        },
        {
            label: 'Subtotal',
            render: (row: SaleReportRow) =>
                `$${row.subtotal.toFixed(2)}`,
        },
        {
            label: 'Parts',
            render: (row: SaleReportRow) =>
                `$${row.parts.toFixed(2)}`,
        },
        {
            label: 'HST',
            render: (row: SaleReportRow) =>
                `$${row.hst.toFixed(2)}`,
        },
        {
            label: 'Invoice Total',
            render: (row: SaleReportRow) =>
                `$${row.invoice_total.toFixed(2)}`,
        },
        {
            label: 'Invoice By',
            render: (row: SaleReportRow) => row.invoice_by,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing Report" />

            <div className="p-4 space-y-4">
                {/* Header */}

                {/* Filters */}
                <IndexFilters
                    filters={filters}
                    perPage={filters?.per_page || 10}
                    perPageOptions={perPageOptions}
                    onPerPageChange={handlePerPageChange}
                    onChange={handleFilterChange}
                />

                {/* Report Table */}
                {view === 'list' && (
                    <DataTable
                        data={reports.data}
                        columns={columns}
                        selectable={false}
                    />
                )}

                {/* Pagination */}
                <Pagination meta={reports} />
            </div>
        </AppLayout>
    );
}
