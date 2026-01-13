import FormRenderer from '@/components/form/FormRenderer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { route } from 'ziggy-js';


export default function OrderForm({
                                          record,
                                          customers,
                                          vehicles,
                                          products,
                                          employees,
                                          states,
                                          fields,
                                          customers_fields,
                                      }: any) {
    const form = useForm({
        customer_id: null,
        vehicle_id: null,
        employee_id: null,
        job_date: '',
        state: 'pending',
        total_parts_cost: 0,
        total_labor_cost: 0,
        total_tax: 0,
        total_amount: 0,
        lines: (record?.lines || []).map((line: any) => ({
            ...line,
            quantity: Number(line.quantity || 0),
            unit_price: Number(line.unit_price || 0),
            subtotal: Number(line.unit_price || 0) * Number(line.quantity || 0),
        })),
        ...(record || {}),
    });

    const [quickCreate, setQuickCreate] = useState<any>(null);

    useEffect(() => {
        const handler = (e: any) => setQuickCreate(e.detail);
        window.addEventListener('quick-create', handler);
        return () => window.removeEventListener('quick-create', handler);
    }, []);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Order', href: route('orders.index') },
        { title: record ? `Edit Order #${record.id}` : 'New Order', href: '#' },
    ];

    /* ---------------- Form Submit ---------------- */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        record
            ? form.put(route('orders.update', record.id), {
                onSuccess: () => toast.success('Order updated successfully!'),
            })
            : form.post(route('orders.store'), {
                onSuccess: () => toast.success('Order created successfully!'),
            });
    };

    /* ---------------- Lines Handling ---------------- */
    const addLine = () => {
        form.setData('lines', [
            ...form.data.lines,
            {
                product_id: null,
                quantity: 1,
                unit_price: 0,
                tax: 0,
                subtotal: 0,
            },
        ]);
    };

    const removeLine = (index: number) => {
        const newLines = [...form.data.lines];
        newLines.splice(index, 1);
        form.setData('lines', newLines);
    };

    const updateLine = (index: number, key: string, value: any) => {
        const newLines = [...form.data.lines];
        newLines[index][key] = value;

        const line = newLines[index];

        // Force numeric values
        const unit_price = Number(line.unit_price || 0);
        const quantity = Number(line.quantity || 0);

        line.subtotal = unit_price * quantity;

        form.setData('lines', newLines);
    };


    /* ---------------- Totals ---------------- */
    const untaxedAmount = form.data.lines.reduce(
        (acc, l) => acc + Number(l.unit_price || 0) * Number(l.quantity || 0),
        0,
    );

    const taxAmount = untaxedAmount * 0.13;
    const totalAmount = untaxedAmount + taxAmount;

    const options = {
        states,
        customers,
        vehicles,
        products,
        employees,
        customers_fields,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={record ? `Edit Order #${record.id}` : 'New Order'} />

            <div className="p-4">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4 flex items-center justify-between">
                        <h1 className="text-xl font-bold">
                            {record
                                ? `Edit Order #${record.id}`
                                : 'Create Order'}
                        </h1>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
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
                        options={options}
                        columns={2}
                    />

                    {/* ---------------- Lines Table ---------------- */}
                    <div className="mt-6">
                        <h2 className="mb-2 text-lg font-semibold">Repairs</h2>

                        <table className="w-full rounded border">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-1">Product</th>
                                    <th className="p-1">Mechanic</th>
                                    <th className="p-1">Quantity</th>
                                    <th className="p-1">Unit Price</th>
                                    <th className="p-1">Subtotal</th>
                                    <th className="p-1">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {form.data.lines.map((line, index) => (
                                    <tr key={index}>
                                        <td className="p-1">
                                            <Select
                                                options={products.map(
                                                    (p: any) => ({
                                                        value: p.id,
                                                        label: p.name,
                                                    }),
                                                )}
                                                value={
                                                    line.product_id
                                                        ? {
                                                              value: line.product_id,
                                                              label: products.find(
                                                                  (p: any) =>
                                                                      p.id ===
                                                                      line.product_id,
                                                              )?.name,
                                                          }
                                                        : null
                                                }
                                                onChange={(selected: any) => {
                                                    const productId =
                                                        selected?.value || null;
                                                    const product =
                                                        products.find(
                                                            (p: any) =>
                                                                p.id ===
                                                                productId,
                                                        );

                                                    const newLines = [
                                                        ...form.data.lines,
                                                    ];
                                                    newLines[index].product_id =
                                                        productId;
                                                    newLines[index].unit_price =
                                                        product
                                                            ? Number(
                                                                  product.sale_price ||
                                                                      0,
                                                              )
                                                            : 0;

                                                    newLines[index].subtotal =
                                                        Number(
                                                            newLines[index]
                                                                .unit_price,
                                                        ) *
                                                        Number(
                                                            newLines[index]
                                                                .quantity,
                                                        );

                                                    form.setData(
                                                        'lines',
                                                        newLines,
                                                    );
                                                }}
                                                isClearable
                                            />
                                        </td>

                                        <td className="p-1">
                                            <Select
                                                options={employees.map(
                                                    (e: any) => ({
                                                        value: e.id,
                                                        label: e.name,
                                                    }),
                                                )}
                                                value={
                                                    line.employee_id
                                                        ? {
                                                              value: line.employee_id,
                                                              label: employees.find(
                                                                  (e: any) =>
                                                                      e.id ===
                                                                      line.employee_id,
                                                              )?.name,
                                                          }
                                                        : null
                                                }
                                                onChange={(selected: any) =>
                                                    updateLine(
                                                        index,
                                                        'employee_id',
                                                        selected?.value || null,
                                                    )
                                                }
                                                placeholder="Select mechanic"
                                                isClearable
                                            />
                                        </td>

                                        <td className="p-1">
                                            <Input
                                                type="number"
                                                value={Number(line.quantity || 0).toFixed(0)}
                                                onChange={(e) =>
                                                    updateLine(
                                                        index,
                                                        'quantity',
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </td>

                                        <td className="p-1">
                                            <Input
                                                type="number"
                                                value={Number(line.unit_price || 0).toFixed(0)}
                                                onChange={(e) =>
                                                    updateLine(
                                                        index,
                                                        'unit_price',
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </td>

                                        <td className="p-1 text-center">
                                            {Number(line.subtotal || 0).toFixed(0)}
                                        </td>

                                        <td className="p-1 text-center">
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() =>
                                                    removeLine(index)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <Button
                            type="button"
                            onClick={addLine}
                            variant="outline"
                            className="mt-2"
                        >
                            <Plus className="mr-1" /> Add Line
                        </Button>
                    </div>

                    {/* ---------------- Summary ---------------- */}
                    <div className="float-right mt-4">
                        <table className="border-collapse border">
                            <tbody>
                                <tr>
                                    <td className="px-2 py-1 font-semibold">
                                        Untaxed Amount
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                        ${untaxedAmount.toFixed(0)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-2 py-1 font-semibold">
                                        Tax 13%
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                        ${taxAmount.toFixed(0)}
                                    </td>
                                </tr>
                                <tr className="border-t">
                                    <td className="px-2 py-1 font-semibold">
                                        Total
                                    </td>
                                    <td className="px-2 py-1 text-right text-lg">
                                        ${totalAmount.toFixed(0)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
