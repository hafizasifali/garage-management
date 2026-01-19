import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  onSelectValue: (opt: Option, filter: FilterConfig) => void;
}

export default function FilterDropdown({
  visible,
  filters,
  query,
  onSelectValue,
}: Props) {
  if (!visible) return null;

  const filteredFilters = filters.filter(f =>
    f.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg p-3 flex flex-col gap-3">
      {filteredFilters.map(filter => (
        <div
          key={filter.field}
          className="flex items-center gap-3 w-full text-sm"
        >
          {/* Label */}
          <span className="w-28 text-muted-foreground whitespace-nowrap">
            {filter.label}
          </span>

          {/* Select */}
          {filter.type === 'select' && (
            <div className="flex-1">
              <Select
                options={filter.options}
                onChange={(opt: any) => onSelectValue(opt, filter)}
                placeholder="Select…"
                classNamePrefix="react-select"
                isClearable
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: base => ({ ...base, zIndex: 9999 }),
                  control: base => ({
                    ...base,
                    minHeight: 34,
                    height: 34,
                  }),
                }}
              />
            </div>
          )}

          {/* Date */}
          {filter.type === 'date' && (
            <div className="flex-1">
              <DatePicker
                selected={null}
                onChange={(date: Date | null) =>
                  onSelectValue(
                    {
                      label: date
                        ? date.toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '',
                      value: date,
                    },
                    filter
                  )
                }
                dateFormat="dd-MMM-yyyy"
                placeholderText="Select date…"
                popperPlacement="bottom-start"
                className="w-full h-[34px] rounded-md border px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
