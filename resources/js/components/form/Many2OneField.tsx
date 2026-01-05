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
}) {
  const [localOptions, setLocalOptions] = useState(options);
  const [open, setOpen] = useState(false);
  const [defaultName, setDefaultName] = useState('');

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const selectOptions = localOptions.map(o => ({
    value: Number(o.id),
    label: o.name,
  }));

  const selected =
    selectOptions.find(o => o.value === Number(value)) || null;

  return (
    <>
      <Select
        options={selectOptions}
        value={selected}
        onChange={(opt) => onChange(opt ? opt.value : null)}
        placeholder={`Select ${label}`}
        isClearable
        components={{ MenuList: OdooMenuList }}
        onInputChange={(val) => setDefaultName(val)}
        onQuickCreate={(search) => {
          setDefaultName(search);
          setOpen(true);
        }}
      />

      {open && (
        <QuickCreateModal
          open={open}
          title={`Create ${createTitle}`}
          fields={fields}
          routeName={createRoute}
          defaultValues={{ name: defaultName }}
          onClose={() => setOpen(false)}
          onCreated={(id, name) => {
            // 🔥 ADD + SELECT
            setLocalOptions(prev => [
              ...prev,
              { id, name },
            ]);

            onChange(id); // <-- THIS selects it
            setOpen(false);
          }}
        />
      )}
    </>
  );
}
