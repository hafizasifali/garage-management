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

type GarageJob = {
  id: number;
  partner: { name: string };
  vehicle: { name: string };
  job_date: string;
  state: string;
  total_amount: number;
};

export default function Index() {
  const { jobs } = usePage().props as any;
  const { confirm } = useConfirm();
  const [selected, setSelected] = useState<number[]>([]);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Garage Jobs', href: '/garage-jobs' },
  ];

  /* ---------------- Actions ---------------- */
  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Delete Garage Job?',
      text: `This job will be permanently removed.`,
      confirmText: 'Delete',
    });
    if (!ok) return;

    router.delete(route('garage-jobs.destroy', id), {
      preserveScroll: true,
      onSuccess: () => toast.success('Garage job deleted'),
    });
  };

  const toggleAll = () => {
    setSelected(
      selected.length === jobs.data.length
        ? []
        : jobs.data.map((j: GarageJob) => j.id)
    );
  };

  const toggleOne = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  /* ---------------- Table Columns ---------------- */
  const columns = [
    { label: 'Customer', render: (row: GarageJob) => row.partner.name },
    { label: 'Vehicle', render: (row: GarageJob) => row.vehicle.name },
    { label: 'Job Date', render: (row: GarageJob) => row.job_date },
    { label: 'State', render: (row: GarageJob) => row.state },
    { label: 'Total Amount', render: (row: GarageJob) => row.total_amount },
    {
      label: 'Actions',
      render: (row: GarageJob) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href={route('garage-jobs.edit', row.id)}>
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
      <Head title="Garage Jobs" />

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Garage Jobs</h1>
          <Button asChild>
            <Link href={route('garage-jobs.create')}>Create Job</Link>
          </Button>
        </div>

        <DataTable
          data={jobs.data}
          selected={selected}
          toggleAll={toggleAll}
          toggleOne={toggleOne}
          columns={columns}
        />

        <Pagination meta={jobs} />
      </div>
    </AppLayout>
  );
}
