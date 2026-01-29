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
const today = new Date().toISOString().slice(0, 10);

export default function PurchaseOrderForm({
  record,
  suppliers,
  products,
  states,
  fields,
  suppliers_fields,
}: any) {
  const form = useForm({
      supplier_id: null,
      order_date: '',
      state: 'draft',
      total_tax: 0,
      total_discount: 0,
      total_amount: 0,
      lines: (record?.lines || []).map((line: any) => ({
          ...line,
          quantity: Number(line.quantity || 0),
          unit_price: Number(line.unit_price || 0),
          subtotal: Number(line.unit_price || 0) * Number(line.quantity || 0),
      })),
      ...(record || {
          order_date: today, // ✅ dynamic,
          state: 'draft'
      }),
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Purchase Orders', href: route('purchase-orders.index') },
    { title: record ? `Edit PO #${record.id}` : 'New Purchase Order', href: '#' },
  ];

  /* ---------------- Form Submit ---------------- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    record
      ? form.put(route('purchase-orders.update', record.id), {
          onSuccess: () => toast.success('Purchase Order updated successfully!'),
        })
      : form.post(route('purchase-orders.store'), {
          onSuccess: () => toast.success('Purchase Order created successfully!'),
        });
  };

  /* ---------------- Lines Handling ---------------- */
  const addLine = () => {
    form.setData('lines', [
      ...form.data.lines,
      { product_id: null, quantity: 1, unit_price: 0, subtotal: 0 },
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
    line.subtotal = Number(line.unit_price || 0) * Number(line.quantity || 0);

    form.setData('lines', newLines);
  };

  /* ---------------- Totals ---------------- */
  const untaxedAmount = form.data.lines.reduce(
    (acc, l) => acc + Number(l.unit_price || 0) * Number(l.quantity || 0),
    0
  );
  const taxAmount = untaxedAmount * 0.13;
  const totalAmount = untaxedAmount + taxAmount;

  const options = { suppliers, products, states, suppliers_fields};

  return (
      <AppLayout breadcrumbs={breadcrumbs}>
          <Head
              title={record ? `Edit PO #${record.id}` : 'New Purchase Order'}
          />

          <div className="p-4">
              <form onSubmit={handleSubmit}>
                  <div className="mb-4 flex items-center justify-between">
                      <h1 className="text-xl font-bold">
                          {record
                              ? `Edit PO #${record.id}`
                              : 'Create Purchase Order'}
                      </h1>
                      <div className="flex gap-2">
                          <Button
                              type="button"
                              variant="outline"
                              onClick={() => window.history.back()}
                          >
                              Go Back
                          </Button>
                          <Button type="submit">
                              {record ? 'Update' : 'Create'}
                          </Button>
                      </div>
                  </div>

                  {/* ---------------- Main Fields ---------------- */}
                  <FormRenderer
                      fields={fields}
                      form={form}
                      options={options}
                      columns={2}
                  />

                  {/* ---------------- Lines Table ---------------- */}
                  <div className="mt-6">
                      <h2 className="mb-2 text-lg font-semibold">
                          Purchase Lines
                      </h2>

                      <table className="w-full rounded border">
                          <thead>
                              <tr className="bg-gray-100 text-left">
                                  <th className="w-2/5 p-1">Product</th>
                                  <th className="w-1/6 p-1">Quantity</th>
                                  <th className="w-1/6 p-1">Unit Price</th>
                                  <th className="text-center w-1/6 p-1">Subtotal</th>
                                  <th className="w-1/6 p-1">Actions</th>
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
                                                  const product = products.find(
                                                      (p: any) =>
                                                          p.id === productId,
                                                  );

                                                  const newLines = [
                                                      ...form.data.lines,
                                                  ];
                                                  newLines[index].product_id =
                                                      productId;
                                                  newLines[index].unit_price =
                                                      product
                                                          ? Number(
                                                                product.cost_price ||
                                                                    0,
                                                            )
                                                          : 0;
                                                  newLines[index].subtotal =
                                                      newLines[index]
                                                          .unit_price *
                                                      newLines[index].quantity;
                                                  form.setData(
                                                      'lines',
                                                      newLines,
                                                  );
                                              }}
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
                                              ).toFixed(2)}
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
                                              2,
                                          )}
                                      </td>

                                      <td className="p-1 text-center">
                                          <Button
                                              size="sm"
                                              variant="destructive"
                                              onClick={() => removeLine(index)}
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
