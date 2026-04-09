import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';

export default function Prices({ customer, products, prices }) {
    const form = useForm({
        prices: prices || {},
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        form.post(route('customers.prices.bulk', customer.id), {
            onSuccess: () => {
                toast.success('Customer prices updated successfully');
            },
        });
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: route('customers.index') },
        { title: 'Pricing', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Pricing" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        Customer Pricing — {customer.name}
                    </h1>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => history.back()}
                        >
                            Go Back
                        </Button>

                        <Button type="submit" form="pricing-form">
                            Save Prices
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                    <form id="pricing-form" onSubmit={handleSubmit}>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 text-left">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">
                                        Service
                                    </th>
                                    <th className="px-4 py-3 font-semibold">
                                        Default Price
                                    </th>
                                    <th className="px-4 py-3 font-semibold">
                                        Customer Price
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {products.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3">
                                            {product.name}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            ${product.sale_price}
                                        </td>

                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                className="w-32 rounded-md border px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                value={
                                                    form.data.prices[
                                                        product.id
                                                    ] || ''
                                                }
                                                placeholder={product.sale_price}
                                                onChange={(e) =>
                                                    form.setData('prices', {
                                                        ...form.data.prices,
                                                        [product.id]:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
