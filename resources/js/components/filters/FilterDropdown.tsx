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
  visible: boolean;
  filters: FilterConfig[];
  query: string;
  activeFilter?: FilterConfig | null;
  onSelectFilter: (filter: FilterConfig) => void;
  onSelectValue: (opt: Option) => void;
}

export default function FilterDropdown({
  visible,
  filters,
  query,
  activeFilter,
  onSelectFilter,
  onSelectValue,
}: Props) {
  if (!visible) return null;

  const filteredFilters = filters.filter(f =>
    f.label.toLowerCase().includes((query ?? '').toLowerCase())
  );

  return (
    <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-md max-h-64 overflow-auto">
      {!activeFilter &&
        filteredFilters.map(filter => (
          <button
            key={filter.field}
            className="flex w-full px-3 py-2 text-left text-sm hover:bg-muted"
            onClick={() => onSelectFilter(filter)}
          >
            {filter.label}
          </button>
        ))}

      {activeFilter &&
        activeFilter.options?.map(opt => (
          <button
            key={opt.value}
            className="flex w-full px-3 py-2 text-left text-sm hover:bg-muted"
            onClick={() => onSelectValue(opt)}
          >
            {opt.label}
          </button>
        ))}
    </div>
  );
}
