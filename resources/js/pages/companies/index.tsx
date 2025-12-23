import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';
import { useConfirm } from '@/hooks/useConfirm';

/* Reusable index components */
import IndexHeader from '@/components/index/IndexHeader';
import IndexFilters from '@/components/index/IndexFilters';
import ViewToggle from '@/components/index/ViewToggle';
import DataTable from '@/components/index/DataTable';
import Pagination from '@/components/index/Pagination';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ---------------- Types ---------------- */
type Company = {
    id: number;
    name: string;
    email: string;
    phone: string;
    active: boolean;
    country?: { name: string };
    currency?: { name: string };
};

export default function Index() {
    const { companies, filters } = usePage().props as any;
    const form = useForm();
    const { confirm } = useConfirm();

    const [view, setView] = useState<'list' | 'kanban'>('list');
    const [selected, setSelected] = useState<number[]>([]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Companies', href: route('companies.index') },
    ];

    /* ---------------- Actions ---------------- */
    const handleDelete = async (id: number, name: string) => {
        const ok = await confirm({
            title: 'Delete Company?',
            text: `Company "${name}" will be permanently removed.`,
            confirmText: 'Delete',
        });
        if (!ok) return;

        form.delete(route('companies.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Company deleted'),
        });
    };

    const handleBulkDelete = async () => {
        const ok = await confirm({
            title: 'Delete selected companies?',
            text: `${selected.length} companies will be permanently removed.`,
            confirmText: 'Delete',
        });
        if (!ok) return;

        router.post(
            route('companies.bulk-delete'),
            { ids: selected },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Companies deleted');
                    setSelected([]);
                },
            }
        );
    };

    const toggleAll = () => {
        setSelected(
            selected.length === companies.data.length
                ? []
                : companies.data.map((c: Company) => c.id)
        );
    };

    const toggleOne = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    /* ---------------- Table Columns ---------------- */
    const columns = [
        { label: 'Name', render: (row: Company) => row.name },
        { label: 'Email', render: (row: Company) => row.email },
        { label: 'Phone', render: (row: Company) => row.phone },
        { label: 'Country', render: (row: Company) => row.country?.name },
        { label: 'Currency', render: (row: Company) => row.currency?.name },
        { label: 'Active', render: (row: Company) => (row.active ? 'Yes' : 'No') },
        {
            label: 'Actions',
            render: (row: Company) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild title="Edit">
                        <Link href={route('companies.edit', row.id)}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(row.id, row.name)}
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    /* ---------------- Per-page options ---------------- */
    const perPageOptions = [10, 25, 50, 100,500];

    const handlePerPageChange = (value: number) => {
        router.get(
            route('companies.index'),
            { ...filters, per_page: value },
            { preserveState: true, replace: true }
        );
    };

    /* ---------------- Search / Active Filter ---------------- */
    const handleFilterChange = (key: string, value: any) => {
        router.get(
            route('companies.index'),
            { ...filters, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Companies" />

            <div className="p-4 space-y-4">
                {/* Header */}
                <IndexHeader
                    title="Companies"
                    bulkCount={selected.length}
                    onBulkDelete={handleBulkDelete}
                    view={view}
                    onViewChange={setView}
                    createLink={route('companies.create')}
                />

                {/* Filters + per-page selector */}
                <IndexFilters
                    filters={filters}
                    perPage={filters?.per_page || 10}
                    perPageOptions={perPageOptions}
                    onPerPageChange={handlePerPageChange}
                    onChange={handleFilterChange}
                />

                {/* List / Kanban */}
                {view === 'list' ? (
                    <DataTable
                        data={companies.data}
                        selected={selected}
                        toggleAll={toggleAll}
                        toggleOne={toggleOne}
                        columns={columns}
                    />
                ) : (
                    <div className="grid grid-cols-4 gap-4">
                        {companies.data.map((company: Company) => (
                            <div
                                key={company.id}
                                className="border rounded-lg p-4 bg-white shadow-sm"
                            >
                                <h3 className="font-semibold">{company.name}</h3>
                                <p className="text-sm text-gray-500">{company.email}</p>

                                <div className="flex justify-between items-center mt-3">
                                    <span
                                        className={`text-xs px-2 py-1 rounded ${
                                            company.active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}
                                    >
                                        {company.active ? 'Active' : 'Inactive'}
                                    </span>

                                    <Link
                                        href={route('companies.edit', company.id)}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                <Pagination meta={companies} />
            </div>
        </AppLayout>
    );
}
