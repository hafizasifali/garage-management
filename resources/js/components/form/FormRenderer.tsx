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
import ImageField from '@/components/form/ImageField';

type FormRendererProps = {
    fields: Record<string, any>;
    form: any;
    options?: Record<string, any>;
    columns?: 1 | 2 | 4; // default 2 columns
    onOptionsUpdate?: (relation: string, newRecord: any) => void;
    disabled: boolean;
    autocompleteData?: Record<string, string[] | Record<string, string[]>>;
};

export default function FormRenderer({
    fields,
    form,
    options = {},
    columns = 2,
    onOptionsUpdate,
    disabled,
    autocompleteData = {},
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
                            {field.type === 'autocomplete' && (() => {
                                const dependsOn = field.depends_on || null;
                                const dependsValue = dependsOn ? form.data[dependsOn] : null;

                                // Key is always based on the field name: vehicle_make -> vehicle_makes, vehicle_model -> vehicle_models
                                const suggestionsKey = `${name}s`;

                                // Debug: log the key and data structure
                                const autocompleteValue = autocompleteData[suggestionsKey];
                                console.log('Autocomplete:', name, dependsOn, dependsValue, suggestionsKey, autocompleteValue);

                                // If depends_on is set, data is nested Record<string, string[]>
                                // Otherwise it's a flat string[]
                                const isNested = dependsOn && dependsValue;
                                let suggestions: string[] = [];
                                if (isNested && autocompleteValue && typeof autocompleteValue === 'object') {
                                    suggestions = (autocompleteValue as Record<string, string[]>)[dependsValue] || [];
                                } else if (Array.isArray(autocompleteValue)) {
                                    suggestions = autocompleteValue as string[];
                                }

                                const filtered = suggestions.filter(s =>
                                    s.toLowerCase().includes((form.data[name] || '').toLowerCase())
                                );

                                const [openDropdown, setOpenDropdown] = useState<string | null>(null);
                                return (
                                    <div className="relative">
                                        <Input
                                            disabled={field.disabled}
                                            placeholder={field.placeholder}
                                            value={form.data[name] || ''}
                                            autoComplete="off"
                                            onChange={(e) => {
                                                form.setData(name, e.target.value);
                                                // When parent (non-dependent field) changes, clear dependent field
                                                if (!dependsOn) {
                                                    // Find fields that depend on this one and clear them
                                                    // This is a simple approach - in production you'd track dependencies
                                                }
                                                setOpenDropdown(name);
                                            }}
                                            onFocus={() => setOpenDropdown(name)}
                                            onBlur={() => setTimeout(() => setOpenDropdown(null), 150)}
                                            className={cn(error && 'border-destructive')}
                                        />
                                        {openDropdown === name && filtered.length > 0 && (
                                            <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-white text-sm shadow-md">
                                                {filtered.map(s => (
                                                    <li
                                                        key={s}
                                                        className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                                                        onMouseDown={() => {
                                                            form.setData(name, s);
                                                            setOpenDropdown(null);
                                                        }}
                                                    >
                                                        {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                );
                            })()}

                            {field.type === 'char' && (
                                <Input
                                    disabled={disabled}
                                    placeholder={field.placeholder || ''}
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

                            {field.type === 'number' && (
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={field.length}
                                    disabled={disabled}
                                    placeholder={field.placeholder || ''}
                                    value={form.data[name] || ''}
                                    onChange={
                                        (e) =>
                                            form.setData(
                                                name,
                                                e.target.value.replace(
                                                    /\D/g,
                                                    '',
                                                ),
                                            ) // only digits
                                    }
                                    className={cn(
                                        error && 'border-destructive',
                                    )}
                                />
                            )}

                            {field.type === 'email' && (
                                <Input
                                    disabled={disabled}
                                    type={`email`}
                                    placeholder={field.placeholder || ''}
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

                            {field.type === 'password' && (
                                <Input
                                    disabled={disabled}
                                    type={`password`}
                                    placeholder={field.placeholder || ''}
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
                                    disabled={disabled}
                                    placeholder={field.placeholder || ''}
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
                                    disabled={disabled}
                                    readOnly={disabled}
                                    selected={toPickerDate(form.data[name])}
                                    onChange={(date: Date | null) =>
                                        form.setData(name, toBackendDate(date))
                                    }
                                    dateFormat="dd-MMM-yyyy"
                                    placeholderText={field.placeholder || 'Select date'}
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
                            {field.type === 'image' && (
                                <ImageField
                                    name={name}
                                    label={field.label}
                                    value={form.data[name]}
                                    error={error}
                                    onChange={(file) =>
                                        form.setData(name, file)
                                    }
                                />
                            )}

                            {(field.type === 'many2one' ||
                                field.type === 'many2many') && (
                                <Many2OneField
                                    disabled={disabled}
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
                                    placeholder={field.placeholder}
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
