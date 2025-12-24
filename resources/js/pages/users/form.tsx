import { Head, useForm } from '@inertiajs/react';
import FormRenderer from '@/components/form/FormRenderer';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';

type Props = {
    fields: any;
    record?: any;
    roles: { id: number; name: string }[];
};

export default function UserForm({ fields, record, roles }: Props) {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        active: true,
        roles: [],
        ...(record
            ? {
                  ...record,
                  roles: record.roles?.map((r: any) => r.id) ?? [],
              }
            : {}),
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Users',
            href: route('users.index'),
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (record) {
            form.put(route('users.update', record.id), {
                preserveScroll: true,
                onSuccess: () => toast.success('User updated successfully!'),
                onError: (errors) => {
                    Object.values(errors).forEach((err: any) =>
                        toast.error(err)
                    );
                },
            });
        } else {
            form.post(route('users.store'), {
                preserveScroll: true,
                onSuccess: () => toast.success('User created successfully!'),
                onError: (errors) => {
                    Object.values(errors).forEach((err: any) =>
                        toast.error(err)
                    );
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={record ? `Edit User - ${record.name}` : 'New User'} />

            <div className="p-4">
                <h1 className="text-xl font-bold mb-4">
                    {record ? 'Edit User' : 'Create User'}
                </h1>
                <div className="grid grid-cols-12">
                <div className="col-span-12 md:col-span-6">
                <form onSubmit={handleSubmit}>
                    <FormRenderer
                        fields={fields}
                        form={form}
                        options={{
                            roles,
                        }}
                        columns={1} // Odoo-style layout
                    />

                    <div className="mt-6 flex justify-end gap-2">
                        <Button
                            className="cursor-pointer"
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>

                        <Button className="cursor-pointer" type="submit">
                            {record ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
                </div>
                </div>
            </div>
        </AppLayout>
    );
}
