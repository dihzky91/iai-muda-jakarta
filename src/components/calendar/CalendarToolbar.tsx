'use client';

import { ChevronLeft, ChevronRight, LayoutGrid, List, Calendar as CalIcon, Plus } from 'lucide-react';
import { MONTH_NAMES_ID } from './utils';
import type { CalendarView } from './types';

type Props = {
  year: number;
  month: number;          // 0-11
  view: CalendarView;
  onViewChange: (v: CalendarView) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onAdd?: (ymd: string) => void; // optional, untuk admin
  scope: 'public' | 'admin' | 'member';
  totalEvents: number;
};

export default function CalendarToolbar({
  year,
  month,
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  onAdd,
  scope,
  totalEvents,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
      {/* Left: Nav bulan */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={onPrev}
            className="p-2 hover:bg-slate-50 text-slate-600 transition-colors"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-3 py-1.5 min-w-[140px] text-center">
            <div className="flex items-center justify-center gap-1.5 text-sm font-extrabold text-slate-800">
              <CalIcon className="w-3.5 h-3.5 text-blue-600" />
              {MONTH_NAMES_ID[month]} {year}
            </div>
          </div>

          <button
            type="button"
            onClick={onNext}
            className="p-2 hover:bg-slate-50 text-slate-600 transition-colors"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onToday}
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
        >
          Hari Ini
        </button>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          {totalEvents} acara
        </div>
      </div>

      {/* Right: View toggle + (opsional) Add */}
      <div className="flex items-center gap-2 flex-wrap">
        {scope === 'admin' && onAdd && (
          <button
            type="button"
            onClick={() => onAdd('')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-md hover:shadow-blue-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Acara
          </button>
        )}

        <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60">
          <button
            type="button"
            onClick={() => onViewChange('month')}
            className={`p-1.5 rounded-lg transition-all ${
              view === 'month'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Tampilan Kalender"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('list')}
            className={`p-1.5 rounded-lg transition-all ${
              view === 'list'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Tampilan Daftar"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
