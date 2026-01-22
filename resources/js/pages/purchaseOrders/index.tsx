import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import toast from 'react-hot-toast';
import { useConfirm } from '@/hooks/useConfirm';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* Reusable components */
import DataTable from '@/components/index/DataTable';
import Pagination from '@/components/index/Pagination';
import { route } from 'ziggy-js';
import { toDisplayDate } from '@/lib/date';
import FilterBar from '@/components/filters/FilterBar';
import { FilterRule } from '@/types/filter';
import suppliers from '@/routes/suppliers';
import StatusBadge from '@/components/ui/status-badge';

type PurchaseOrder = {
  id: number;
  supplier: { name: string };
  order_date: string;
  state: string;
  total_amount: number;
};

export default function Index({ orders, suppliers,states,activeFilters, search }) {
    const { confirm } = useConfirm();
    const [selected, setSelected] = useState<number[]>([]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Purchase Orders', href: '/purchase-orders' },
    ];

    /* ---------------- Actions ---------------- */
    const handleDelete = async (id: number) => {
        const ok = await confirm({
            title: 'Delete Purchase Order?',
            text: `This purchase order will be permanently removed.`,
            confirmText: 'Delete',
        });
        if (!ok) return;

        router.delete(route('purchase-orders.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Purchase Order deleted'),
        });
    };

    const toggleAll = () => {
        setSelected(
            selected.length === orders.data.length
                ? []
                : orders.data.map((o: PurchaseOrder) => o.id),
        );
    };

    const toggleOne = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    /* ---------------- Table Columns ---------------- */
    const columns = [
        {
            label: 'ID',
            render: (row: PurchaseOrder) => row.id,
        },
        {
            label: 'Supplier',
            render: (row: PurchaseOrder) => row.supplier_name,
        },
        {
            label: 'Order Date',
            render: (row: PurchaseOrder) => toDisplayDate(row.order_date),
        },
        {
            label: 'Total Amount',
            render: (row: PurchaseOrder) => row.total_amount,
        },
        {
            label: 'State',
            render: (row: PurchaseOrder) => (
                <StatusBadge value={row.state} states={states} />
            ),
        },
        {
            label: 'Actions',
            render: (row: PurchaseOrder) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                        <Link href={route('purchase-orders.edit', row.id)}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    {/*<Button*/}
                    {/*  size="sm"*/}
                    {/*  variant="destructive"*/}
                    {/*  onClick={() => handleDelete(row.id)}*/}
                    {/*>*/}
                    {/*  <Trash2 className="h-4 w-4" />*/}
                    {/*</Button>*/}
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Purchase Orders" />

            <div className="space-y-4 p-4">
                <div className="mb-4 flex items-center">
                    {/* Left spacer */}
                    <div className="flex-1" />

                    {/* Centered Filter/Search */}
                    <div className="w-full max-w-xl">
                        <FilterBar
                            routeName="purchase-orders.filter"
                            placeholder="Search Orders By Supplier, State..."
                            filters={activeFilters as FilterRule[]}
                            search={search}
                            config={[
                                {
                                    label: 'Order ID',
                                    field: 'id',
                                    operator: '=',
                                    type: 'number',
                                },
                                {
                                    label: 'Supplier',
                                    field: 'supplier_id',
                                    operator: '=',
                                    type: 'select',
                                    options: suppliers.map((c: any) => ({
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
                                    label: 'Order Date',
                                    field: 'order_date',
                                    operator: '=',
                                    type: 'date',
                                },
                            ]}
                        />
                    </div>

                    {/* Right aligned Create button */}
                    <div className="flex flex-1 justify-end">
                        <Button asChild>
                            <Link href={route('purchase-orders.create')}>
                                Create
                            </Link>
                        </Button>
                    </div>
                </div>

                <DataTable
                    data={orders.data}
                    selected={selected}
                    selectable={false}
                    toggleAll={toggleAll}
                    toggleOne={toggleOne}
                    columns={columns}
                />

                <Pagination meta={orders} />
            </div>
        </AppLayout>
    );
}
