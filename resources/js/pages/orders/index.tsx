import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import {
    CheckCircle,
    Edit,
    Eye,
    MoreVertical,
    Send,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/index/DataTable';
import Pagination from '@/components/index/Pagination';
import { route } from 'ziggy-js';
import { toDisplayDate } from '@/lib/date';
import FilterBar from '@/components/filters/FilterBar';
import { FilterRule } from '@/types/filter';
import StatusBadge from '@/components/ui/status-badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

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
      {
          label: 'ID',
          render: (row: Order) => (
              <Link
                  href={route('orders.edit', row.id)}
                  className="text-blue-600 hover:underline font-medium"
              >
                  {row.id}
              </Link>
          ),
      },

      { label: 'Customer', render: (row: Order) => row.customer_name },
      { label: 'Vehicle', render: (row: Order) => row.vehicle_name },
      {
          label: 'Order Date',
          render: (row: Order) => toDisplayDate(row.order_date),
      },
      { label: 'Total Amount ($)', render: (row: Order) => row.total_amount },
      {
          label: 'State',
          render: (row: Order) => (
              <StatusBadge value={row.state} states={states} />
          ),
      },

      {
          label: 'Actions',
          render: (row: Order) => (
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                      </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem asChild>
                          <Link href={route('orders.edit', row.id)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                      </DropdownMenuItem>
                      {row.state === 'in_progress' && (
                          <DropdownMenuItem
                              onClick={() => {
                                  Swal.fire({
                                      title: 'Mark order as completed?',
                                      text: 'This action cannot be undone.',
                                      icon: 'warning',
                                      showCancelButton: true,
                                      confirmButtonText: 'Yes, complete it',
                                      cancelButtonText: 'Cancel',
                                  }).then((result) => {
                                      if (result.isConfirmed) {
                                          router.put(
                                              route(
                                                  'orders.update.state',
                                                  row.id,
                                              ),
                                              { state: 'completed' },
                                              {
                                                  preserveScroll: true,
                                                  preserveState: true,
                                                  onSuccess: () => {
                                                      // Show success message
                                                      toast.success(
                                                          'Order state updated successfully!',
                                                      );
                                                  },
                                                  onError: (errors) => {
                                                      // Optionally revert UI change if error
                                                      toast.error(
                                                          'Failed to update state.',
                                                      );
                                                  },
                                              },
                                          );
                                      }
                                  });
                              }}
                          >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Complete
                          </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                          onClick={() => {
                              Swal.fire({
                                  title: 'Send invoice to customer?',
                                  text: 'The invoice PDF will be emailed.',
                                  icon: 'question',
                                  showCancelButton: true,
                                  confirmButtonText: 'Send',
                                  cancelButtonText: 'Cancel',
                              }).then((result) => {
                                  if (result.isConfirmed) {
                                      router.post(
                                          route('orders.send-invoice', row.id),
                                          {},
                                          {
                                              preserveScroll: true,
                                              onSuccess: () =>
                                                  toast.success(
                                                      'Invoice sent successfully!',
                                                  ),
                                              onError: () =>
                                                  toast.error(
                                                      'Failed to send invoice.',
                                                  ),
                                          },
                                      );
                                  }
                              });
                          }}
                      >
                          <Send className="mr-2 h-4 w-4" />
                          Send Invoice
                      </DropdownMenuItem>
                      {row.state !== 'completed' && (
                          <>
                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => {
                                      Swal.fire({
                                          title: 'Are you sure?',
                                          text: 'This order will be permanently deleted!',
                                          icon: 'warning',
                                          showCancelButton: true,
                                          confirmButtonText: 'Yes, delete it!',
                                          cancelButtonText: 'Cancel',
                                          confirmButtonColor: '#dc2626', // red
                                      }).then((result) => {
                                          if (result.isConfirmed) {
                                              router.delete(
                                                  route(
                                                      'orders.destroy',
                                                      row.id,
                                                  ),
                                                  {
                                                      preserveScroll: true,
                                                      onSuccess: () =>
                                                          toast.success(
                                                              'Order deleted successfully!',
                                                          ),
                                                      onError: () =>
                                                          toast.error(
                                                              'Failed to delete order.',
                                                          ),
                                                  },
                                              );
                                          }
                                      });
                                  }}
                              >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                              </DropdownMenuItem>
                          </>
                      )}
                  </DropdownMenuContent>
              </DropdownMenu>
          ),
      },
  ];

  return (
      <AppLayout breadcrumbs={breadcrumbs}>
          <Head title="Orders" />

          <div className="space-y-4 p-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                  {/* Left spacer */}
                  <div className="flex-1" />
                  {/* Centered Filter/Search */}
                  <div className="w-full max-w-xl">
                      <FilterBar
                          routeName="orders.filter"
                          placeholder="Search Orders By Customer, Vehicle, State..."
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
                  </div>

                  {/* Right aligned Create button */}
                  <div className="flex flex-1 justify-end">
                      <Button asChild>
                          <Link href={route('orders.create')}>
                              Create
                          </Link>
                      </Button>
                  </div>
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
