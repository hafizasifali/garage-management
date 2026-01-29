import React, { useEffect, useMemo, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';
import { router } from '@inertiajs/react';
import Select from 'react-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import FormRenderer from '@/components/form/FormRenderer';
import StateBarWithActions, { WorkflowAction, WorkflowState } from '@/components/ui/StateBarWithActions';
import { BreadcrumbItem } from '@/types';
import { LucideDownloadCloud, Plus, Send, Trash2 } from 'lucide-react';

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
                                  }: any) {
    const form = useForm({
        customer_id: null,
        vehicle_id: null,
        employee_id: null,
        order_date: '',
        state: record?.state || 'pending',
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

    const [currentState, setCurrentState] = useState(form.data.state || 'pending');

    /* ---------------- Workflow Actions ---------------- */
    const workflowActions: WorkflowAction[] = [
        { value: 'in_progress', label: 'Start Work', visibleInStates: ['pending'] },
        { value: 'completed', label: 'Complete', visibleInStates: ['in_progress'] },
        { value: 'paid', label: 'Mark Paid', visibleInStates: ['completed'] },
    ];
    const handleStateChange = (newState: string) => {
        // Optimistically update the UI
        setCurrentState(newState);

        router.put(
            route('orders.update.state', record.id), // URL
            { state: newState }, // Payload
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    // Show success message
                    toast.success('Order state updated successfully!');
                },
                onError: (errors) => {
                    // Optionally revert UI change if error
                    setCurrentState(record.state);
                    toast.error('Failed to update state.');
                },
            },
        );
    };

    /* ---------------- Vehicle Filtering (Odoo-style) ---------------- */
    const filteredVehicles = useMemo(() => {
        if (!form.data.customer_id) return [];
        return (vehicles || []).filter((v: any) => v.customer_id == form.data.customer_id);
    }, [vehicles, form.data.customer_id]);

    useEffect(() => {
        if (!form.data.customer_id) {
            form.setData('vehicle_id', null);
            return;
        }

        const stillValid = filteredVehicles.some((v: any) => v.id === form.data.vehicle_id);
        if (!stillValid) form.setData('vehicle_id', null);
    }, [form.data.customer_id, filteredVehicles]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Orders', href: route('orders.index') },
        { title: record ? `Edit Order #${record.id}` : 'New Order', href: '#' },
    ];

    /* ---------------- Form Submit ---------------- */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.setData('state', currentState);

        if (record) {
            form.put(route('orders.update', record.id), {
                onSuccess: () => toast.success('Order updated successfully!'),
            });
        } else {
            form.post(route('orders.store'), {
                onSuccess: () => toast.success('Order created successfully!'),
            });
        }
    };

    /* ---------------- Lines Table ---------------- */
    const addLine = () => {
        form.setData('lines', [
            ...form.data.lines,
            { product_id: null, quantity: 1, unit_price: 0, tax: 0, subtotal: 0, employee_id: null },
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
        0
    );
    const taxAmount = untaxedAmount * 0.13;
    const totalAmount = untaxedAmount + taxAmount;

    const options = { states, customers, vehicles: filteredVehicles, products, employees, customers_fields, parts_by };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={record ? `Edit Order #${record.id}` : 'New Order'} />

            <div className="p-4">
                <form onSubmit={handleSubmit}>
                    {/* Header + Workflow */}
                    <div className="mb-4 flex flex-col gap-2">
                        <div className="mb-4 flex items-center justify-between">
                            <h1 className="text-xl font-bold">
                                {record
                                    ? `Edit Order #${record.id}`
                                    : 'Create Order'}
                            </h1>
                            <div className="mt-6 flex justify-end gap-2">
                                {record && (
                                    <>
                                        {/* Send Invoice */}
                                        <Button
                                            type="button"
                                            variant="destructive" // red for important action
                                            onClick={() => {
                                                Swal.fire({
                                                    title: 'Send invoice to customer?',
                                                    text: 'The invoice PDF will be emailed.',
                                                    icon: 'question',
                                                    showCancelButton: true,
                                                    confirmButtonText: 'Send',
                                                    cancelButtonText: 'Cancel',
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        router.post(
                                                            route(
                                                                'orders.send-invoice',
                                                                record.id,
                                                            ),
                                                            {},
                                                            {
                                                                preserveScroll: true,
                                                                onSuccess: () =>
                                                                    toast.success(
                                                                        'Invoice sent successfully!',
                                                                    ),
                                                                onError: () =>
                                                                    toast.error(
                                                                        'Failed to send invoice.',
                                                                    ),
                                                            },
                                                        );
                                                    }
                                                });
                                            }}
                                            className="flex items-center gap-1 border-none bg-red-600 text-white hover:bg-red-700"
                                        >
                                            <Send className="h-4 w-4" />
                                            Send Invoice
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() =>
                                                window.open(
                                                    route(
                                                        'orders.invoice',
                                                        record.id,
                                                    ),
                                                    '_blank',
                                                )
                                            }
                                            className="flex items-center gap-1 border-none bg-blue-600 text-white hover:bg-blue-700"
                                        >
                                            <LucideDownloadCloud className="h-4 w-4" />{' '}
                                            Invoice
                                        </Button>
                                    </>
                                )}

                                <Button
                                    type="submit"
                                    className="flex items-center gap-1 border-none bg-gray-700 text-white hover:bg-gray-800"
                                >
                                    Update
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                    className="flex items-center gap-1 border-gray-400 text-gray-700 hover:bg-gray-100"
                                >
                                    Go Back
                                </Button>
                            </div>
                        </div>
                        <StateBarWithActions
                            states={states}
                            currentState={currentState}
                            actions={workflowActions}
                            onStateChange={handleStateChange}
                        />
                    </div>

                    {/* Form Fields */}
                    <FormRenderer
                        fields={fields}
                        form={form}
                        options={options}
                        columns={2}
                    />

                    {/* Lines Table */}
                    <div className="mt-6">
                        <h2 className="mb-2 text-lg font-semibold">
                            Repairs / Products
                        </h2>
                        <table className="w-full rounded border">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="w-[40%] p-1">Product</th>
                                    <th className="w-[25%] p-1">Mechanic</th>
                                    <th className="w-[8.75%] p-1">Quantity</th>
                                    <th className="w-[8.75%] p-1">
                                        Unit Price
                                    </th>
                                    <th className="w-[8.75%] p-1">Subtotal</th>
                                    <th className="w-[8.75%] p-1">Actions</th>
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
                                                                  (p) =>
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
                                                            (p) =>
                                                                p.id ===
                                                                productId,
                                                        );
                                                    updateLine(
                                                        index,
                                                        'product_id',
                                                        productId,
                                                    );
                                                    updateLine(
                                                        index,
                                                        'unit_price',
                                                        product
                                                            ? Number(
                                                                  product.sale_price ||
                                                                      0,
                                                              )
                                                            : 0,
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
                                                                  (e) =>
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
                                                value={Number(
                                                    line.quantity || 0,
                                                ).toFixed(0)}
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
                                                value={Number(
                                                    line.unit_price || 0,
                                                ).toFixed(0)}
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
                                            {Number(line.subtotal || 0).toFixed(
                                                0,
                                            )}
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

                    {/* Summary */}
                    <div className="float-right mt-4">
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
                </form>
            </div>
        </AppLayout>
    );
}
