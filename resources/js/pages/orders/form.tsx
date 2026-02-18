import FormRenderer from '@/components/form/FormRenderer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { route } from 'ziggy-js';

const today = new Date().toISOString().slice(0, 10);
export default function OrderForm({
    record,
    customers,
    vehicles,
    products,
    employees,
    states,
    parts_by,
    fields,
    customers_fields,
    vehicles_fields,
}: any) {
    const form = useForm({
        customer_id: null,
        vehicle_id:  null,
        order_date: '',
        state: 'in_progress',
        parts_by: 'us',
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
        ...(record || {
            order_date: today, // ✅ dynamic,
            state: 'in_progress',
            parts_by: 'us',
        }),
    });
    /* ---------------- Vehicle filtering (Odoo behavior) ---------------- */

    const filteredVehicles = useMemo(() => {
        if (!form.data.customer_id) return [];
        return (vehicles || []).filter(
            (v: any) => v.customer_id == form.data.customer_id,
        );
    }, [vehicles, form.data.customer_id]);

    // Clear vehicle if customer changes and vehicle no longer valid
    useEffect(() => {
        if (!form.data.customer_id) {
            if (form.data.vehicle_id !== null) {
                form.setData('vehicle_id', null);
            }
            return;
        }

        const stillValid = filteredVehicles.some(
            (v: any) => v.id === form.data.vehicle_id,
        );

        if (!stillValid && form.data.vehicle_id !== null) {
            form.setData('vehicle_id', null);
        }
    }, [form.data.customer_id, filteredVehicles]);

    /* ---------------- Breadcrumbs ---------------- */

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Order', href: route('orders.index') },
        { title: record ? `Edit Order #${record.id}` : 'New Order', href: '#' },
    ];

    /* ---------------- Form Submit ---------------- */

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        form.post(route('orders.store'), {
            onSuccess: () => toast.success('Order created successfully!'),
            onError: (errors) => {
                Object.values(errors).forEach((error) => {
                    toast.error(error);
                });
            },
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

    /* ---------------- Options ---------------- */
    const types = [
        { id: 'individual', name: 'Individual' },
        { id: 'company', name: 'Company' },
    ];
    const [localCustomers, setLocalCustomers] = useState(customers || []);

    const options = useMemo(
        () => ({
            types,
            states,
            customers: localCustomers,
            vehicles: filteredVehicles,
            products,
            employees,
            parts_by,
            customers_fields,
            vehicles_fields,
        }),
        [
            types,
            states,
            localCustomers,
            filteredVehicles,
            products,
            employees,
            parts_by,
            customers_fields,
            vehicles_fields,
        ],
    );

    const handleCustomerCreated = (newCustomer: any) => {
        setLocalCustomers((prev) => [...prev, newCustomer]);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={record ? `Edit Order #${record.id}` : 'New Order'} />

            <div className="p-4 pb-28 md:pb-4">
                <form onSubmit={handleSubmit}>
                    <div className="sticky top-0 z-20 mb-4 flex flex-col gap-3 bg-white pb-3 md:static md:flex-row md:items-center md:justify-between">
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
                        onOptionsUpdate={(relation, record) => {
                            if (relation === 'customers')
                                handleCustomerCreated(record);
                        }}
                        form={form}
                        options={options}
                        columns={2}
                    />

                    {/* ---------------- Lines Table ---------------- */}
                    <div className="mt-6">
                        <div className="">
                            <h2 className="mb-2 text-lg font-semibold">
                                Repairs
                            </h2>

                            <table className="hidden w-full rounded border md:table">
                                <thead>
                                    <tr className="bg-gray-100 text-xs md:text-sm">
                                        <th className="min-w-[200px] p-2">
                                            Product
                                        </th>
                                        <th className="min-w-[180px] p-2">
                                            Mechanic
                                        </th>
                                        <th className="min-w-[90px] p-2">
                                            Qty
                                        </th>
                                        <th className="min-w-[110px] p-2">
                                            Price
                                        </th>
                                        <th className="min-w-[110px] p-2">
                                            Subtotal
                                        </th>
                                        <th className="min-w-[70px] p-2">
                                            Action
                                        </th>
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
                                                                      (
                                                                          p: any,
                                                                      ) =>
                                                                          p.id ===
                                                                          line.product_id,
                                                                  )?.name,
                                                              }
                                                            : null
                                                    }
                                                    onChange={(
                                                        selected: any,
                                                    ) => {
                                                        const productId =
                                                            selected?.value ||
                                                            null;
                                                        const product =
                                                            products.find(
                                                                (p: any) =>
                                                                    p.id ===
                                                                    productId,
                                                            );

                                                        const newLines = [
                                                            ...form.data.lines,
                                                        ];
                                                        newLines[
                                                            index
                                                        ].product_id =
                                                            productId;
                                                        newLines[
                                                            index
                                                        ].unit_price = product
                                                            ? Number(
                                                                  product.sale_price ||
                                                                      0,
                                                              )
                                                            : 0;

                                                        newLines[
                                                            index
                                                        ].subtotal =
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
                                                                      (
                                                                          e: any,
                                                                      ) =>
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
                                                            selected?.value ||
                                                                null,
                                                        )
                                                    }
                                                    placeholder="Select mechanic"
                                                    isClearable
                                                />
                                            </td>

                                            <td className="p-1">
                                                <Input
                                                    type="number"
                                                    value={Number(
                                                        line.quantity || 0,
                                                    ).toFixed(0)}
                                                    onChange={(e) =>
                                                        updateLine(
                                                            index,
                                                            'quantity',
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </td>

                                            <td className="p-1">
                                                <Input
                                                    type="number"
                                                    value={Number(
                                                        line.unit_price || 0,
                                                    ).toFixed(0)}
                                                    onChange={(e) =>
                                                        updateLine(
                                                            index,
                                                            'unit_price',
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </td>

                                            <td className="p-1 text-center">
                                                {Number(
                                                    line.subtotal || 0,
                                                ).toFixed(0)}
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
                            {/* MOBILE VIEW */}
                            <div className="space-y-4 md:hidden">
                                {form.data.lines.map((line, index) => (
                                    <div
                                        key={index}
                                        className="space-y-2 rounded border p-3 shadow-sm"
                                    >
                                        {/* Product */}
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500">
                                                Product
                                            </label>
                                            <Select
                                                className="text-sm"
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
                                                        newLines[index]
                                                            .unit_price *
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
                                        </div>

                                        {/* Mechanic */}
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500">
                                                Mechanic
                                            </label>
                                            <Select
                                                className="text-sm"
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
                                                isClearable
                                            />
                                        </div>

                                        {/* Quantity + Price */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500">
                                                    Qty
                                                </label>
                                                <Input
                                                    className="h-9 text-sm"
                                                    type="number"
                                                    value={line.quantity}
                                                    onChange={(e) =>
                                                        updateLine(
                                                            index,
                                                            'quantity',
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-semibold text-gray-500">
                                                    Price
                                                </label>
                                                <Input
                                                    className="h-9 text-sm"
                                                    type="number"
                                                    value={line.unit_price}
                                                    onChange={(e) =>
                                                        updateLine(
                                                            index,
                                                            'unit_price',
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>

                                        {/* Subtotal */}
                                        <div className="flex justify-between font-semibold">
                                            <span>Subtotal</span>
                                            <span>
                                                $
                                                {Number(line.subtotal).toFixed(
                                                    2,
                                                )}
                                            </span>
                                        </div>

                                        {/* Delete */}
                                        <div className="text-right">
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() =>
                                                    removeLine(index)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
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
                    {/* DESKTOP TOTALS */}
                    <div className="mt-6 hidden justify-end md:flex">
                        <table className="border-collapse border">
                            <tbody>
                                <tr>
                                    <td className="px-2 py-1 font-semibold">
                                        Untaxed Amount
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                        ${untaxedAmount.toFixed(2)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-2 py-1 font-semibold">
                                        Tax 13%
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                        ${taxAmount.toFixed(2)}
                                    </td>
                                </tr>
                                <tr className="border-t">
                                    <td className="px-2 py-1 font-semibold">
                                        Total
                                    </td>
                                    <td className="px-2 py-1 text-right text-lg">
                                        ${totalAmount.toFixed(2)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {/* MOBILE STICKY TOTALS */}
                    <div className="fixed right-0 bottom-0 left-0 z-30 border-t bg-white p-3 shadow-lg md:hidden">
                        <div className="flex justify-between text-sm">
                            <span>Untaxed</span>
                            <span>${untaxedAmount.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span>Tax</span>
                            <span>${taxAmount.toFixed(2)}</span>
                        </div>

                        <div className="mt-2 flex justify-between border-t pt-2 text-lg font-semibold">
                            <span>Total</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
