import { Input } from '@/components/ui/input';
import { Filter } from 'lucide-react';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';

interface Option {
    label: string;
    value: any;
}

interface FilterConfig {
    label: string;
    field: string;
    operator: string;
    type: 'select' | 'date' | 'number';
    options?: Option[];
}

interface Props {
    visible: boolean;
    filters: FilterConfig[];
    query: string;
    onSelectValue: (opt: Option, filter: FilterConfig) => void;
}

export default function FilterDropdown({
    visible,
    filters,
    query,
    onSelectValue,
}: Props) {
    if (!visible) return null;

    const [dates, setDates] = useState<Record<string, Date | null>>({});
    const [numbers, setNumbers] = useState<Record<string, number | ''>>({});

    const formatForBackend = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const formatForLabel = (date: Date) =>
        date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });

    return (
        <div className="absolute z-50 mt-1 flex w-full flex-col gap-3 rounded-xl border bg-white p-3 shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <Filter size={14} />
                </span>
                Filters
            </div>

            {filters.map((filter) => (
                <div
                    key={filter.field}
                    className="flex w-full items-center gap-3 text-sm"
                >
                    {/* Label */}
                    <span className="w-28 whitespace-nowrap text-slate-600">
                        {filter.label}
                    </span>

                    {/* Select */}
                    {filter.type === 'select' && (
                        <div className="flex-1">
                            <Select
                                options={filter.options}
                                onChange={(opt: any) =>
                                    onSelectValue(opt, filter)
                                }
                                placeholder="Select…"
                                classNamePrefix="react-select"
                                menuPortalTarget={document.body}
                                styles={{
                                    menuPortal: (base) => ({
                                        ...base,
                                        zIndex: 9999,
                                    }),
                                    control: (base) => ({
                                        ...base,
                                        minHeight: 34,
                                        height: 34,
                                        borderColor: '#e5e7eb',
                                        boxShadow: 'none',
                                        ':hover': { borderColor: '#c7d2fe' },
                                    }),
                                }}
                            />
                        </div>
                    )}

                    {/* Number */}
                    {filter.type === 'number' && (
                        <div className="flex-1">
                            <Input
                                type="number"
                                value={numbers[filter.field] ?? ''}
                                placeholder="Enter number…"
                                className="h-[34px] border-slate-200 focus:border-blue-400 focus:ring-blue-200"
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    const value = raw === '' ? '' : Number(raw);

                                    setNumbers((prev) => ({
                                        ...prev,
                                        [filter.field]: value,
                                    }));

                                    if (raw === '') {
                                        onSelectValue(
                                            { label: '', value: null },
                                            filter,
                                        );
                                        return;
                                    }

                                    onSelectValue(
                                        {
                                            label: String(value),
                                            value,
                                        },
                                        filter,
                                    );
                                }}
                            />
                        </div>
                    )}

                    {/* Date */}
                    {filter.type === 'date' && (
                        <div className="flex-1">
                            <DatePicker
                                selected={dates[filter.field] || null}
                                onChange={(date: Date | null) => {
                                    setDates((prev) => ({
                                        ...prev,
                                        [filter.field]: date,
                                    }));

                                    if (!date) {
                                        onSelectValue(
                                            { label: '', value: null },
                                            filter,
                                        );
                                        return;
                                    }

                                    onSelectValue(
                                        {
                                            label: formatForLabel(date),
                                            value: formatForBackend(date),
                                        },
                                        filter,
                                    );
                                }}
                                dateFormat="dd-MMM-yyyy"
                                placeholderText="Select date…"
                                popperPlacement="bottom-start"
                                wrapperClassName="w-full"
                                className="h-[34px] w-full rounded-md border border-slate-200 px-2 text-sm focus:ring-2 focus:ring-blue-200 focus:outline-none"
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
