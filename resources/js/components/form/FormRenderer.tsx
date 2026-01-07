import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Select from 'react-select';
import { useState } from 'react';
import Many2OneField from './Many2OneField';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { toPickerDate, toBackendDate } from '@/lib/date';
type FormRendererProps = {
  fields: Record<string, any>;
  form: any;
  options?: Record<string, any>;
  columns?: 1 | 2 | 4; // default 2 columns
};

export default function FormRenderer({
  fields,
  form,
  options = {},
  columns = 2,
}: FormRendererProps) {
  const gridCols =
    columns === 1
      ? 'grid-cols-1'
      : columns === 4
      ? 'md:grid-cols-4'
      : 'md:grid-cols-2';

  const [search, setSearch] = useState<Record<string, string>>({});
if (!fields || Object.keys(fields).length === 0) {
  return (
    <div className="text-sm text-muted-foreground p-4">
      Loading form…
    </div>
  );
}

  return (
    <div className={`grid gap-4 ${gridCols}`}>
      {Object.entries(fields).map(([name, field]: any) => {
        const error = form.errors[name];

        // react-select options
        const selectOptions =
          field.type === 'many2one' || field.type === 'many2many'
            ? (options[field.relation] || []).map((item: any) => ({
                value: item.id,
                label: item.name,
              }))
            : [];

        // current value for react-select
        const selectValue =
          field.type === 'many2one'
            ? selectOptions.find((o) => o.value === form.data[name]) || null
            : field.type === 'many2many'
            ? selectOptions.filter((o) => form.data[name]?.includes(o.value))
            : null;

        return (
            <div key={name} className="flex items-center gap-2">
                <Label className="w-32 flex-shrink-0 text-left">
                    {field.label}
                </Label>

                <div className="flex flex-1 flex-col">
                    {/* CHAR / TEXT */}
                    {field.type === 'char' && (
                        <Input
                            value={form.data[name] || ''}
                            onChange={(e) => form.setData(name, e.target.value)}
                            className={cn(error && 'border-destructive')}
                        />
                    )}

                    {field.type === 'password' && (
                        <Input
                            type="password"
                            value={form.data[name] || ''}
                            onChange={(e) => form.setData(name, e.target.value)}
                            autoComplete="new-password"
                            className={cn(error && 'border-destructive')}
                        />
                    )}

                    {field.type === 'text' && (
                        <Textarea
                            value={form.data[name] || ''}
                            onChange={(e) => form.setData(name, e.target.value)}
                            className={cn(error && 'border-destructive')}
                        />
                    )}
                    {field.type === 'date' && (
                      <DatePicker
                        selected={toPickerDate(form.data[name])}
                        onChange={(date: Date | null) =>
                          form.setData(name, toBackendDate(date))
                        }
                        dateFormat="dd-MMM-yyyy"   // 👉 10-Dec-2025
                        placeholderText="Select date"
                        className={cn(
                          'w-full rounded-md border px-3 py-2 text-sm',
                          error && 'border-destructive'
                        )}
                        showPopperArrow={false}
                      />
                    )}


                    {/* BOOLEAN */}
                    {field.type === 'boolean' && (
                        <Switch
                            checked={form.data[name]}
                            onCheckedChange={(val) => form.setData(name, val)}
                        />
                    )}

                    {/* MANY2ONE / MANY2MANY with react-select */}
                    {(field.type === 'many2many') && (
                        <Select
                            options={selectOptions}
                            value={selectValue}
                            isMulti={field.type === 'many2many'}
                            onChange={(selected: any) => {
                                if (field.type === 'many2one') {
                                    form.setData(name, selected?.value || null);
                                } else {
                                    form.setData(
                                        name,
                                        selected ? selected.map((s: any) => s.value) : []
                                    );
                                }
                            }}
                            placeholder={`Select ${field.label}`}
                            className={cn(error && 'border-destructive')}
                            classNamePrefix="react-select"
                        />
                    )}
                    {field.type === 'many2one' && (
                        <Many2OneField
                            label={field.label}
                            value={form.data[name]}
                            options={options[field.relation] || []}
                            onChange={(val) => form.setData(name, val)}
                            createRoute={`${field.relation}.quickCreate`}
                            createTitle={field.label}
                            fields={options[`${field.relation}_fields`] ?? {}}
                            quickCreate={field.quick_create === true}
                        />
                    )}
                </div>
            </div>
        );
      })}
    </div>
  );
}
