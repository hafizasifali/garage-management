import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    hours: number;
    labour_per_hour: number;
    total_labour: number;
    subtotal: number;
    parts: number;
    hst: number;
    invoice_total: number;
    parts_by: string;
    note: string;
};


export default function Index() {
    const {
        reports,
        activeFilters,
        search,
        sort,
        customers,
        vehicles,
        states,
        partsBy,
    } = usePage().props as any;

    const [view, setView] = useState<'list' | 'kanban'>('list');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Reports', href: route('reports.billingReport') },
        { title: 'Billing Report', href: route('reports.billingReport') },
    ];

    /* ---------------- Export to Excel ---------------- */
    const handleExport = () => {
        // Build filename with filter values
        let filename = 'Billing_Report';
        
        if (activeFilters && activeFilters.length > 0) {
            const filterParts = [];
            
            activeFilters.forEach((filter: any) => {
                if (filter.field === 'customer_id' && filter.display) {
                    filterParts.push(`Customer_${filter.display.replace(/\s+/g, '_')}`);
                } else if (filter.field === 'state' && filter.display) {
                    filterParts.push(`State_${filter.display.replace(/\s+/g, '_')}`);
                } else if (filter.field === 'parts_by' && filter.display) {
                    filterParts.push(`PartsBy_${filter.display.replace(/\s+/g, '_')}`);
                } else if (filter.field === 'order_date_from' && filter.value) {
                    filterParts.push(`From_${filter.value.replace(/-/g, '')}`);
                } else if (filter.field === 'order_date_to' && filter.value) {
                    filterParts.push(`To_${filter.value.replace(/-/g, '')}`);
                }
            });
            
            if (filterParts.length > 0) {
                filename += '_' + filterParts.join('_');
            }
        }
        
        if (search && search.trim()) {
            filename += `_Search_${search.trim().replace(/\s+/g, '_').substring(0, 20)}`;
        }
        
        filename += '.xlsx';

        // Map your report data to Excel-friendly format
        const data = reports.data.map((row: SaleReportRow) => ({
            Date: row.date,
            'Invoice #': row.invoice_number,
            'License Plate': row.license_plate,
            Description: row.description || '-',
            'Parts Cost': row.parts_cost,
            'Brake Fluid Cost': row.brake_fluid_cost,
            'Other Cost': row.other_cost,
            'Mention Description if Other Cost': row.mention || '-',
            'Hours': row.hours,
            'Labour Per Hour': row.labour_per_hour,
            'Total Labour': row.total_labour,
            Subtotal: row.subtotal,
            HST: row.hst,
            'Invoice Total Amount': row.invoice_total,
            'Parts by Teejay': row.parts_by,
            Note: row.note || '-',
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

        saveAs(blob, filename);
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
            render: (row: SaleReportRow) => (
                <div className="max-w-[260px] leading-snug break-words whitespace-normal">
                    {row.description || '-'}
                </div>
            ),
        },
        {
            label: 'Parts Cost',
            render: (row: SaleReportRow) => `$${row.parts_cost.toFixed(2)}`,
        },
        {
            label: 'Brake Fluid Cost',
            render: (row: SaleReportRow) =>
                `$${row.brake_fluid_cost.toFixed(2)}`,
        },

        {
            label: 'Other Cost',
            render: (row: SaleReportRow) => `$${row.other_cost.toFixed(2)}`,
        },
        {
            label: 'Mention Description if Other Cost',
            render: (row: SaleReportRow) => row.mention || '',
        },
        {
            label: 'Hours',
            render: (row: SaleReportRow) => `${row.hours}`,
        },
        {
            label: 'Labour Per Hour',
            render: (row: SaleReportRow) =>
                `$${row.labour_per_hour.toFixed(2)}`,
        },
        {
            label: 'Total Labour',
            render: (row: SaleReportRow) => `$${row.total_labour.toFixed(2)}`,
        },
        {
            label: 'Subtotal',
            render: (row: SaleReportRow) => `$${row.subtotal.toFixed(2)}`,
        },
        {
            label: 'HST',
            render: (row: SaleReportRow) => `$${row.hst.toFixed(2)}`,
        },
        {
            label: 'Invoice Total Amount',
            render: (row: SaleReportRow) => `$${row.invoice_total.toFixed(2)}`,
        },
        {
            label: 'Parts by Teejay',
            render: (row: SaleReportRow) => row.parts_by,
        },
        {
            label: 'Note',
            render: (row: SaleReportRow) => row.note || '-',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing Report" />

            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Left spacer */}
                    <div className="flex-1" />

                    {/* Centered Filter/Search */}
                    <div className="w-full max-w-xl">
                        <FilterBar
                            routeName="reports.billing.filter"
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
                                    label: 'State',
                                    field: 'state',
                                    operator: '=',
                                    type: 'select',
                                    options: states.map((s: any) => ({
                                        label: s.name,
                                        value: s.id,
                                    })),
                                },
                                {
                                    label: 'Parts By',
                                    field: 'parts_by',
                                    operator: '=',
                                    type: 'select',
                                    options: partsBy.map((p: any) => ({
                                        label: p.name,
                                        value: p.id,
                                    })),
                                },
                                {
                                    label: 'From',
                                    field: 'order_date_from',   // ← changed
                                    operator: '>=',
                                    type: 'date',
                                },
                                {
                                    label: 'To',
                                    field: 'order_date_to',     // ← changed
                                    operator: '<=',
                                    type: 'date',
                                },
                            ]}
                        />
                    </div>

                    {/* Sort Dropdown */}
                    <div className="w-48">
                        <Select
                            value={sort || 'order_date_desc'}
                            onValueChange={(value) => {
                                router.post(route('reports.billing.filter'), {
                                    filters: activeFilters,
                                    search: search,
                                    sort: value,
                                }, { preserveState: true });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sort by..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="id_desc">ID (Newest First)</SelectItem>
                              <SelectItem value="id_asc">ID (Oldest First)</SelectItem>
                                <SelectItem value="order_date_desc">Order Date (Newest)</SelectItem>
                                <SelectItem value="order_date_asc">Order Date (Oldest)</SelectItem>
                                <SelectItem value="customer_name_asc">Customer (A-Z)</SelectItem>
                                <SelectItem value="customer_name_desc">Customer (Z-A)</SelectItem>
                                </SelectContent>
                        </Select>
                    </div>

                    {/* Right aligned Export */}
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex cursor-pointer items-center gap-1 text-blue-600 hover:text-blue-800"
                            onClick={handleExport}
                        >
                            <LucideDownloadCloud className="h-4 w-4" />
                            Export
                        </Button>
                    </div>
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
