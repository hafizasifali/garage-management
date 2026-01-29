import { useEffect, useState } from 'react';
import Select from 'react-select';
import OdooMenuList from './OdooMenuList';
import QuickCreateModal from './QuickCreateModal';

type Many2OneFieldProps = {
    label: string;
    value: string | null;
    options?: any[];
    allOptions?: any;
    onChange: (val: string | null) => void;
    createRoute?: string;
    createTitle?: string;
    fields?: Record<string, any>;
    quickCreate?: boolean;
    defaultValues?: Record<string, any>;
    onOptionsUpdate?: (relation: string, newRecord: any) => void; // 🔥 NEW
};

export default function Many2OneField({
    label,
    value,
    options = [],
    allOptions = {},
    onChange,
    createRoute,
    createTitle,
    fields,
    quickCreate = false,
    defaultValues = {},
    onOptionsUpdate,
}: Many2OneFieldProps) {
    const [localOptions, setLocalOptions] = useState(options || []);
    const [open, setOpen] = useState(false);
    const [defaultName, setDefaultName] = useState('');

    // Keep localOptions in sync with parent
    useEffect(() => {
        setLocalOptions(options || []);
    }, [options]);

    const selectOptions = localOptions.map((o) => ({
        value: String(o.id),
        label: o.name,
    }));

    const selected = value
        ? (selectOptions.find((o) => o.value === String(value)) ?? null)
        : null;

    return (
        <>
            <Select
                options={selectOptions}
                value={selected}
                onChange={(opt) => onChange(opt ? opt.value : null)}
                placeholder={`Select ${label}`}
                isClearable
                components={
                    quickCreate ? { MenuList: OdooMenuList } : undefined
                }
                onInputChange={(val) => {
                    if (quickCreate) setDefaultName(val);
                    return val;
                }}
                {...(quickCreate && {
                    onQuickCreate: (search) => {
                        setDefaultName(search);
                        setOpen(true);
                    },
                })}
            />

            {quickCreate && open && (
                <QuickCreateModal
                    open={open}
                    title={`Create ${createTitle}`}
                    fields={fields}
                    options={allOptions}
                    routeName={createRoute}
                    defaultValues={{
                        ...defaultValues,
                        name: defaultName,
                    }}
                    onClose={() => setOpen(false)}
                    onCreated={(id, name, record) => {
                        const newRecord = record ?? { id, name };
                        const option = {
                            ...newRecord,
                            id: String(newRecord.id),
                        };

                        // 🔹 Select immediately
                        onChange(option.id);

                        // 🔹 Add to local dropdown
                        setLocalOptions((prev) => [...prev, option]);

                        // 🔹 Notify parent
                        onOptionsUpdate?.(
                            createRoute?.includes('customer')
                                ? 'customers'
                                : createRoute?.includes('vehicle')
                                  ? 'vehicles'
                                  : '',
                            option,
                        );

                        setOpen(false);
                    }}
                />
            )}
        </>
    );
}
