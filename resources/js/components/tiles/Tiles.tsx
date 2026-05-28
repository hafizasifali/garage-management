import React from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { FilterRule } from '@/types/filter';
import { Clock, CheckCircle, FileText, CreditCard } from 'lucide-react';

type TileItem = {
  id: string;
  name: string;
  count?: number;
};

interface Props {
  items: TileItem[];
  routeName: string;
  activeFilters?: FilterRule[];
  search?: string;
}

export default function Tiles({ items, routeName, activeFilters = [], search = '' }: Props) {
  const activeState = activeFilters.find((f) => f.field === 'state')?.value ?? null;

  function handleClick(item: TileItem) {
    // Build next filters: remove existing state filter
    const next = activeFilters.filter((f) => f.field !== 'state');

    // Toggle: if clicked already active, remove; otherwise add
    if (activeState !== item.id) {
      next.push({ field: 'state', operator: '=', value: item.id });
    }

  router.post(route(routeName), { filters: next as any, search }, { preserveState: true });
  }
  const pickIcon = (id: string | number) => {
    switch (String(id)) {
      case 'in_progress':
        return { Icon: Clock, bg: 'bg-yellow-100', fg: 'text-yellow-600' };
      case 'completed':
        return { Icon: CheckCircle, bg: 'bg-green-100', fg: 'text-green-600' };
      case 'invoiced':
        return { Icon: FileText, bg: 'bg-indigo-100', fg: 'text-indigo-600' };
      case 'paid':
        return { Icon: CreditCard, bg: 'bg-emerald-100', fg: 'text-emerald-600' };
      default:
        return { Icon: FileText, bg: 'bg-gray-100', fg: 'text-gray-600' };
    }
  };

  return (
    <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((it) => {
        const isActive = String(activeState) === String(it.id);
        const { Icon, bg, fg } = pickIcon(it.id);

        return (
          <button
            key={it.id}
            onClick={() => handleClick(it)}
            aria-pressed={isActive}
            aria-label={`Filter by ${it.name}`}
            className={`group relative flex items-center gap-3 p-3 rounded-lg border transition-shadow duration-150 ease-in-out overflow-hidden ${isActive ? 'ring-2 ring-offset-1 ring-blue-300 shadow-md bg-gradient-to-br from-white to-blue-50' : 'bg-white hover:shadow-lg'}`}
          >
            <div className={`flex-none rounded-lg p-2 ${bg} ${isActive ? 'scale-105' : ''}`}>
              <Icon className={`${fg} h-6 w-6`} />
            </div>

            <div className="flex-1 text-left">
              <div className="text-xs text-gray-500 group-hover:text-gray-600">{it.name}</div>
              <div className="mt-1 text-xl font-semibold text-gray-900">{it.count ?? 0}</div>
            </div>

            <div className="absolute -right-3 -top-3 hidden group-hover:block">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white/60 text-xs text-gray-700 shadow">→</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
