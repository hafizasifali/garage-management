import { Head, useForm } from '@inertiajs/react';
import FormRenderer from '@/components/form/FormRenderer';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

type Props = {
    fields: any;
    record: any;
    companies: any[];
    countries: any[];
    users: any[];
};

export default function EmployeeForm({ fields, record, companies, countries, users }: Props) {
    const form = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        joining_date: '',
        birthday: '',
        company_id: null,
        country_id: null,
        user_id: null,
        active: true,
        ...(record || {}),
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Employees', href: route('employees.index') },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        record
            ? form.put(route('employees.update', record.id), {
                  onSuccess: () => toast.success('Employee updated successfully'),
                  onError: (e) => Object.values(e).forEach(err => toast.error(err)),
              })
            : form.post(route('employees.store'), {
                  onSuccess: () => toast.success('Employee created successfully'),
                  onError: (e) => Object.values(e).forEach(err => toast.error(err)),
              });
    };

    const handleDelete = async (id: number, name: string) => {
        const result = await Swal.fire({
            title: 'Delete Mechanic?',
            text: `Mechanic "${name}" will be permanently deleted.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) return;

        form.delete(route('employees.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Employee deleted successfully'),
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    record ? `Edit Employee - ${record.name}` : 'New Employee'
                }
            />

            <div className="p-4">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4 flex justify-between">
                        <h1 className="text-xl font-bold">
                            {record
                                ? `Edit Employee #${record.id}`
                                : 'Create Employee'}
                        </h1>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => history.back()}
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
                            companies,
                            countries,
                            users,
                        }}
                        columns={2}
                    />
                </form>
            </div>
        </AppLayout>
    );
}
