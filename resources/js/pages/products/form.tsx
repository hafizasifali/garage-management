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
    categories: any[];
    uoms: any[];
};

export default function ProductForm({ fields, record, categories, uoms }: Props) {
    const form = useForm({
        name: '',
        category_id: null,
        uom_id: null,
        type: 'product',
        cost_price: '',
        sale_price: '',
        active: true,
        ...(record || {}),
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Products', href: route('products.index') },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        record
            ? form.put(route('products.update', record.id), {
                  onSuccess: () => toast.success('Product updated successfully'),
                  onError: (e) => Object.values(e).forEach(err => toast.error(err)),
              })
            : form.post(route('products.store'), {
                  onSuccess: () => toast.success('Product created successfully'),
                  onError: (e) => Object.values(e).forEach(err => toast.error(err)),
              });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={record ? `Edit Product - ${record.name}` : 'New Product'} />

            <div className="p-4 max-w-3xl">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between mb-4">
                        <h1 className="text-xl font-bold">
                            {record ? `Edit Product #${record.id}` : 'Create Product'}
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
                            product_categories: categories,
                            uoms,
                        }}
                        columns={1}
                    />
                </form>
            </div>
        </AppLayout>
    );
}
