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
    parts_teejay: string;
};

export default function Index() {
    const { reports, filters } = usePage().props as any;
    const [view, setView] = useState<'list' | 'kanban'>('list');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Reports', href: route('reports.billingReport') },
        { title: 'Billing Report', href: route('reports.billingReport') },
    ];

    /* ---------------- Export to Excel ---------------- */
    const handleExport = () => {
        // Map your report data to Excel-friendly format
        const data = reports.data.map((row: SaleReportRow) => ({
            Date: row.date,
            'Invoice #': row.invoice_number,
            'License Plate': row.license_plate,
            Description: row.description || '-',
            'Parts Cost': row.parts_cost,
            'Brake Fluid Cost': row.brake_fluid_cost,
            Mention: row.mention || '-',
            'Other Cost': row.other_cost,
            'Labour / Hour': row.labour_per_hour,
            'Total Labour': row.total_labour,
            Subtotal: row.subtotal,
            Parts: row.parts,
            HST: row.hst,
            'Invoice Total': row.invoice_total,
            'Parts by Teejay': row.parts_teejay,
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Billing Report');

        const excelBuffer = XLSX.write(wb, {
            bookType: 'xlsx',
            type: 'array',
        });

        const blob = new Blob([excelBuffer], {
            type: 'application/octet-stream',
        });

        saveAs(blob, 'Billing_Report.xlsx');
    };

    /* ---------------- Table Columns ---------------- */
    const columns = [
        { label: 'Date', render: (row: SaleReportRow) => row.date },
        { label: 'Invoice #', render: (row: SaleReportRow) => row.invoice_number },
        { label: 'License Plate', render: (row: SaleReportRow) => row.license_plate },
        { label: 'Description', render: (row: SaleReportRow) => row.description || '-' },
        { label: 'Parts Cost', render: (row: SaleReportRow) => `$${row.parts_cost.toFixed(2)}` },
        { label: 'Brake Fluid Cost', render: (row: SaleReportRow) => `$${row.brake_fluid_cost.toFixed(2)}` },
        { label: 'Mention', render: (row: SaleReportRow) => row.mention || '-' },
        { label: 'Other Cost', render: (row: SaleReportRow) => `$${row.other_cost.toFixed(2)}` },
        { label: 'Labour / Hour', render: (row: SaleReportRow) => `$${row.labour_per_hour.toFixed(2)}` },
        { label: 'Total Labour', render: (row: SaleReportRow) => `$${row.total_labour.toFixed(2)}` },
        { label: 'Subtotal', render: (row: SaleReportRow) => `$${row.subtotal.toFixed(2)}` },
        { label: 'Parts', render: (row: SaleReportRow) => `$${row.parts.toFixed(2)}` },
        { label: 'HST', render: (row: SaleReportRow) => `$${row.hst.toFixed(2)}` },
        { label: 'Invoice Total', render: (row: SaleReportRow) => `$${row.invoice_total.toFixed(2)}` },
        { label: 'Parts by Teejay', render: (row: SaleReportRow) => row.parts_teejay },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing Report" />

            <div className="p-4 space-y-4">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold">Billing Report</h1>
                    <Button
                        type="button"
                        variant="secondary"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 cursor-pointer"
                        onClick={handleExport}
                    >
                        <LucideDownloadCloud className="w-4 h-4" />
                        Export
                    </Button>
                </div>

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
