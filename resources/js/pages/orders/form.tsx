import FormRenderer from '@/components/form/FormRenderer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { route } from 'ziggy-js';

const today = new Date().toISOString().slice(0, 10);
const STORAGE_KEY = 'order-form-state';

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
    customer_prices, // customer-specific prices passed from controller
    vehicle_makes,
    vehicle_models,
}: any) {
    // Load form state from localStorage or initialize with fresh data
    const getSavedFormState = () => {
        if (record) return null; // Don't restore if editing existing record
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Error loading form state:', error);
            return null;
        }
    };

    const savedState = getSavedFormState();
    const [showRestoreNotice, setShowRestoreNotice] = useState(!!savedState);

    const form = useForm({
        customer_id: savedState?.customer_id ?? null,
        // vehicle_id: savedState?.vehicle_id ?? null,
        vehicle_name: savedState?.vehicle_name ?? '',
        vehicle_model: savedState?.vehicle_model ?? '',
        vehicle_make: savedState?.vehicle_make ?? '',
        vehicle_year: savedState?.vehicle_year ?? '',
        vehicle_license_plate: savedState?.vehicle_license_plate ?? '',
        order_date: savedState?.order_date ?? today,
        state: savedState?.state ?? 'in_progress',
        is_brake_fluid_order: savedState?.is_brake_fluid_order ?? false,
        parts_by: savedState?.parts_by ?? 'us',
        total_parts_cost: savedState?.total_parts_cost ?? 0,
        total_labor_cost: savedState?.total_labor_cost ?? 0,
        total_tax: savedState?.total_tax ?? 0,
        total_amount: savedState?.total_amount ?? 0,
        lines: savedState?.lines ?? (record?.lines || []).map((line: any) => ({
            ...line,
            quantity: Number(line.quantity || 0),
            unit_price: Number(line.unit_price || 0),
            subtotal: Number(line.unit_price || 0) * Number(line.quantity || 0),
        })),
        ...(record ? { ...record, ...(savedState || {}) } : {}),
    });

    const filteredVehicles = vehicles;
    /* ---------------- Vehicle Filtering ---------------- */
    // const filteredVehicles = useMemo(() => {
    //     if (!form.data.customer_id) return [];
    //     return (vehicles || []).filter(
    //         (v: any) => v.customer_id == form.data.customer_id,
    //     );
    // }, [vehicles, form.data.customer_id]);

    // useEffect(() => {
    //     if (!form.data.customer_id) {
    //         form.setData('vehicle_id', null);
    //         return;
    //     }

    //     const stillValid = filteredVehicles.some(
    //         (v: any) => v.id === form.data.vehicle_id,
    //     );

    //     if (!stillValid) form.setData('vehicle_id', null);
    // }, [form.data.customer_id, filteredVehicles]);

    /* ---------------- Breadcrumbs ---------------- */
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Orders', href: route('orders.index') },
        { title: record ? `Edit Order #${record.id}` : 'New Order', href: '#' },
    ];

    /* ---------------- Save Form State to localStorage ---------------- */
    useEffect(() => {
        if (record) return; // Don't save when editing existing record
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(form.data));
        } catch (error) {
            console.error('Error saving form state:', error);
        }
    }, [form.data, record]);

    /* ---------------- Clear localStorage on submit success ---------------- */
    const clearFormState = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing form state:', error);
        }
    };

    /* ---------------- Reset Form and Clear State ---------------- */
    const handleReset = () => {
        form.reset();
        clearFormState();
        toast.success('Form reset successfully');
    };

    /* ---------------- Form Submit ---------------- */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('orders.store'), {
            onSuccess: () => {
                clearFormState();
                toast.success('Order saved successfully!');
            },
            onError: (errors) =>
                Object.values(errors).forEach((err: any) => toast.error(err)),
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

        // recalc subtotal
        const line = newLines[index];
        line.subtotal =
            Number(line.unit_price || 0) * Number(line.quantity || 0);

        form.setData('lines', newLines);
    };

    /* ---------------- Customer-Specific Pricing ---------------- */
    useEffect(() => {
        if (!form.data.customer_id) return;

        const updatedLines = form.data.lines.map((line) => {
            const product = products.find((p: any) => p.id === line.product_id);
            if (!product) return line;

            // lookup customer price
            const key = `${form.data.customer_id}_${product.id}`;
            const customerPrice =
                customer_prices[key] ?? product.sale_price ?? 0;

            return {
                ...line,
                unit_price: Number(customerPrice),
                subtotal: Number(customerPrice) * Number(line.quantity),
            };
        });

        form.setData('lines', updatedLines);
    }, [form.data.customer_id]);

    /* ---------------- Totals ---------------- */
    const untaxedAmount = form.data.lines.reduce(
        (acc, l) => acc + Number(l.unit_price || 0) * Number(l.quantity || 0),
        0,
    );
    const taxAmount = untaxedAmount * 0.13;
    const totalAmount = untaxedAmount + taxAmount;

    /* ---------------- Options ---------------- */
    const [localCustomers, setLocalCustomers] = useState(customers || []);
    const types = [
        { id: 'individual', name: 'Individual' },
        { id: 'company', name: 'Company' },
    ];

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

    const autocompleteData = {
        vehicle_makes,
        vehicle_models,
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={record ? `Edit Order #${record.id}` : 'New Order'} />
            <div className="p-4 pb-28 md:pb-4">
                <form onSubmit={handleSubmit}>
                    <div className="sticky top-0 z-20 mb-4 flex flex-col gap-3 bg-white pb-3 md:flex-row md:items-center md:justify-between">
                        <h1 className="text-xl font-bold">
                            {record
                                ? `Edit Order #${record.id}`
                                : 'Create Order'}
                        </h1>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    clearFormState();
                                    window.history.back();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleReset}
                                title="Reset form to initial state"
                            >
                                <RotateCcw className="mr-1 h-4 w-4" />
                                Reset
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Saving...' : record ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </div>

                    {/* Restoration Notice
                    {showRestoreNotice && (
                        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-semibold text-blue-900">
                                        Form Data Restored
                                    </p>
                                    <p className="mt-1 text-blue-800">
                                        Your previous form entries have been
                                        restored. Click Reset to start fresh.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowRestoreNotice(false)}
                                    className="text-blue-600 hover:text-blue-900"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )} */}

                    {/* Customer, Vehicle, and Other Fields */}
                    <FormRenderer
                        fields={fields}
                        onOptionsUpdate={(relation, record) => {
                            if (relation === 'customers')
                                handleCustomerCreated(record);
                        }}
                        form={form}
                        options={options}
                        columns={2}
                        disabled={false}
                        autocompleteData={autocompleteData}
                    />

                    {/* Lines Table */}
                    <div className="mt-6">
                        <h2 className="mb-2 text-lg font-semibold">
                            Repairs / Services
                        </h2>
                        <table className="hidden w-full rounded border md:table">
                            <thead className="bg-gray-100 text-xs md:text-sm">
                                <tr>
                                    <th className="min-w-[200px] p-2">
                                        Product
                                    </th>
                                    <th className="min-w-[180px] p-2">
                                        Mechanic
                                    </th>
                                    <th className="min-w-[90px] p-2">Qty</th>
                                    <th className="min-w-[110px] p-2">
                                        Unit Price
                                    </th>
                                    <th className="min-w-[110px] p-2">
                                        Subtotal
                                    </th>
                                    <th className="min-w-[70px] p-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {form.data.lines.map((line, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-gray-50"
                                    >
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

                                                    const key = `${form.data.customer_id}_${productId}`;
                                                    const customerPrice =
                                                        customer_prices[key] ??
                                                        product?.sale_price ??
                                                        0;

                                                    const newLines = [
                                                        ...form.data.lines,
                                                    ];
                                                    newLines[index].product_id =
                                                        productId;
                                                    newLines[index].unit_price =
                                                        Number(customerPrice);
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
                                                isClearable
                                                placeholder="Select mechanic"
                                            />
                                        </td>

                                        <td className="p-1">
                                            <Input
                                                type="number"
                                                value={line.quantity}
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
                                                value={line.unit_price}
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
                                            {line.subtotal.toFixed(2)}
                                        </td>

                                        <td className="p-1 text-center">
                                            <Button
                                                size="sm"
                                                type="button"
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
                                            options={products.map((p: any) => ({
                                                value: p.id,
                                                label: p.name,
                                            }))}
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
                                                const product = products.find(
                                                    (p: any) =>
                                                        p.id === productId,
                                                );

                                                const key = `${form.data.customer_id}_${productId}`;
                                                const customerPrice =
                                                    customer_prices[key] ??
                                                    product?.sale_price ??
                                                    0;

                                                const newLines = [
                                                    ...form.data.lines,
                                                ];
                                                newLines[index].product_id =
                                                    productId;
                                                newLines[index].unit_price =
                                                    Number(customerPrice);
                                                newLines[index].subtotal =
                                                    Number(customerPrice) *
                                                    Number(
                                                        newLines[index]
                                                            .quantity,
                                                    );

                                                form.setData('lines', newLines);
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
                                            isClearable
                                            placeholder="Select mechanic"
                                        />
                                    </div>

                                    {/* Quantity + Unit Price */}
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
                                                        Number(e.target.value),
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
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Subtotal */}
                                    <div className="flex justify-between font-semibold">
                                        <span>Subtotal</span>
                                        <span>${line.subtotal.toFixed(2)}</span>
                                    </div>

                                    {/* Delete */}
                                    <div className="text-right">
                                        <Button
                                            size="sm"
                                            type="button"
                                            variant="destructive"
                                            onClick={() => removeLine(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Add Line Button */}
                        <Button
                            type="button"
                            onClick={addLine}
                            variant="outline"
                            className="mt-2"
                        >
                            <Plus className="mr-1" /> Add Line
                        </Button>
                    </div>

                    {/* Totals */}
                    <div className="mt-6 hidden justify-end md:flex">
                        <table className="border-collapse border">
                            <tbody>
                                <tr>
                                    <td className="px-2 py-1 font-semibold">
                                        Untaxed Amount
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                        {untaxedAmount.toFixed(2)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-2 py-1 font-semibold">
                                        Tax 13%
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                        {taxAmount.toFixed(2)}
                                    </td>
                                </tr>
                                <tr className="border-t">
                                    <td className="px-2 py-1 font-semibold">
                                        Total
                                    </td>
                                    <td className="px-2 py-1 text-right text-lg">
                                        {totalAmount.toFixed(2)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE TOTALS */}
                    <div className="fixed right-0 bottom-0 left-0 z-30 border-t bg-white p-3 shadow-lg md:hidden">
                        <div className="flex justify-between text-sm">
                            <span>Untaxed</span>
                            <span>{untaxedAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Tax</span>
                            <span>{taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="mt-2 flex justify-between border-t pt-2 text-lg font-semibold">
                            <span>Total</span>
                            <span>{totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
