import { Head, router, useForm } from '@inertiajs/react';
import FormRenderer from '@/components/form/FormRenderer';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

type Props = {
    fields: any;
    record: any;
    categories: any[];
    uoms: any[];
    product_types:any[];
};

export default function ProductForm({ fields, record, categories, uoms,product_types }: Props) {
    const form = useForm({
        name: '',
        category_id: null,
        uom_id: null,
        type: 'product',
        cost_price: '',
        sale_price: '',
        active: true,
        is_brake_fluid: false,
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

    const handleDelete = async (id: number, name: string) => {
        const result = await Swal.fire({
            title: 'Delete Product?',
            text: `Product "${name}" will be permanently deleted.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) return;

        form.delete(route('products.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Product deleted successfully'),
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={record ? `Edit Product - ${record.name}` : 'New Product'}
            />

            <div className="max-w-3xl p-4">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4 flex justify-between">
                        <h1 className="text-xl font-bold">
                            {record
                                ? `Edit Product #${record.id}`
                                : 'Create Product'}
                        </h1>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(route('products.index'))}
                            >
                                Go Back
                            </Button>
                            {record && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => handleDelete(record.id, record.name)}
                                >
                                    Delete
                                </Button>
                            )}
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
                            product_types,
                        }}
                        columns={1}
                    />
                </form>
            </div>
        </AppLayout>
    );
}
