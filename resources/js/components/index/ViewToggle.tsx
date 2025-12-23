import { forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Columns, LayoutList } from 'lucide-react';

type Props = {
  view: 'list' | 'kanban';
  onChange: (view: 'list' | 'kanban') => void;
};

const ToggleButton = forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  (props, ref) => <Button {...props} ref={ref} />
);

export default function ViewToggle({ view, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {/* List view */}
      <Tooltip>
        <TooltipTrigger asChild>
          <ToggleButton
            size="icon"
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => onChange('list')}
          >
            <LayoutList className="h-4 w-4" />
          </ToggleButton>
        </TooltipTrigger>
        <TooltipContent>List View</TooltipContent>
      </Tooltip>

      {/* Kanban view */}
      <Tooltip>
        <TooltipTrigger asChild>
          <ToggleButton
            size="icon"
            variant={view === 'kanban' ? 'default' : 'outline'}
            onClick={() => onChange('kanban')}
          >
            <Columns className="h-4 w-4" />
          </ToggleButton>
        </TooltipTrigger>
        <TooltipContent>Kanban View</TooltipContent>
      </Tooltip>
    </div>
  );
}
