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
import DataTable from '@/components/index/DataTable';
import Pagination from '@/components/index/Pagination';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ---------------- Types ---------------- */
type Role = {
    id: number;
    name: string;
};

type User = {
    id: number;
    name: string;
    email: string;
    active: boolean;
    roles: Role[];
};

export default function Index() {
    const { users, filters } = usePage().props as any;
    const form = useForm();
    const { confirm } = useConfirm();

    const [view, setView] = useState<'list' | 'kanban'>('list');
    const [selected, setSelected] = useState<number[]>([]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Users', href: route('users.index') },
    ];

    /* ---------------- Actions ---------------- */
    const handleDelete = async (id: number, name: string) => {
        const ok = await confirm({
            title: 'Deactivate User?',
            text: `User "${name}" will be deactivated.`,
            confirmText: 'Deactivate',
        });
        if (!ok) return;

        form.delete(route('users.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('User deactivated'),
        });
    };

    const handleBulkDelete = async () => {
        const ok = await confirm({
            title: 'Deactivate selected users?',
            text: `${selected.length} users will be deactivated.`,
            confirmText: 'Deactivate',
        });
        if (!ok) return;

        router.post(
            route('users.bulk-delete'),
            { ids: selected },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Users deactivated');
                    setSelected([]);
                },
            }
        );
    };

    const toggleAll = () => {
        setSelected(
            selected.length === users.data.length
                ? []
                : users.data.map((u: User) => u.id)
        );
    };

    const toggleOne = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    /* ---------------- Table Columns ---------------- */
    const columns = [
        { label: 'Name', render: (row: User) => row.name },
        { label: 'Email', render: (row: User) => row.email },
        {
            label: 'Roles',
            render: (row: User) =>
                row.roles.length
                    ? row.roles.map((r) => r.name).join(', ')
                    : '-',
        },
        { label: 'Active', render: (row: User) => (row.active ? 'Yes' : 'No') },
        {
            label: 'Actions',
            render: (row: User) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild title="Edit">
                        <Link href={route('users.edit', row.id)}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(row.id, row.name)}
                        title="Deactivate"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    /* ---------------- Per-page options ---------------- */
    const perPageOptions = [10, 25, 50, 100, 500];

    const handlePerPageChange = (value: number) => {
        router.get(
            route('users.index'),
            { ...filters, per_page: value },
            { preserveState: true, replace: true }
        );
    };

    /* ---------------- Search / Active Filter ---------------- */
    const handleFilterChange = (key: string, value: any) => {
        router.get(
            route('users.index'),
            { ...filters, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="p-4 space-y-4">
                {/* Header */}
                <IndexHeader
                    title="Users"
                    bulkCount={selected.length}
                    onBulkDelete={handleBulkDelete}
                    view={view}
                    onViewChange={setView}
                    createLink={route('users.create')}
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
                        data={users.data}
                        selected={selected}
                        toggleAll={toggleAll}
                        toggleOne={toggleOne}
                        columns={columns}
                    />
                ) : (
                    <div className="grid grid-cols-4 gap-4">
                        {users.data.map((user: User) => (
                            <div
                                key={user.id}
                                className="border rounded-lg p-4 bg-white shadow-sm"
                            >
                                <h3 className="font-semibold">{user.name}</h3>
                                <p className="text-sm text-gray-500">{user.email}</p>

                                <p className="text-xs mt-1 text-gray-600">
                                    {user.roles.map((r) => r.name).join(', ') || 'No roles'}
                                </p>

                                <div className="flex justify-between items-center mt-3">
                                    <span
                                        className={`text-xs px-2 py-1 rounded ${
                                            user.active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}
                                    >
                                        {user.active ? 'Active' : 'Inactive'}
                                    </span>

                                    <Link
                                        href={route('users.edit', user.id)}
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
                <Pagination meta={users} />
            </div>
        </AppLayout>
    );
}
