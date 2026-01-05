import { components } from 'react-select';
import { Plus } from 'lucide-react';

export default function OdooMenuList(props) {
  const { children, selectProps } = props;
  const search = selectProps.inputValue;

  return (
    <components.MenuList {...props}>
      {children}

      {search && (
        <div className="border-t mt-1 pt-1 text-sm">
          <div
            className="px-3 py-2 cursor-pointer hover:bg-muted flex items-center gap-2"
            onClick={() => selectProps.onQuickCreate(search)}
          >
            <Plus size={14} /> Create "{search}"
          </div>
        </div>
      )}
    </components.MenuList>
  );
}
