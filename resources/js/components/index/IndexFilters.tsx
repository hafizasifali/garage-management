import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FC } from 'react';

type Props = {
  filters: Record<string, any>;
  perPage?: number;
  perPageOptions?: number[];
  onPerPageChange?: (value: number) => void;
  onChange: (key: string, value: any) => void;
  searchPlaceholder: string;
};

const IndexFilters: FC<Props> = ({
  filters,
  perPage = 10,
  perPageOptions = [10, 25, 50, 100],
  onPerPageChange,
  onChange,
  searchPlaceholder='Search..'
}) => {
  return (
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          {/* Left side: Search */}
          <Input
              placeholder={searchPlaceholder}
              defaultValue={filters?.search || ''}
              onChange={(e) => onChange('search', e.target.value)}
              className="w-64"
          />

          {/* Right side: Filters */}
          <div className="flex items-center gap-2">
              {/* Per-page selector */}
              {onPerPageChange && (
                  <Select
                      value={String(perPage)}
                      onValueChange={(val) => onPerPageChange(Number(val))}
                  >
                      <SelectTrigger className="w-32">
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          {perPageOptions.map((opt) => (
                              <SelectItem key={opt} value={String(opt)}>
                                  {opt} per page
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              )}
          </div>
      </div>
  );
};

export default IndexFilters;
