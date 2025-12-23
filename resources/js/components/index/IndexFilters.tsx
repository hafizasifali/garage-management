import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FC } from 'react';

type Props = {
  filters: Record<string, any>;
  perPage?: number;
  perPageOptions?: number[];
  onPerPageChange?: (value: number) => void;
  onChange: (key: string, value: any) => void;
};

const IndexFilters: FC<Props> = ({
  filters,
  perPage = 10,
  perPageOptions = [10, 25, 50, 100],
  onPerPageChange,
  onChange,
}) => {
  return (
    <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
      {/* Left side: Search */}
      <Input
        placeholder="Search…"
        defaultValue={filters?.search || ''}
        onChange={(e) => onChange('search', e.target.value)}
        className="w-64"
      />

      {/* Right side: Filters */}
      <div className="flex items-center gap-2">
        {/* Active filter */}
        <Select
          value={filters?.active ?? 'all'}
          onValueChange={(val) => onChange('active', val === 'all' ? '' : val)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="1">Active</SelectItem>
            <SelectItem value="0">Inactive</SelectItem>
          </SelectContent>
        </Select>

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
