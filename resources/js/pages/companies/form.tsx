import { Head, useForm, usePage } from '@inertiajs/react';
import FormRenderer from '@/components/form/FormRenderer';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

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

    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [flash]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            forceFormData: true,
            method: record ? 'put' : 'post', // ✅ proper HTTP method
            url: record
                ? route('companies.update', record.id)
                : route('companies.store'),
            onSuccess: () =>
                toast.success(
                    record
                        ? 'Company updated successfully!'
                        : 'Company created successfully!',
                ),
            onError: (errors: any) =>
                Object.values(errors).forEach((err: any) => toast.error(err)),
        };

        form.submit(options);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={record ? `Edit Company - ${record.name}` : 'New Company'} />
            <div className="p-4">


                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between mb-4">
                            <h1 className="text-xl font-bold">
                            {record ? `Edit Company #${record.id}` : 'Create Company'}
                            </h1>
                            <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                Cancel
                            </Button>
                            <Button type="submit">{record ? 'Update' : 'Create'}</Button>
                            </div>
                        </div>
                    <FormRenderer
                        fields={fields}
                        form={form}
                        options={{
                            countries,
                            currencies,
                        }}
                        columns={2} // Odoo-style 2-column layout
                    />

                </form>
            </div>
        </AppLayout>
    );
}
