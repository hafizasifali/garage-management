import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import IndexHeader from '@/components/index/IndexHeader';
import IndexFilters from '@/components/index/IndexFilters';
import DataTable from '@/components/index/DataTable';
import Pagination from '@/components/index/Pagination';
import { Button } from '@/components/ui/button';

type Customer = {
    id: number;
    name: string;
    email: string;
    phone: string;
    active: boolean;
    type?: string;
    group?: { name: string } | null;
};

export default function CustomersIndex() {
    const { customers, filters, flash } = usePage().props as any;
    const form = useForm();
    const [selected, setSelected] = useState<number[]>([]);
    const flashShownRef = useRef({ success: false, error: false });

    useEffect(() => {
        if (flash?.success && !flashShownRef.current.success) {
            flashShownRef.current.success = true;
            toast.success(flash.success);
        }
        if (flash?.error && !flashShownRef.current.error) {
            flashShownRef.current.error = true;
            toast.error(flash.error);
        }
    }, [flash]);

    const columns = [
        { label: 'ID', render: (row: Customer) => row.id },
        { label: 'Name', render: (row: Customer) => row.name },
        { label: 'Email', render: (row: Customer) => row.email },
        { label: 'Phone', render: (row: Customer) => row.phone },
        { label: 'Type', render: (row: Customer) => row.type },
        { label: 'Group', render: (row: Customer) => row.group?.name ?? '-' },
        {
            label: 'Actions',
            render: (row: Customer) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                        <Link href={route('customers.edit', row.id)}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    {/*<Button*/}
                    {/*    size="sm"*/}
                    {/*    variant="destructive"*/}
                    {/*    onClick={() =>*/}
                    {/*        form.delete(route('customers.destroy', row.id), {*/}
                    {/*            onSuccess: () => toast.success('Customer archived'),*/}
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
            <Head title="Customers" />

            <div className="p-4 space-y-4">
                <IndexHeader
                    title="Customers"
                    createLink={route('customers.create')}
                />

                <IndexFilters
                    filters={filters}
                    perPage={filters?.per_page || 10}
                    perPageOptions={[10, 25, 50, 100]}
                    onChange={(k, v) =>
                        router.get(route('customers.index'), { ...filters, [k]: v })
                    }
                    searchPlaceholder={'Search by Name, Email'}
                />

                <DataTable
                    data={customers.data}
                    columns={columns}
                    selected={selected}
                    selectable={false}
                    toggleAll={() => {}}
                    toggleOne={() => {}}
                />

                <Pagination meta={customers} />
            </div>
        </AppLayout>
    );
}
