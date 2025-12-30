import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import FormRenderer from '@/components/form/FormRenderer';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';
import Select from 'react-select';
type GarageJobLine = {
  id?: number;
  product_id: number | null;
  quantity: number;
  unit_price: number;
  tax: number;
  discount: number;
  subtotal: number;
};

export default function GarageJobForm({ record, partners, vehicles, products,employees,fields }: any) {
  const form = useForm({
    partner_id: null,
    vehicle_id: null,
    job_date: '',
    state: 'pending',
    total_parts_cost: 0,
    total_labor_cost: 0,
    total_tax: 0,
    total_discount: 0,
    total_amount: 0,
    lines: record?.lines || [] as GarageJobLine[],
    ...(record || {}),
  });

  const [tab, setTab] = useState('job-info');

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Garage Jobs', href: route('garage-jobs.index') },
    { title: record ? `Edit Job #${record.id}` : 'New Job', href: '#' },
  ];

  /* ---------------- Form Submit ---------------- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitAction = record
      ? form.put(route('garage-jobs.update', record.id), {
          onSuccess: () => toast.success('Job updated successfully!'),
        })
      : form.post(route('garage-jobs.store'), {
          onSuccess: () => toast.success('Job created successfully!'),
        });
  };

  /* ---------------- Lines Handling ---------------- */
  const addLine = () => {
    form.setData('lines', [
      ...form.data.lines,
      { product_id: null, quantity: 1, unit_price: 0, tax: 0, discount: 0, subtotal: 0 },
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

    // Calculate subtotal
    const line = newLines[index];
    line.subtotal =
      (line.unit_price + line.tax - line.discount) * line.quantity;

    form.setData('lines', newLines);
  };


  const options = { partners, vehicles, products,employees };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={record ? `Edit Job #${record.id}` : 'New Garage Job'} />
      <div className="p-4">


        <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between mb-4">
    <h1 className="text-xl font-bold">
      {record ? `Edit Job #${record.id}` : 'Create Job'}
    </h1>
    <div className="flex gap-2">
      <Button type="button" variant="outline" onClick={() => window.history.back()}>
        Cancel
      </Button>
      <Button type="submit">{record ? 'Update' : 'Create'}</Button>
    </div>
  </div>
          {/* After FormRenderer */}
<FormRenderer fields={fields} form={form} options={options} columns={2} />

{/* Lines table below Total Amount */}
<div className="mt-6">
  <h2 className="text-lg font-semibold mb-2">Job Lines</h2>
  <table className="w-full border rounded">
    <thead>
      <tr className="bg-gray-100">
        <th className="p-1">Product</th>
        <th className="p-1">Quantity</th>
        <th className="p-1">Unit Price</th>
        <th className="p-1">Tax</th>
        <th className="p-1">Discount</th>
        <th className="p-1">Subtotal</th>
        <th className="p-1">Actions</th>
      </tr>
    </thead>
    <tbody>
      {(form.data.lines || []).map((line, index) => (
        <tr key={index}>
          <td className="p-1">
           <Select
                options={products.map((p: any) => ({ value: p.id, label: p.name }))}
                value={line.product_id ? { value: line.product_id, label: products.find(p => p.id === line.product_id)?.name } : null}
                onChange={(selected: any) => updateLine(index, 'product_id', selected?.value || null)}
                placeholder="Select Product"
                isClearable
                className="basic-single"
                classNamePrefix="select"
            />
          </td>
          <td className="p-1">
            <Input
              type="number"
              value={line.quantity}
              onChange={(e) => updateLine(index, 'quantity', Number(e.target.value))}
              className="w-full"
            />
          </td>
          <td className="p-1">
            <Input
              type="number"
              value={line.unit_price}
              onChange={(e) => updateLine(index, 'unit_price', Number(e.target.value))}
              className="w-full"
            />
          </td>
          <td className="p-1">
            <Input
              type="number"
              value={line.tax}
              onChange={(e) => updateLine(index, 'tax', Number(e.target.value))}
              className="w-full"
            />
          </td>
          <td className="p-1">
            <Input
              type="number"
              value={line.discount}
              onChange={(e) => updateLine(index, 'discount', Number(e.target.value))}
              className="w-full"
            />
          </td>
          <td className="p-1">{line.subtotal.toFixed(2)}</td>
          <td className="p-1">
            <Button size="sm" variant="destructive" onClick={() => removeLine(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  <div className="mt-2">
    <Button type="button" onClick={addLine} variant="outline">
      <Plus className="mr-1" /> Add Line
    </Button>
  </div>
</div>
{/* === Add Odoo-style summary below === */}
<div className="mt-4 float-right">
  <table className="border-collapse border">
    <tbody>
      <tr>
        <td className="px-2 py-1 font-semibold">Untaxed Amount</td>
        <td className="px-2 py-1 float-right">
          ${form.data.lines.reduce((acc, l) => acc + l.unit_price * l.quantity, 0).toFixed(2)}
        </td>
      </tr>
      <tr>
        <td className="px-2 py-1 font-semibold">Tax 15%</td>
        <td className="px-2 py-1 float-right">
          ${form.data.lines.reduce((acc, l) => acc + l.tax * l.quantity, 0).toFixed(2)}
        </td>
      </tr>
      <tr className="border-t">
        <td className="px-2 py-1 font-semibold">Total</td>
        <td className="px-2 py-1 text-lg float-right">
          ${form.data.lines.reduce((acc, l) => acc + l.subtotal, 0).toFixed(2)}
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
