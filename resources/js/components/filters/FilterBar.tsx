import { router } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';
import FilterInput from './FilterInput';
import FilterDropdown from './FilterDropdown';
import { FilterRule } from '@/types/filter';

interface Option {
  label: string;
  value: any;
}

interface FilterConfig {
  label: string;
  field: string;
  operator: string;
  type: 'select' | 'date-range';
  options?: Option[];
}

interface Props {
  routeName: string;
  filters: FilterRule[];
  search?: string;
  config: FilterConfig[];
}

export default function FilterBar({ routeName, filters, search = '', config }: Props) {
  const [tokens, setTokens] = useState<FilterRule[]>(filters || []);
  const [input, setInput] = useState(search ?? '');
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => setTokens(filters || []), [filters]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function sync(nextTokens = tokens, nextSearch = input) {
    router.post(
      route(routeName),
      { filters: nextTokens, search: nextSearch },
      { preserveState: true }
    );
  }

  function removeToken(field: string) {
    const next = tokens.filter(t => t.field !== field);
    setTokens(next);
    sync(next);
  }

  function handleValueChange(opt: Option, filter: FilterConfig) {
    const next = tokens.filter(t => t.field !== filter.field);
    next.push({
      field: filter.field,
      operator: filter.operator,
      value: opt.value,
      label: filter.label,
      display: opt.label,
    });
    setTokens(next);
    sync(next);
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-3xl">
      <FilterInput
        tokens={tokens.map(t => ({
          field: t.field,
          label: t.label || t.field,
          display: t.display ?? String(t.value),
        }))}
        value={input ?? ''}
        open={open}
        onChange={v => setInput(v)}
        onRemoveToken={removeToken}
        onKeyDown={e => {
          if (e.key === 'Enter') sync();
        }}
        onToggleDropdown={() => setOpen(o => !o)}
      />

      {open && (
        <FilterDropdown
          visible={open}
          filters={config}
          query={input ?? ''}
          onSelectValue={handleValueChange}
        />
      )}
    </div>
  );
}
