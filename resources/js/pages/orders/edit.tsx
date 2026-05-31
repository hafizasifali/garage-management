import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';
import { router } from '@inertiajs/react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import FormRenderer from '@/components/form/FormRenderer';
import StateBarWithActions, { WorkflowAction, WorkflowState } from '@/components/ui/StateBarWithActions';
import { BreadcrumbItem } from '@/types';
import { LucideDownloadCloud, Plus, Send, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';


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
    customer_prices, // customer-specific prices passed from controller
    vehicle_license_plates,
}: any) {
    const form = useForm({
        customer_id: null,
        vehicle_id: null,
        employee_id: null,
        order_date: '',
        state: record?.state || 'in_progress',
        is_revised_invoice: record?.is_revised_invoice || false,
        total_parts_cost: 0,
        total_labor_cost: 0,
        total_tax: 0,
        total_amount: 0,
        lines: (record?.lines || []).map((line: any) => ({
            ...line,
            quantity: Number(line.quantity || 0),
            unit_price: Number(line.unit_price || 0),
            subtotal: Number(line.unit_price || 0) * Number(line.quantity || 0),
            description: line.description ?? '',
        })),
        ...(record || {}),
    });

    const [currentState, setCurrentState] = useState(
        form.data.state || 'in_progress',
    );
    const isPaid = currentState === 'paid';
    /* ---------------- Workflow Actions ---------------- */
    const workflowActions: WorkflowAction[] = [
        {
            value: 'in_progress',
            label: 'Mark as In Progress',
            visibleInStates: ['paid'],
        },
        {
            value: 'completed',
            label: 'Complete',
            visibleInStates: ['in_progress'],
        },
        {
            value: 'paid',
            label: 'Mark as Paid',
            visibleInStates: ['completed', 'invoiced'],
        },
    ];
    const handleStateChange = (newState: string) => {
        // Optimistically update the UI and local form state
        setCurrentState(newState);
        form.setData('state', newState);

        router.put(
            route('orders.update.state', record.id), // URL
            { state: newState }, // Payload
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Order state updated successfully!');
                },
                onError: (errors) => {
                    setCurrentState(record.state);
                    form.setData('state', record.state || 'in_progress');
                    toast.error('Failed to update state.');
                },
            },
        );
    };

    /* ---------------- Vehicle Filtering (Odoo-style) ---------------- */
    const filteredVehicles = useMemo(() => {
        if (!form.data.customer_id) return [];
        return (vehicles || []).filter(
            (v: any) => v.customer_id == form.data.customer_id,
        );
    }, [vehicles, form.data.customer_id]);

    const availableProducts = useMemo(
        () =>
            form.data.is_brake_fluid_order
                ? (products || []).filter((p: any) => p.is_brake_fluid)
                : products || [],
        [products, form.data.is_brake_fluid_order],
    );

    useEffect(() => {
        if (!form.data.customer_id) {
            form.setData('vehicle_id', null);
            return;
        }

        const stillValid = filteredVehicles.some(
            (v: any) => v.id === form.data.vehicle_id,
        );
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
                onError: (errors) =>
                Object.values(errors).forEach((err: any) => toast.error(err)),
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
            {
                product_id: null,
                description: '',
                quantity: 1,
                unit_price: 0,
                tax: 0,
                subtotal: 0,
                employee_id: null,
            },
        ]);
    };

    const handleProductChange = (index: number, selected: any) => {
        const rawValue = selected?.value ?? null;
        const matchedProduct = products.find(
            (p: any) =>
                String(p.id) === String(rawValue) || p.name === rawValue,
        );

        const productId = matchedProduct?.id ?? null;
        const description = productId ? '' : rawValue ?? '';
        const customerPrice = productId
            ? customer_prices[`${form.data.customer_id}_${productId}`] ??
              matchedProduct?.sale_price ??
              0
            : 0;

        const newLines = [...form.data.lines];
        newLines[index].product_id = productId;
        newLines[index].description = description;
        newLines[index].unit_price = Number(customerPrice);
        newLines[index].subtotal =
            Number(newLines[index].unit_price) *
            Number(newLines[index].quantity);

        form.setData('lines', newLines);
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

    const options = {
        states,
        customers,
        vehicles: filteredVehicles,
        products,
        employees,
        customers_fields,
        parts_by,
        invoice_statuses: [
            { id: false, name: 'New' },
            { id: true, name: 'Revised' },
        ],
    };

    const isInvoiceAlreadySent = currentState === 'invoiced';
    const sendInvoiceConfirmation = {
        title: isInvoiceAlreadySent
            ? 'Invoice already sent'
            : 'Send invoice to customer?',
        text: isInvoiceAlreadySent
            ? 'Invoice for this order was already sent. Do you want to resend it?'
            : 'The invoice PDF will be emailed.',
        confirmButtonText: isInvoiceAlreadySent ? 'Resend' : 'Send',
    };

    const previousCustomerIdRef = useRef(form.data.customer_id);

    useEffect(() => {
        const currentCustomerId = form.data.customer_id;
        if (previousCustomerIdRef.current === currentCustomerId) {
            return;
        }

        previousCustomerIdRef.current = currentCustomerId;

        if (!currentCustomerId) {
            form.setData('customer_email', '');
            form.setData('customer_phone', '');
            form.setData('customer_address', '');
            return;
        }

        const customer = customers.find(
            (c: any) => c.id == currentCustomerId,
        );
        if (customer) {
            form.setData('customer_email', customer.email || '');
            form.setData('customer_phone', customer.phone || '');
            form.setData('customer_address', customer.address || '');
        }
    }, [form.data.customer_id, customers]);

    const autocompleteData = {
        vehicle_license_plates,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={record ? `Edit Order #${record.id}` : 'New Order'} />

            <div className="p-4 pb-28 md:pb-4">
                <form onSubmit={handleSubmit}>
                    {/* Header + Workflow */}
                    <div className="sticky top-0 z-20 mb-4 flex flex-col gap-3 bg-white pb-3 md:static md:flex-row md:items-center md:justify-between">
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
                                                title: sendInvoiceConfirmation.title,
                                                text: sendInvoiceConfirmation.text,
                                                icon: 'question',
                                                showCancelButton: true,
                                                confirmButtonText:
                                                    sendInvoiceConfirmation.confirmButtonText,
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
                                                            onSuccess: () => {
                                                                setCurrentState('invoiced');
                                                                form.setData('state', 'invoiced');
                                                                toast.success(
                                                                    'Invoice sent successfully!',
                                                                );
                                                            },
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
                                        {isInvoiceAlreadySent ? 'Resend Invoice' : 'Send Invoice'}
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

                            {!isPaid && (
                                <Button
                                    type="submit"
                                    className="flex items-center gap-1 border-none bg-gray-700 text-white hover:bg-gray-800"
                                >
                                    Update
                                </Button>
                            )}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(route('orders.index'))}
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

                    {/* Form Fields */}
                    <FormRenderer
                        fields={fields}
                        form={form}
                        options={options}
                        columns={2}
                        disabled={isPaid}
                        autocompleteData={autocompleteData}
                    />

                    {/* Lines Table */}
                    <div className="mt-6">
                        <div className="">
                            <h2 className="mb-2 text-lg font-semibold">
                                Repairs / Products
                            </h2>
                            <table className="hidden w-full rounded border md:table">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="w-[40%] p-1">Product</th>
                                        <th className="w-[25%] p-1">
                                            Mechanic
                                        </th>
                                        <th className="w-[8.75%] p-1">
                                            Quantity
                                        </th>
                                        <th className="w-[8.75%] p-1">
                                            Unit Price
                                        </th>
                                        <th className="w-[8.75%] p-1">
                                            Subtotal
                                        </th>
                                        {!isPaid && (
                                        <th className="w-[8.75%] p-1">
                                            Actions
                                        </th>
                                            )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {form.data.lines.map((line, index) => (
                                        <tr key={index}>
                                            <td className="p-1">
                                                <CreatableSelect
                                                    isDisabled={isPaid}
                                                    options={availableProducts.map(
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
                                                            : line.description
                                                            ? {
                                                                  value: line.description,
                                                                  label: line.description,
                                                              }
                                                            : null
                                                    }
                                                    onChange={(selected: any) =>
                                                        handleProductChange(
                                                            index,
                                                            selected,
                                                        )
                                                    }
                                                    isClearable
                                                    formatCreateLabel={(inputValue) =>
                                                        `Add "${inputValue}"`
                                                    }
                                                    isValidNewOption={(inputValue) =>
                                                        Boolean(inputValue?.trim())
                                                    }
                                                />
                                            </td>
                                            <td className="p-1">
                                                <Select
                                                    isDisabled={isPaid}
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
                                                    disabled={isPaid}
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
                                                    disabled={isPaid}
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
                                            {!isPaid && (
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
                                            )}
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
                                            <CreatableSelect
                                                isDisabled={isPaid}
                                                className="text-sm"
                                                options={availableProducts.map(
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
                                                        : line.description
                                                        ? {
                                                              value: line.description,
                                                              label: line.description,
                                                          }
                                                        : null
                                                }
                                                onChange={(selected: any) =>
                                                    handleProductChange(
                                                        index,
                                                        selected,
                                                    )
                                                }
                                                isClearable
                                                formatCreateLabel={(inputValue) =>
                                                    `Add "${inputValue}"`
                                                }
                                                isValidNewOption={(inputValue) =>
                                                    Boolean(inputValue?.trim())
                                                }
                                            />
                                        </div>

                                        {/* Mechanic */}
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500">
                                                Mechanic
                                            </label>
                                            <Select
                                                isDisabled={isPaid}
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
                                                    disabled={isPaid}
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
                                                    disabled={isPaid}
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
                                        {!isPaid && (
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
                                        )}
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
