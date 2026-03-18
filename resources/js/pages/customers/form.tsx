import { Head, useForm } from '@inertiajs/react';
import FormRenderer from '@/components/form/FormRenderer';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function CustomerForm({ fields, record }) {
    const form = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        ...(record || {}),
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: route('customers.index') },
    ];

    const types=[{id: 'individual',name: 'Individual'},
        {id: 'company',name: 'Company'}
    ]
    const options = { types};


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        record
            ? form.put(route('customers.update', record.id), {
                  onSuccess: () => toast.success('Customer updated'),
              })
            : form.post(route('customers.store'), {
                  onSuccess: () => toast.success('Customer created'),
              });
    };

    const handleDelete = async (id: number, name: string) => {
        const result = await Swal.fire({
            title: 'Delete Customer?',
            text: `Customer "${name}" will be permanently deleted.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) return;

        form.delete(route('customers.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Customer deleted successfully'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={record ? 'Edit Customer' : 'New Customer'} />

            <div className="p-4">
                <div className="grid grid-cols-12">
                    <div className="col-span-12 md:col-span-6">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4 flex justify-between">
                                <h1 className="text-xl font-bold">
                                    {record
                                        ? `Edit Customer # ${record.id}`
                                        : 'Create Customer'}
                                </h1>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => history.back()}
                                    >
                                        Go Back
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
                                    {record && (
                                        <Button
                                            type="button"
                                            variant="default" // or remove variant to use className
                                            onClick={() =>
                                                (window.location.href = route(
                                                    'customers.prices.index',
                                                    record.id,
                                                ))
                                            }
                                        >
                                            Pricing
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <FormRenderer
                                fields={fields}
                                form={form}
                                options={options}
                                columns={1}
                            />
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
