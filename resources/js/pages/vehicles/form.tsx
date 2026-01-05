import { Head, useForm } from '@inertiajs/react';
import FormRenderer from '@/components/form/FormRenderer';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';

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
