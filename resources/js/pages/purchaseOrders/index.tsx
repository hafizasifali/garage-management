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

type PurchaseOrderType = {
  id: number;
  supplier: { name: string };
  order_date: string;
  state: string;
  total_amount: number;
};

export default function Index() {
  const { orders } = usePage().props as any;
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
        : orders.data.map((o: PurchaseOrderType) => o.id)
    );
  };

  const toggleOne = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  /* ---------------- Table Columns ---------------- */
  const columns = [
    { label: 'Supplier', render: (row: PurchaseOrderType) => row.supplier_name },
    { label: 'Order Date', render: (row: PurchaseOrderType) => row.order_date },
    { label: 'State', render: (row: PurchaseOrderType) => row.state },
    { label: 'Total Amount', render: (row: PurchaseOrderType) => row.total_amount },
    {
      label: 'Actions',
      render: (row: PurchaseOrderType) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href={route('purchase-orders.edit', row.id)}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Purchase Orders" />

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Purchase Orders</h1>
          <Button asChild>
            <Link href={route('purchase-orders.create')}>Create</Link>
          </Button>
        </div>

        <DataTable
          data={orders.data}
          selected={selected}
          toggleAll={toggleAll}
          toggleOne={toggleOne}
          columns={columns}
        />

        <Pagination meta={orders} />
      </div>
    </AppLayout>
  );
}
