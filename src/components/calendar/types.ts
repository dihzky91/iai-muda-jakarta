import type { CalendarEventType } from '@/app/api/calendar/events/route';

/**
 * Re-export tipe untuk konsistensi seluruh komponen kalender.
 * FE tidak perlu import langsung dari route.ts (best practice boundary).
 */
export type CalendarEvent = CalendarEventType;

export type CalendarVariant = 'public' | 'admin' | 'member';

export type CalendarView = 'month' | 'list';

export type CalendarColor =
  | 'blue'
  | 'emerald'
  | 'purple'
  | 'amber'
  | 'slate'
  | 'rose';

export const CALENDAR_COLORS: CalendarColor[] = [
  'blue',
  'emerald',
  'purple',
  'amber',
  'slate',
  'rose',
];

/**
 * Map warna → kelas Tailwind (chip + text + border)
 * Konsisten dengan palette yang dipakai di project (Header, MemberLayout, dll).
 */
export const COLOR_CLASSES: Record<
  CalendarColor,
  { bg: string; bgSoft: string; text: string; border: string; dot: string }
> = {
  blue: {
    bg: 'bg-blue-600',
    bgSoft: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  emerald: {
    bg: 'bg-emerald-600',
    bgSoft: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  purple: {
    bg: 'bg-purple-600',
    bgSoft: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  amber: {
    bg: 'bg-amber-500',
    bgSoft: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  slate: {
    bg: 'bg-slate-600',
    bgSoft: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-500',
  },
  rose: {
    bg: 'bg-rose-600',
    bgSoft: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
};

/** Default warna jika field `color` di DB null/kosong. */
export function resolveColor(c?: string | null): CalendarColor {
  if (c && (CALENDAR_COLORS as string[]).includes(c)) return c as CalendarColor;
  return 'blue';
}
