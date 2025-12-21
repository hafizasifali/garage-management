import { Head, useForm } from '@inertiajs/react';
import FormRenderer from '@/components/form/FormRenderer';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';

export default function CompanyForm({ fields, record, countries, currencies }) {
    const form = useForm({
        name: '',
        email: '',
        phone: '',
        mobile: '',
        vat: '',
        website: '',
        address: '',
        country_id: null,
        currency_id: null,
        active: true,
        ...(record || {}),
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Companies',
            href: '/companies',
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const submitAction = record
            ? form.put(route('companies.update', record.id), {
                  onSuccess: () => toast.success('Company updated successfully!'),
                  onError: (errors) => {
                      Object.values(errors).forEach((err) => toast.error(err));
                  },
              })
            : form.post(route('companies.store'), {
                  onSuccess: () => toast.success('Company created successfully!'),
                  onError: (errors) => {
                      Object.values(errors).forEach((err) => toast.error(err));
                  },
              });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={record ? `Edit Company - ${record.name}` : 'New Company'} />
            <div className="p-4">
                <h1 className="text-xl font-bold mb-4">
                    {record ? 'Edit Company' : 'Create Company'}
                </h1>

                <form onSubmit={handleSubmit}>
                    <FormRenderer
                        fields={fields}
                        form={form}
                        options={{
                            countries,
                            currencies,
                        }}
                        columns={2} // Odoo-style 2-column layout
                    />

                    <div className="mt-6 flex justify-end gap-2">
                        <Button
                            className='cursor-pointer'
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                        <Button 
                            className='cursor-pointer'
                            type="submit">
                            {record ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
