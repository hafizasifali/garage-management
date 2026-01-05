import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';
import { useConfirm } from '@/hooks/useConfirm';

import IndexHeader from '@/components/index/IndexHeader';
import IndexFilters from '@/components/index/IndexFilters';
import DataTable from '@/components/index/DataTable';
import Pagination from '@/components/index/Pagination';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Employee = {
    id: number;
    name: string;
    email: string;
    active: boolean;
    company?: { name: string };
};

export default function EmployeeIndex() {
    const { employees, filters } = usePage().props as any;
    const form = useForm();
    const { confirm } = useConfirm();

    const [selected, setSelected] = useState<number[]>([]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Employees', href: route('employees.index') },
    ];

    const handleDelete = async (id: number, name: string) => {
        const ok = await confirm({
            title: 'Delete Employee?',
            text: `Employee "${name}" will be deactivated.`,
            confirmText: 'Delete',
        });
        if (!ok) return;

        form.delete(route('employees.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Employee deactivated'),
        });
    };

    const columns = [
        { label: 'Name', render: (row: Employee) => row.name },
        { label: 'Email', render: (row: Employee) => row.email },
        { label: 'Company', render: (row: Employee) => row.company?.name },
        {
            label: 'Active',
            render: (row: Employee) => (row.active ? 'Yes' : 'No'),
        },
        {
            label: 'Actions',
            render: (row: Employee) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                        <Link href={route('employees.edit', row.id)}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(row.id, row.name)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />

            <div className="p-4 space-y-4">
                <IndexHeader
                    title="Employees"
                    createLink={route('employees.create')}
                />

                <IndexFilters
                    filters={filters}
                    perPage={filters?.per_page || 10}
                    perPageOptions={[10, 25, 50, 100]}
                    onPerPageChange={(v) =>
                        router.get(route('employees.index'), { ...filters, per_page: v }, { replace: true })
                    }
                    onChange={(k, v) =>
                        router.get(route('employees.index'), { ...filters, [k]: v }, { replace: true })
                    }
                />

                <DataTable
                    data={employees.data}
                    selected={selected}
                    toggleAll={() => {}}
                    toggleOne={() => {}}
                    columns={columns}
                />

                <Pagination meta={employees} />
            </div>
        </AppLayout>
    );
}
