import Select from 'react-select';
import { useEffect, useState } from 'react';
import OdooMenuList from './OdooMenuList';
import QuickCreateModal from './QuickCreateModal';

export default function Many2OneField({
    label,
    value,
    options,
    onChange,
    createRoute,
    createTitle,
    fields,
    quickCreate = false,
}) {
    const [localOptions, setLocalOptions] = useState(options);
    const [open, setOpen] = useState(false);
    const [defaultName, setDefaultName] = useState('');

    useEffect(() => {
        if (!value) return;
        const exists = localOptions.some((o) => String(o.id) === String(value));
        if (!exists && value) {
            setLocalOptions((prev) => prev);
        }
    }, [value]);


    const selectOptions = localOptions.map((o) => ({
        value: String(o.id), // 🔑 ALWAYS STRING
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
                    routeName={createRoute}
                    defaultValues={{ name: defaultName }}
                    onClose={() => setOpen(false)}
                    onCreated={(id, name) => {
                        setLocalOptions((prev) => [...prev, { id, name }]);
                        onChange(id);
                        setOpen(false);
                    }}
                />
            )}
        </>
    );
}
