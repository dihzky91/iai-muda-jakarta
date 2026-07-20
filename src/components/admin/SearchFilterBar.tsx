'use client';

import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  label: string;
  key: string;
}

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  onReset?: () => void;
  showChips?: boolean;
}

export default function SearchFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Cari...',
  filters = [],
  onReset,
  showChips = true,
}: SearchFilterBarProps) {
  const hasActiveFilters = search.trim() || filters.some(f => f.value !== 'all' && f.value !== '');

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2.5 p-0.5 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              aria-label="Bersihkan pencarian"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {filters.map((filter) => (
          <div key={filter.key} className={`flex items-center gap-2 ${showChips ? 'hidden sm:flex' : ''}`}>
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">{filter.label}:</span>
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            >
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        ))}

        {hasActiveFilters && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2.5 text-xs font-bold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>

      {showChips && filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) =>
            filter.options.map((opt) => {
              const isActive = filter.value === opt.value;
              const isDefault = opt.value === 'all' || opt.value === '';
              if (isDefault) return null;
              return (
                <button
                  key={`${filter.key}-${opt.value}`}
                  type="button"
                  onClick={() => filter.onChange(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Highlight matching substring inside a text node.
 */
export function HighlightText({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <mark key={i} className="bg-amber-200 text-slate-900 rounded px-0.5 font-semibold">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
