import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';
import { useConfirm } from '@/hooks/useConfirm';

import IndexHeader from '@/components/index/IndexHeader';
import IndexFilters from '@/components/index/IndexFilters';
import ViewToggle from '@/components/index/ViewToggle';
import DataTable from '@/components/index/DataTable';
import Pagination from '@/components/index/Pagination';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Vehicle = {
    id: number;
    license_plate: string;
    model: string;
    year?: string;
    active: boolean;
    customer?: { name: string };
};

export default function VehicleIndex() {
    const { vehicles, filters } = usePage().props as any;
    const form = useForm();
    const { confirm } = useConfirm();

    const [view, setView] = useState<'list' | 'kanban'>('list');
    const [selected, setSelected] = useState<number[]>([]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vehicles', href: route('vehicles.index') },
    ];

    const handleDelete = async (id: number, name: string) => {
        const ok = await confirm({
            title: 'Delete Vehicle?',
            text: `Vehicle "${name}" will be permanently removed.`,
            confirmText: 'Delete',
        });
        if (!ok) return;

        form.delete(route('vehicles.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Vehicle deleted'),
        });
    };

    const handleBulkDelete = async () => {
        const ok = await confirm({
            title: 'Delete selected vehicles?',
            text: `${selected.length} vehicles will be permanently removed.`,
            confirmText: 'Delete',
        });
        if (!ok) return;

        router.post(
            route('vehicles.bulk-delete'),
            { ids: selected },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Vehicles deleted');
                    setSelected([]);
                },
            }
        );
    };

    const toggleAll = () =>
        setSelected(selected.length === vehicles.data.length ? [] : vehicles.data.map((v: Vehicle) => v.id));

    const toggleOne = (id: number) =>
        setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

    const columns = [
        { label: 'ID', render: (row: Vehicle) => row.id },
        { label: 'VIN', render: (row: Vehicle) => row.vin },
        { label: 'License Plate', render: (row: Vehicle) => row.license_plate },
        { label: 'Model', render: (row: Vehicle) => row.model },
        { label: 'Year', render: (row: Vehicle) => row.year },
        { label: 'Customer', render: (row: Vehicle) => row.customer?.name },
        // { label: 'Active', render: (row: Vehicle) => (row.active ? 'Yes' : 'No') },
        {
            label: 'Actions',
            render: (row: Vehicle) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild title="Edit">
                        <Link href={route('vehicles.edit', row.id)}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    {/*<Button*/}
                    {/*    size="sm"*/}
                    {/*    variant="destructive"*/}
                    {/*    onClick={() => handleDelete(row.id, row.license_plate)}*/}
                    {/*    title="Delete"*/}
                    {/*>*/}
                    {/*    <Trash2 className="h-4 w-4" />*/}
                    {/*</Button>*/}
                </div>
            ),
        },
    ];

    const perPageOptions = [10, 25, 50, 100];

    const handlePerPageChange = (value: number) => {
        router.get(route('vehicles.index'), { ...filters, per_page: value }, { preserveState: true, replace: true });
    };

    const handleFilterChange = (key: string, value: any) => {
        router.get(route('vehicles.index'), { ...filters, [key]: value }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicles" />

            <div className="p-4 space-y-4">
                <IndexHeader
                    title="Vehicles"
                    bulkCount={selected.length}
                    onBulkDelete={handleBulkDelete}
                    view={view}
                    onViewChange={setView}
                    createLink={route('vehicles.create')}
                />

                <IndexFilters
                    filters={filters}
                    perPage={filters?.per_page || 10}
                    perPageOptions={perPageOptions}
                    onPerPageChange={handlePerPageChange}
                    onChange={handleFilterChange}
                />

                {view === 'list' ? (
                    <DataTable
                        data={vehicles.data}
                        selected={selected}
                        selectable={false}
                        toggleAll={toggleAll}
                        toggleOne={toggleOne}
                        columns={columns}
                    />
                ) : (
                    <div className="grid grid-cols-4 gap-4">
                        {vehicles.data.map((vehicle: Vehicle) => (
                            <div key={vehicle.id} className="border rounded-lg p-4 bg-white shadow-sm">
                                <h3 className="font-semibold">{vehicle.license_plate}</h3>
                                <p className="text-sm text-gray-500">{vehicle.model}</p>
                                <div className="flex justify-between items-center mt-3">
                                    <span
                                        className={`text-xs px-2 py-1 rounded ${
                                            vehicle.active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}
                                    >
                                        {vehicle.active ? 'Active' : 'Inactive'}
                                    </span>
                                    <Link
                                        href={route('vehicles.edit', vehicle.id)}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Pagination meta={vehicles} />
            </div>
        </AppLayout>
    );
}
