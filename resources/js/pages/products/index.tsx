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

type Product = {
    id: number;
    name: string;
    type: string;
    sale_price: string;
    active: boolean;
    category?: { name: string };
    uom?: { name: string };
};

export default function ProductIndex() {
    const { products, filters } = usePage().props as any;
    const form = useForm();
    const { confirm } = useConfirm();
    const [selected, setSelected] = useState<number[]>([]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Products', href: route('products.index') },
    ];

    const handleDelete = async (id: number, name: string) => {
        const ok = await confirm({
            title: 'Delete Product?',
            text: `Product "${name}" will be deactivated.`,
            confirmText: 'Delete',
        });
        if (!ok) return;

        form.delete(route('products.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Product deactivated'),
        });
    };

    const columns = [
        { label: 'Name', render: (row: Product) => row.name },
        { label: 'Category', render: (row: Product) => row.category?.name },
        { label: 'UOM', render: (row: Product) => row.uom?.name },
        { label: 'Type', render: (row: Product) => row.type },
        { label: 'Sale Price', render: (row: Product) => row.sale_price },
        {
            label: 'Active',
            render: (row: Product) => (row.active ? 'Yes' : 'No'),
        },
        {
            label: 'Actions',
            render: (row: Product) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                        <Link href={route('products.edit', row.id)}>
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
            <Head title="Products" />

            <div className="p-4 space-y-4">
                <IndexHeader
                    title="Products"
                    createLink={route('products.create')}
                />

                <IndexFilters
                    filters={filters}
                    perPage={filters?.per_page || 10}
                    perPageOptions={[10, 25, 50, 100]}
                    onPerPageChange={(v) =>
                        router.get(route('products.index'), { ...filters, per_page: v }, { replace: true })
                    }
                    onChange={(k, v) =>
                        router.get(route('products.index'), { ...filters, [k]: v }, { replace: true })
                    }
                />

                <DataTable
                    data={products.data}
                    selected={selected}
                    toggleAll={() => {}}
                    toggleOne={() => {}}
                    columns={columns}
                />

                <Pagination meta={products} />
            </div>
        </AppLayout>
    );
}
