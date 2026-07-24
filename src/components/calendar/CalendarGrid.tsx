'use client';

import { useMemo, useState } from 'react';
import { Plus, CalendarDays, Loader2 } from 'lucide-react';
import CalendarToolbar from './CalendarToolbar';
import EventChip from './EventChip';
import {
  DAY_NAMES_ID,
  distributeEvents,
  generateMonthGrid,
  listEventsInMonth,
  parseDate,
  shiftMonth,
} from './utils';
import type { CalendarEvent, CalendarVariant, CalendarView } from './types';

type Props = {
  events: CalendarEvent[];
  variant: CalendarVariant;
  loading?: boolean;
  initialView?: CalendarView;
  initialDate?: Date;
  onEventClick?: (e: CalendarEvent) => void;
  onDayClick?: (ymd: string) => void;        // publik/portal
  onAddEvent?: (ymd: string) => void;        // admin
  className?: string;
};

/**
 * Komponen reusable untuk kalender bulanan + daftar.
 *
 * Dipakai di:
 * - Halaman publik /calendar
 * - Halaman portal /portal/calendar
 * - Mode calendar di AdminCMS > EventsManager (variant="admin")
 */
export default function CalendarGrid({
  events,
  variant,
  loading = false,
  initialView = 'month',
  initialDate,
  onEventClick,
  onDayClick,
  onAddEvent,
  className = '',
}: Props) {
  const today = initialDate ?? new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView] = useState<CalendarView>(initialView);

  const cells = useMemo(() => {
    const base = generateMonthGrid(year, month, today);
    return distributeEvents(base, events);
  }, [year, month, events, today]);

  const listEvents = useMemo(
    () => listEventsInMonth(events, year, month),
    [events, year, month],
  );

  const totalThisMonth = listEvents.length;

  const handlePrev = () => {
    const next = shiftMonth(year, month, -1);
    setYear(next.year);
    setMonth(next.month);
  };

  const handleNext = () => {
    const next = shiftMonth(year, month, 1);
    setYear(next.year);
    setMonth(next.month);
  };

  const handleToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  return (
    <div className={`w-full ${className}`}>
      <CalendarToolbar
        year={year}
        month={month}
        view={view}
        onViewChange={setView}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onAdd={onAddEvent}
        scope={variant}
        totalEvents={totalThisMonth}
      />

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500 font-medium text-sm bg-white rounded-2xl border border-slate-200">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <span>Memuat data kalender...</span>
        </div>
      ) : view === 'month' ? (
        <MonthView
          cells={cells}
          variant={variant}
          onEventClick={onEventClick}
          onDayClick={onDayClick}
          onAddEvent={onAddEvent}
        />
      ) : (
        <ListView events={listEvents} variant={variant} onEventClick={onEventClick} />
      )}
    </div>
  );
}

/* -------------------- Month View -------------------- */

function MonthView({
  cells,
  variant,
  onEventClick,
  onDayClick,
  onAddEvent,
}: {
  cells: ReturnType<typeof distributeEvents>;
  variant: CalendarVariant;
  onEventClick?: (e: CalendarEvent) => void;
  onDayClick?: (ymd: string) => void;
  onAddEvent?: (ymd: string) => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header hari */}
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
        {DAY_NAMES_ID.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[11px] font-extrabold text-slate-500 uppercase tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid cell */}
      <div className="grid grid-cols-7">
        {cells.map((cell) => {
          const maxChips = cell.events.length;
          const visible = cell.events.slice(0, 3);
          const hiddenCount = Math.max(0, maxChips - visible.length);

          return (
            <div
              key={cell.ymd}
              className={[
                'relative min-h-[110px] sm:min-h-[120px] border-b border-r border-slate-100 p-1.5',
                'flex flex-col gap-1 group',
                cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/50',
                onDayClick || onAddEvent ? 'cursor-pointer hover:bg-blue-50/30 transition-colors' : '',
              ].join(' ')}
              onClick={() => {
                onDayClick?.(cell.ymd);
                if (variant === 'admin' && onAddEvent && cell.events.length === 0) {
                  onAddEvent(cell.ymd);
                }
              }}
            >
              {/* Tanggal */}
              <div className="flex items-center justify-between">
                <span
                  className={[
                    'inline-flex items-center justify-center text-[11px] font-bold w-6 h-6 rounded-full',
                    cell.isToday
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : cell.isCurrentMonth
                      ? 'text-slate-700'
                      : 'text-slate-400',
                  ].join(' ')}
                >
                  {cell.date.getDate()}
                </span>

                {variant === 'admin' && onAddEvent && cell.isCurrentMonth && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddEvent(cell.ymd);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center w-5 h-5 rounded-md text-blue-600 hover:bg-blue-100"
                    title="Tambah acara di tanggal ini"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Chips event */}
              <div className="flex flex-col gap-0.5 flex-1 overflow-hidden">
                {visible.map((ev) => (
                  <EventChip
                    key={`${ev.id}-${cell.ymd}`}
                    event={ev}
                    variant={variant}
                    size="xs"
                    onClick={onEventClick}
                  />
                ))}
                {hiddenCount > 0 && (
                  <div className="text-[10px] font-bold text-slate-500 px-1.5 py-0.5">
                    +{hiddenCount} lagi
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------- List View -------------------- */

function ListView({
  events,
  variant,
  onEventClick,
}: {
  events: CalendarEvent[];
  variant: CalendarVariant;
  onEventClick?: (e: CalendarEvent) => void;
}) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 mb-4 shadow-sm">
          <CalendarDays className="h-8 w-8" />
        </div>
        <h3 className="text-base font-extrabold text-slate-800">
          Tidak Ada Acara Bulan Ini
        </h3>
        <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
          Belum ada acara yang dijadwalkan. Coba navigasi ke bulan lain atau tambahkan acara baru.
        </p>
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, CalendarEvent[]> = {};
  for (const e of events) {
    const key = e.startDate;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  }

  const dates = Object.keys(grouped).sort();

  return (
    <div className="space-y-3">
      {dates.map((d) => {
        const dateObj = parseDate(d);
        const dayName = DAY_NAMES_ID[(dateObj.getDay() + 6) % 7];
        return (
          <div
            key={d}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-extrabold text-slate-700">
                  {dateObj.getDate()}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {dayName}, {dateObj.getDate()} {dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500">
                    {grouped[d].length} acara
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 space-y-2">
              {grouped[d].map((ev) => (
                <EventRow key={ev.id} event={ev} variant={variant} onClick={onEventClick} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EventRow({
  event,
  variant,
  onClick,
}: {
  event: CalendarEvent;
  variant: CalendarVariant;
  onClick?: (e: CalendarEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all bg-white flex items-start gap-3"
    >
      <div className="shrink-0 w-12 text-center">
        <div className="text-[10px] font-bold text-slate-500 uppercase">
          {event.allDay ? 'All Day' : event.time || '--:--'}
        </div>
        {event.endDate && event.endDate !== event.startDate && (
          <div className="text-[9px] text-slate-400 mt-0.5">s/d {event.endDate}</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-slate-800 truncate">{event.title}</div>
        {event.location && (
          <div className="text-[11px] text-slate-500 mt-0.5 truncate">{event.location}</div>
        )}
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
            event.status === 'upcoming'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : event.status === 'ongoing'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-50 text-slate-600 border border-slate-200'
          }`}>
            {event.status === 'upcoming' ? 'Akan Datang' : event.status === 'ongoing' ? 'Berlangsung' : 'Selesai'}
          </span>
          {event.eventType === 'internal' && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
              Internal
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
