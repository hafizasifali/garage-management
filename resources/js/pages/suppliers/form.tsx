import FormRenderer from '@/components/form/FormRenderer';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';

type Supplier = {
    id?: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    active?: boolean;
};

interface SupplierFormProps {
    fields: Record<string, any>;
    record?: Supplier;
}

export default function SupplierForm({ fields, record }: SupplierFormProps) {
    const form = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        active: true,
        ...(record || {}),
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Suppliers', href: route('suppliers.index') },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (record) {
            form.put(route('suppliers.update', record.id), {
                onSuccess: () => toast.success('Supplier updated'),
            });
        } else {
            form.post(route('suppliers.store'), {
                onSuccess: () => toast.success('Supplier created'),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={record ? 'Edit Supplier' : 'New Supplier'} />

            <div className="p-4">
                <div className="grid grid-cols-12">
                    <div className="col-span-12 md:col-span-6">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4 flex justify-between">
                                <h1 className="text-xl font-bold">
                                    {record
                                        ? `Edit Supplier #${record.id}`
                                        : 'Create Supplier'}
                                </h1>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => history.back()}
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
                                columns={1}
                            />
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
