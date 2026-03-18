import { Head, useForm } from '@inertiajs/react';
import FormRenderer from '@/components/form/FormRenderer';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

type VehicleFormProps = {
    fields: any;
    record: any;
    customers: { id: number; name: string }[];
    customers_fields: any[];
};

export default function VehicleForm({ fields, record, customers,customers_fields }: VehicleFormProps) {
    const form = useForm({
        partner_id: null,
        license_plate: '',
        model: '',
        year: '',
        active: true,
        ...(record || {}),
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vehicles', href: '/vehicles' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const submitAction = record
            ? form.put(route('vehicles.update', record.id), {
                  onSuccess: () => toast.success('Vehicle updated successfully!'),
                  onError: (errors) =>
                      Object.values(errors).forEach((err) => toast.error(err)),
              })
            : form.post(route('vehicles.store'), {
                  onSuccess: () => toast.success('Vehicle created successfully!'),
                  onError: (errors) =>
                      Object.values(errors).forEach((err) => toast.error(err)),
              });
    };

    const handleDelete = async (id: number, name: string) => {
        const result = await Swal.fire({
            title: 'Delete Vehicle?',
            text: `Vehicle "${name}" will be permanently deleted.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) return;

        form.delete(route('vehicles.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Vehicle deleted successfully'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    record
                        ? `Edit Vehicle - ${record.license_plate}`
                        : 'New Vehicle'
                }
            />
            <div className="p-4">
                <div className="grid grid-cols-12">
                    <div className="col-span-12 md:col-span-6">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4 flex items-center justify-between">
                                <h1 className="text-xl font-bold">
                                    {record
                                        ? `Edit Vehicle #${record.id}`
                                        : 'Create Vehicle'}
                                </h1>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        {record ? 'Update' : 'Create'}
                                    </Button>
                                    <Button
                                        type="button" // 👈 this is the fix
                                        className={`cursor-pointer`}
                                        variant="destructive"
                                        onClick={() =>
                                            handleDelete(record.id, record.name)
                                        }
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>

                            <FormRenderer
                                fields={fields}
                                form={form}
                                options={{
                                    customers,
                                    customers_fields,
                                }}
                                columns={1}
                            />
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
