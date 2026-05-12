import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toBackendDate, toPickerDate } from '@/lib/date';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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
    disabled?: boolean;
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

    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

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

                // Check conditional visibility based on depends_on and depends_value
                if (field.depends_on && field.depends_value) {
                   
                    const dependentValue = form.data[field.depends_on];
                    // Handle both array (many2many) and single value (many2one) comparisons
                    const isVisible = Array.isArray(dependentValue)
                        ? dependentValue.includes(field.depends_value)
                        : dependentValue == field.depends_value;

                    if (!isVisible) {
                        return null; // Hide field if condition not met
                    }
                }


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

                                const inputValue = form.data[name] || '';
                                const showSuggestions = inputValue.length >= 3;
                                const filtered = showSuggestions
                                    ? suggestions.filter((s) =>
                                          s.toLowerCase().includes(inputValue.toLowerCase()),
                                      )
                                    : [];

                                const [openDropdown, setOpenDropdown] = useState<string | null>(null);
                                const [focusedIndex, setFocusedIndex] = useState<number>(-1);

                                const handleSelectSuggestion = (suggestion: string) => {
                                    form.setData(name, suggestion);
                                    setOpenDropdown(null);
                                    setFocusedIndex(-1);
                                };

                                const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (!openDropdown || filtered.length === 0) return;

                                    switch (e.key) {
                                        case 'ArrowDown':
                                            e.preventDefault();
                                            setFocusedIndex(prev => 
                                                prev < filtered.length - 1 ? prev + 1 : 0
                                            );
                                            break;
                                        case 'ArrowUp':
                                            e.preventDefault();
                                            setFocusedIndex(prev =>
                                                prev > 0 ? prev - 1 : filtered.length - 1
                                            );
                                            break;
                                        case 'Tab':
                                        case 'Enter':
                                            if (focusedIndex >= 0) {
                                                e.preventDefault();
                                                handleSelectSuggestion(filtered[focusedIndex]);
                                            }
                                            break;
                                        case 'Escape':
                                            e.preventDefault();
                                            setOpenDropdown(null);
                                            setFocusedIndex(-1);
                                            break;
                                    }
                                };

                                return (
                                    <div className="relative">
                                        <Input
                                            disabled={field.disabled}
                                            placeholder={field.placeholder}
                                            value={form.data[name] || ''}
                                            autoComplete="off"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                form.setData(name, value);
                                                // When parent (non-dependent field) changes, clear dependent field
                                                if (!dependsOn) {
                                                    // Find fields that depend on this one and clear them
                                                    // This is a simple approach - in production you'd track dependencies
                                                }
                                                if (value.length >= 3) {
                                                    setOpenDropdown(name);
                                                } else {
                                                    setOpenDropdown(null);
                                                }
                                                setFocusedIndex(-1);
                                            }}
                                            onKeyDown={handleKeyDown}
                                            onFocus={() => {
                                                if (inputValue.length >= 3) {
                                                    setOpenDropdown(name);
                                                }
                                            }}
                                            onBlur={() => setTimeout(() => setOpenDropdown(null), 150)}
                                            className={cn(error && 'border-destructive')}
                                        />
                                        {openDropdown === name && showSuggestions && filtered.length > 0 && (
                                            <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-white text-sm shadow-md">
                                                {filtered.map((s, index) => (
                                                    <li
                                                        key={s}
                                                        className={cn(
                                                            "cursor-pointer px-3 py-2",
                                                            index === focusedIndex
                                                                ? "bg-blue-500 text-white"
                                                                : "hover:bg-gray-100"
                                                        )}
                                                        onMouseDown={() => {
                                                            handleSelectSuggestion(s);
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
                                    disabled={disabled || field.disabled}
                                    readOnly={disabled || field.readonly}
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
                                    disabled={disabled || field.disabled}
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
                                    disabled={disabled || field.disabled}
                                    readOnly={disabled || field.readonly}
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
                                <div className="relative w-full">
                                    <Input
                                        disabled={Boolean(disabled)}
                                        type={showPasswords[name] ? 'text' : 'password'}
                                        placeholder={field.placeholder || ''}
                                        maxLength={field.length}
                                        value={form.data[name] || ''}
                                        onChange={(e) =>
                                            form.setData(name, e.target.value)
                                        }
                                        className={cn(
                                            error && 'border-destructive',
                                            'pr-10',
                                        )}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPasswords((prev) => ({
                                                ...prev,
                                                [name]: !prev[name],
                                            }))
                                        }
                                        disabled={Boolean(disabled)}
                                        className="absolute inset-y-0 right-0 mr-2 flex items-center justify-center text-muted-foreground hover:text-foreground"
                                        aria-label={showPasswords[name] ? 'Hide password' : 'Show password'}
                                    >
                                        {showPasswords[name] ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
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
                                    disabled={Boolean(disabled)}
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
