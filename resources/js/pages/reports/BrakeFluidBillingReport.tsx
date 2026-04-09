import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { LucideDownloadCloud } from 'lucide-react';

/* Reusable index components */
import DataTable from '@/components/index/DataTable';
import Pagination from '@/components/index/Pagination';

/* Excel Export */
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import FilterBar from '@/components/filters/FilterBar';
import { FilterRule } from '@/types/filter';

/* ---------------- Types ---------------- */
type BrakeFluidReportRow = {
    date: string;
    invoice_number: string;
    license_plate: string;
    brake_fluid_cost: number;
    hst: number;
    grand_total: number;
};

export default function Index() {
    const {
        reports,
        activeFilters,
        search,
        customers,
        vehicles,
    } = usePage().props as any;

    const [view, setView] = useState<'list' | 'kanban'>('list');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Reports', href: route('reports.brakeFluidBillingReport') },
        { title: 'Brake Fluid Billing Report', href: route('reports.brakeFluidBillingReport') },
    ];

    /* ---------------- Export to Excel ---------------- */
    const handleExport = () => {
        // Map your report data to Excel-friendly format
        const data = reports.data.map((row: BrakeFluidReportRow) => ({
            Date: row.date,
            'Invoice Number': row.invoice_number,
            'Licence Plate Number': row.license_plate,
            'Brake Fluid Cost': row.brake_fluid_cost,
            HST: row.hst,
            'Grand Total': row.grand_total,
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Brake Fluid Billing Report');

        const excelBuffer = XLSX.write(wb, {
            bookType: 'xlsx',
            type: 'array',
        });

        const blob = new Blob([excelBuffer], {
            type: 'application/octet-stream',
        });

        saveAs(blob, 'Brake_Fluid_Billing_Report.xlsx');
    };

    /* ---------------- Table Columns ---------------- */
    const columns = [
        { label: 'Date', render: (row: BrakeFluidReportRow) => row.date },
        {
            label: 'Invoice Number',
            render: (row: BrakeFluidReportRow) => row.invoice_number,
        },
        {
            label: 'Licence Plate Number',
            render: (row: BrakeFluidReportRow) => row.license_plate,
        },
        {
            label: 'Brake Fluid Cost',
            render: (row: BrakeFluidReportRow) => `$${row.brake_fluid_cost.toFixed(2)}`,
        },
        {
            label: 'HST',
            render: (row: BrakeFluidReportRow) => `$${row.hst.toFixed(2)}`,
        },
        {
            label: 'Grand Total',
            render: (row: BrakeFluidReportRow) => `$${row.grand_total.toFixed(2)}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Brake Fluid Billing Report" />

            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    {/* Left spacer */}
                    <div className="flex-1" />

                    {/* Centered Filter/Search */}
                    <div className="w-full max-w-xl">
                        <FilterBar
                            routeName="reports.brakeFluidBillingReport.filter"
                            placeholder="Search By Customer, Vehicle, Invoice, Plate..."
                            filters={activeFilters as FilterRule[]}
                            search={search}
                            config={[
                                {
                                    label: 'Customer',
                                    field: 'customer_id',
                                    operator: '=',
                                    type: 'select',
                                    options: customers.map((c: any) => ({
                                        label: c.name,
                                        value: c.id,
                                    })),
                                },
                                {
                                    label: 'Order Date From',
                                    field: 'order_date_from',
                                    operator: '>=',
                                    type: 'date',
                                },
                                {
                                    label: 'Order Date To',
                                    field: 'order_date_to',
                                    operator: '<=',
                                    type: 'date',
                                },
                            ]}
                        />
                    </div>

                    {/* Right: Export Button */}
                    <div className="flex flex-1 justify-end">
                    <Button onClick={handleExport} variant="outline">
                        <LucideDownloadCloud className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={reports.data}
                    view={view}
                    setView={setView}
                />

                <Pagination links={reports.links} />
            </div>
        </AppLayout>
    );
}