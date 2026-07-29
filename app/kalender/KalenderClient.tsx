'use client';

/**
 * Bagian interaktif halaman /kalender.
 *
 * Data event diterima sebagai props dari server component (`page.tsx`),
 * BUKAN di-fetch di client — jadi halaman ini ikut ter-cache ISR 5 menit
 * dan tidak memicu query DB per pengunjung.
 */

import { Calendar, ArrowRight } from 'lucide-react';
import { CalendarGrid, type CalendarEvent } from '@/src/components/calendar';
import Link from 'next/link';

export default function KalenderClient({ events }: { events: CalendarEvent[] }) {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Kalender Acara IAI Muda
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Lihat agenda acara dalam tampilan kalender bulanan. Klik pada event untuk melihat detail dan melakukan pendaftaran.
          </p>
        </div>

        {/* Calendar Stats */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-700">
              {events.length} Total Acara
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700">
              {events.filter((e) => e.status === 'upcoming').length} Akan Datang
            </span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
          <CalendarGrid
            events={events}
            variant="public"
            loading={false}
          />
        </div>

        {/* Quick Link */}
        <div className="text-center">
          <Link
            href="/acara"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            Lihat Tampilan Daftar Lengkap
          </Link>
        </div>
      </main>
    </div>
  );
}
