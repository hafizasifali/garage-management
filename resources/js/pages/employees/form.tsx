import { Head, useForm } from '@inertiajs/react';
import FormRenderer from '@/components/form/FormRenderer';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={record ? `Edit Employee - ${record.name}` : 'New Employee'} />

            <div className="p-4">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between mb-4">
                        <h1 className="text-xl font-bold">
                            {record ? `Edit Employee #${record.id}` : 'Create Employee'}
                        </h1>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => history.back()}>
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
