import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/index/DataTable';
import Pagination from '@/components/index/Pagination';
import { route } from 'ziggy-js';
import { toDisplayDate } from '@/lib/date';
import FilterBar from '@/components/filters/FilterBar';
import { FilterRule } from '@/types/filter';

type Order = {
  id: number;
  order_date: string;
  state: string;
  total_amount: number;
  customer_name: string;
  vehicle_name: string;
};

export default function Index() {
  const {
    orders,
    activeFilters,
    search,
    customers,
    vehicles,
    states,
    partsBy,
  } = usePage().props as any;

  const [selected, setSelected] = useState<number[]>([]);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Orders', href: '/orders' },
  ];

  const toggleAll = () => {
    setSelected(
      selected.length === orders.data.length
        ? []
        : orders.data.map((j: Order) => j.id)
    );
  };

  const toggleOne = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const columns = [
    { label: 'ID', render: (row: Order) => row.id },
    { label: 'Customer', render: (row: Order) => row.customer_name },
    { label: 'Vehicle', render: (row: Order) => row.vehicle_name },
    { label: 'Order Date', render: (row: Order) => toDisplayDate(row.order_date) },
    { label: 'State', render: (row: Order) => row.state },
    { label: 'Total Amount ($)', render: (row: Order) => row.total_amount },
    {
      label: 'Actions',
      render: (row: Order) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href={route('orders.edit', row.id)}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Orders" />

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          
           {/* Filters */}
        <FilterBar
          routeName="orders.filter"
          placeholder='Search Orders By Customer, Vehicle, State...'
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
              label: 'Vehicle',
              field: 'vehicle_id',
              operator: '=',
              type: 'select',
              options: vehicles.map((v: any) => ({
                label: v.plate_no,
                value: v.id,
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
              label: 'Order Date',
              field: 'order_date',
              operator: '=',
              type: 'date',
            },
          ]}
        />

          <Button asChild>
            <Link href={route('orders.create')}>Create</Link>
          </Button>
        </div>

       

        {/* Table */}
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
