import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
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
  routeName: string; // 'orders.filter'
  filters: FilterRule[];
  search?: string;
  config: FilterConfig[];
    placeholder?: string;
}

export default function FilterBar({
  routeName,
  filters,
  search = '',
  config,
placeholder = 'Search or add filter...',
}: Props) {
  const [tokens, setTokens] = useState<FilterRule[]>(filters || []);
  const [input, setInput] = useState(search ?? '');
  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterConfig | null>(null);

  useEffect(() => setTokens(filters || []), [filters]);

function sync(nextTokens = tokens, nextSearch = input) {
    router.post(
        route(routeName), // <-- post to filter route
        { filters: nextTokens, search: nextSearch },
        { preserveState: true }
    );
}


  function removeToken(field: string) {
    const next = tokens.filter(t => t.field !== field);
    setTokens(next);
    sync(next);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !input && tokens.length) {
      removeToken(tokens[tokens.length - 1].field);
    }

    if (e.key === 'Enter') {
      sync();
      setOpen(false);
    }
  }

  function pickFilter(filter: FilterConfig) {
    setActiveFilter(filter);
  }

  function pickValue(opt: Option) {
    if (!activeFilter) return;

    const next = tokens.filter(t => t.field !== activeFilter.field);
    next.push({
      field: activeFilter.field,
      operator: activeFilter.operator,
      value: opt.value,
      label: activeFilter.label,
      display: opt.label,
    });

    setTokens(next);
    setActiveFilter(null);
    setInput('');
    setOpen(false);
    sync(next);
  }

  return (
    <div className="relative w-full max-w-3xl">
      <FilterInput
        tokens={tokens.map(t => ({
          field: t.field,
          label: t.label || t.field,
          display: t.display ?? String(t.value),
        }))}
        placeholder={placeholder}
        value={input ?? ''}
        open={open}
        onChange={v => {
          setInput(v);
          setOpen(true);
        }}
        onRemoveToken={removeToken}
        onKeyDown={handleKeyDown}
        onToggleDropdown={() => setOpen(o => !o)}
      />

      <FilterDropdown
        visible={open}
        filters={config}
        activeFilter={activeFilter}
        query={input ?? ''}
        onSelectFilter={pickFilter}
        onSelectValue={pickValue}
      />
    </div>
  );
}
