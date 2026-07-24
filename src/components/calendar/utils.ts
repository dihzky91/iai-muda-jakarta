import type { CalendarEvent } from './types';

/**
 * Utility untuk generate grid kalender bulanan + filter event.
 * Pure function, zero dependency.
 *
 * Catatan: minggu dimulai dari SENIN (standar Indonesia).
 * Jika ingin Minggu, ubah `getDay()` offset.
 */

export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export const DAY_NAMES_ID = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

/** Parse 'YYYY-MM-DD' → Date (lokal midnight). Hindari bug timezone toISOString. */
export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Format Date → 'YYYY-MM-DD' (lokal). */
export function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Cell dalam grid kalender (7 kolom × 6 baris max). */
export type CalendarCell = {
  date: Date;
  ymd: string;          // 'YYYY-MM-DD'
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[]; // event yang dimulai atau melewati tanggal ini
};

/** Bangun grid 6 baris × 7 kolom untuk bulan tertentu. */
export function generateMonthGrid(year: number, month: number, today: Date = new Date()): CalendarCell[] {
  const firstOfMonth = new Date(year, month, 1);
  const startDow = firstOfMonth.getDay(); // 0=Sun ... 6=Sat
  // Geser ke SENIN sebagai hari pertama
  // (Sun=0 → 6, Mon=1 → 0, Tue=2 → 1, ... Sat=6 → 5)
  const offsetFromMonday = (startDow + 6) % 7;

  const gridStart = new Date(year, month, 1 - offsetFromMonday);
  const todayYmd = formatYMD(today);

  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push({
      date: d,
      ymd: formatYMD(d),
      isCurrentMonth: d.getMonth() === month,
      isToday: formatYMD(d) === todayYmd,
      events: [],
    });
  }
  return cells;
}

/**
 * Kembalikan semua event yang "aktif" pada tanggal tertentu (Y-M-D).
 * Mendukung event multi-hari: event aktif dari startDate sampai endDate.
 * Untuk grid, kita assign event ke cell dengan ymd == startDate saja
 * (renderer yang akan menggambar sebagai multi-day span), atau ke setiap
 * cell yang dilalui (bergantung pada strategi renderer).
 */
export function isEventOnDate(event: CalendarEvent, ymd: string): boolean {
  const start = event.startDate;
  const end = event.endDate || event.startDate;
  return ymd >= start && ymd <= end;
}

/** Distribusikan event ke cell yang relevan. */
export function distributeEvents(cells: CalendarCell[], events: CalendarEvent[]): CalendarCell[] {
  return cells.map((cell) => ({
    ...cell,
    events: events.filter((e) => isEventOnDate(e, cell.ymd)),
  }));
}

/** Daftar event terurut untuk view 'list' dalam 1 bulan. */
export function listEventsInMonth(events: CalendarEvent[], year: number, month: number): CalendarEvent[] {
  return events
    .filter((e) => {
      const start = parseDate(e.startDate);
      const end = parseDate(e.endDate || e.startDate);
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      return end >= monthStart && start <= monthEnd;
    })
    .sort((a, b) => {
      const da = a.startDate + (a.time || '');
      const db = b.startDate + (b.time || '');
      return da.localeCompare(db);
    });
}

/** Geser bulan sebesar `delta` (-1 = prev, +1 = next). */
export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

/** Hitung range 1 bulan (YYYY-MM-DD) untuk dipakai fetch API. */
export function monthRange(year: number, month: number): { from: string; to: string } {
  const from = formatYMD(new Date(year, month, 1));
  // hari terakhir bulan ini
  const lastDay = new Date(year, month + 1, 0).getDate();
  const to = formatYMD(new Date(year, month, lastDay));
  return { from, to };
}

/** Locale label "Januari 2026". */
export function formatMonthLabel(year: number, month: number): string {
  return `${MONTH_NAMES_ID[month]} ${year}`;
}
