import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import IndexHeader from '@/components/index/IndexHeader';
import IndexFilters from '@/components/index/IndexFilters';
import DataTable from '@/components/index/DataTable';
import Pagination from '@/components/index/Pagination';
import { Button } from '@/components/ui/button';

type Supplier = {
    id: number;
    name: string;
    email: string;
    phone: string;
    active: boolean;
};

export default function SuppliersIndex() {
    const { suppliers, filters } = usePage().props as any;
    const form = useForm();
    const [selected, setSelected] = useState<number[]>([]);

    const columns = [
        { label: 'ID', render: (row: Supplier) => row.id },
        { label: 'Name', render: (row: Supplier) => row.name },
        { label: 'Email', render: (row: Supplier) => row.email },
        { label: 'Phone', render: (row: Supplier) => row.phone },
        // { label: 'Active', render: (row: Supplier) => (row.active ? 'Yes' : 'No') },
        {
            label: 'Actions',
            render: (row: Supplier) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                        <Link href={route('suppliers.edit', row.id)}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    {/*<Button*/}
                    {/*    size="sm"*/}
                    {/*    variant="destructive"*/}
                    {/*    onClick={() =>*/}
                    {/*        form.delete(route('suppliers.destroy', row.id), {*/}
                    {/*            onSuccess: () => toast.success('Supplier archived'),*/}
                    {/*        })*/}
                    {/*    }*/}
                    {/*>*/}
                    {/*    <Trash2 className="h-4 w-4" />*/}
                    {/*</Button>*/}
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Suppliers" />

            <div className="p-4 space-y-4">
                <IndexHeader
                    title="Suppliers"
                    createLink={route('suppliers.create')}
                />

                <IndexFilters
                    filters={filters}
                    perPage={filters?.per_page || 10}
                    perPageOptions={[10, 25, 50, 100]}
                    onChange={(k, v) =>
                        router.get(route('suppliers.index'), { ...filters, [k]: v })
                    }
                />

                <DataTable
                    data={suppliers.data}
                    columns={columns}
                    selected={selected}
                    selectable={false}
                    toggleAll={() => {}}
                    toggleOne={() => {}}
                />

                <Pagination meta={suppliers} />
            </div>
        </AppLayout>
    );
}
