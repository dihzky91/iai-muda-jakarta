'use client';

import { Clock, MapPin, Users, Globe } from 'lucide-react';
import { COLOR_CLASSES, resolveColor, type CalendarEvent, type CalendarVariant } from './types';

type Props = {
  event: CalendarEvent;
  variant?: CalendarVariant;
  size?: 'xs' | 'sm' | 'md';
  showTime?: boolean;
  onClick?: (e: CalendarEvent) => void;
};

/**
 * Chip kecil yang merepresentasikan event di dalam cell grid.
 * Multi-day event otomatis tampil dengan strip border di sisi kiri.
 */
export default function EventChip({
  event,
  variant = 'public',
  size = 'xs',
  showTime = true,
  onClick,
}: Props) {
  const colorKey = resolveColor(event.color);
  const c = COLOR_CLASSES[colorKey];

  // Untuk event internal, gunakan purple sebagai default override visual
  // (warna di DB tetap dipakai, tapi ikon berbeda untuk varian)
  const isInternal = event.eventType === 'internal';

  const sizeClass =
    size === 'md'
      ? 'text-sm px-2.5 py-1.5'
      : size === 'sm'
      ? 'text-xs px-2 py-1'
      : 'text-[10px] px-1.5 py-0.5';

  const isMultiDay = event.endDate && event.endDate !== event.startDate;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(event);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={event.title}
      className={[
        'group relative w-full text-left rounded-md truncate',
        'border transition-all',
        c.bgSoft,
        c.text,
        c.border,
        'hover:shadow-sm hover:scale-[1.02]',
        sizeClass,
        'flex items-center gap-1',
        isMultiDay ? 'border-l-4' : '',
      ].join(' ')}
    >
      {/* Dot warna */}
      <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${c.dot}`} />

      {/* Ikon tipe (opsional, untuk membedakan internal vs public di ukuran sm ke atas) */}
      {size !== 'xs' && (
        <span className="shrink-0 opacity-80">
          {isInternal ? <Users className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
        </span>
      )}

      <span className="truncate font-semibold">{event.title}</span>

      {showTime && !event.allDay && event.time && (
        <span className="shrink-0 opacity-70 hidden sm:inline">
          {event.time}
        </span>
      )}

      {event.allDay && (
        <span className="shrink-0 text-[9px] font-bold uppercase opacity-70">
          All
        </span>
      )}
    </button>
  );
}
