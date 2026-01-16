import { Head, useForm } from '@inertiajs/react';
import FormRenderer from '@/components/form/FormRenderer';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={record ? 'Edit Customer' : 'New Customer'} />

            <div className="p-4">
                <div className="grid grid-cols-12">
                <div className="col-span-12 md:col-span-6">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between mb-4">
                        <h1 className="text-xl font-bold">
                            {record ? `Edit Customer #${record.id}` : 'Create Customer'}
                        </h1>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => history.back()}>
                                Go Back
                            </Button>
                            <Button type="submit">
                                {record ? 'Update' : 'Create'}
                            </Button>
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
