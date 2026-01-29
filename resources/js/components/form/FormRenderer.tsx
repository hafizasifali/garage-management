import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toBackendDate, toPickerDate } from '@/lib/date';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Many2OneField from './Many2OneField';

type FormRendererProps = {
    fields: Record<string, any>;
    form: any;
    options?: Record<string, any>;
    columns?: 1 | 2 | 4; // default 2 columns
    onOptionsUpdate?: (relation: string, newRecord: any) => void;
};

export default function FormRenderer({
    fields,
    form,
    options = {},
    columns = 2,
    onOptionsUpdate,
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
            <div className="p-4 text-sm text-muted-foreground">
                Loading form…
            </div>
        );
    }

    return (
        <div className={`grid gap-4 ${gridCols}`}>
            {Object.entries(fields).map(([name, field]: any) => {
                const error = form.errors[name];

                const selectOptions =
                    field.type === 'many2one' || field.type === 'many2many'
                        ? (options[field.relation] || []).map((item: any) => ({
                              value: item.id,
                              label: item.name,
                          }))
                        : [];

                const selectValue =
                    field.type === 'many2one'
                        ? selectOptions.find(
                              (o) => o.value === form.data[name],
                          ) || null
                        : field.type === 'many2many'
                          ? selectOptions.filter((o) =>
                                form.data[name]?.includes(o.value),
                            )
                          : null;

                return (
                    <div key={name} className="flex items-center gap-2">
                        <Label className="w-32 flex-shrink-0 text-left">
                            {field.label}
                        </Label>

                        <div className="flex flex-1 flex-col">
                            {field.type === 'char' && (
                                <Input
                                    maxLength={field.length}
                                    value={form.data[name] || ''}
                                    onChange={(e) =>
                                        form.setData(name, e.target.value)
                                    }
                                    className={cn(
                                        error && 'border-destructive',
                                    )}
                                />
                            )}

                            {field.type === 'email' && (
                                <Input
                                    type={`email`}
                                    maxLength={field.length}
                                    value={form.data[name] || ''}
                                    onChange={(e) =>
                                        form.setData(name, e.target.value)
                                    }
                                    className={cn(
                                        error && 'border-destructive',
                                    )}
                                />
                            )}

                            {field.type === 'text' && (
                                <Textarea
                                    value={form.data[name] || ''}
                                    onChange={(e) =>
                                        form.setData(name, e.target.value)
                                    }
                                    className={cn(
                                        error && 'border-destructive',
                                    )}
                                />
                            )}

                            {field.type === 'date' && (
                                <DatePicker
                                    selected={toPickerDate(form.data[name])}
                                    onChange={(date: Date | null) =>
                                        form.setData(name, toBackendDate(date))
                                    }
                                    dateFormat="dd-MMM-yyyy"
                                    placeholderText="Select date"
                                    className={cn(
                                        'w-full rounded-md border px-3 py-2 text-sm',
                                        error && 'border-destructive',
                                    )}
                                    showPopperArrow={false}
                                />
                            )}

                            {field.type === 'boolean' && (
                                <Switch
                                    checked={form.data[name]}
                                    onCheckedChange={(val) =>
                                        form.setData(name, val)
                                    }
                                />
                            )}

                            {(field.type === 'many2one' ||
                                field.type === 'many2many') && (
                                <Many2OneField
                                    label={field.label}
                                    value={String(form.data[name])}
                                    options={options[field.relation] || []}
                                    allOptions={{ ...options, onOptionsUpdate }}
                                    onChange={(val) => form.setData(name, val)}
                                    createRoute={`${field.relation}.quickCreate`}
                                    createTitle={field.label}
                                    fields={
                                        options[`${field.relation}_fields`] ??
                                        {}
                                    }
                                    quickCreate={field.quick_create === true}
                                    defaultValues={
                                        name === 'vehicle_id' &&
                                        form.data.customer_id
                                            ? {
                                                  customer_id: String(
                                                      form.data.customer_id,
                                                  ),
                                              }
                                            : {}
                                    }
                                    onOptionsUpdate={onOptionsUpdate}
                                />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
