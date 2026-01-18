import { X, ChevronDown } from 'lucide-react';
import { placeholderCSS } from 'node_modules/react-select/dist/declarations/src/components/Placeholder';
import { useRef } from 'react';

interface Token {
  field: string;
  label: string;
  display: string;
}

interface Props {
  tokens: Token[];
  value: string;
  open: boolean;
  onChange: (v: string) => void;
  onRemoveToken: (field: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onToggleDropdown: () => void;
}

export default function FilterInput({
  tokens,
  value,
  open,
  onChange,
  onRemoveToken,
  onKeyDown,
  onToggleDropdown,
    placeholder = 'Search or add filter...',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="flex items-center flex-wrap gap-1 border rounded-lg px-2 py-1 min-h-[42px] bg-background"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Tokens */}
      {tokens.map(t => (
        <span
          key={t.field}
          className="flex items-center gap-1 px-2 py-0.5 bg-muted rounded-md text-sm"
        >
          <span className="font-medium">{t.label}</span>
          <span className="opacity-60">=</span>
          <span>{t.display}</span>
          <button
            onClick={() => onRemoveToken(t.field)}
            className="ml-1 hover:text-destructive"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {/* Input wrapper */}
      <div className="relative flex-1 min-w-[120px]">
        <input
          ref={inputRef}
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={tokens.length ? '' : placeholder}
          className="w-full bg-transparent outline-none text-sm py-1 pr-6"
        />

        {/* Caret INSIDE input */}
        <button
          type="button"
          onClick={onToggleDropdown}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
    </div>
  );
}
