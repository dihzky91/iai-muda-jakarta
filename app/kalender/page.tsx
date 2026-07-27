'use client';

/**
 * Halaman kalender - client component karena CalendarGrid memerlukan interaktivitas.
 * Data di-fetch di client side untuk mendukung interaksi kalender.
 */

import { useState, useEffect } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { CalendarGrid, type CalendarEvent } from '@/src/components/calendar';
import Link from 'next/link';
import type { Metadata } from 'next';

export default function KalenderPage() {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/calendar/events?scope=public')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setCalendarEvents(data.data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch calendar events:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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
              {calendarEvents.length} Total Acara
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700">
              {calendarEvents.filter((e) => e.status === 'upcoming').length} Akan Datang
            </span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
          <CalendarGrid
            events={calendarEvents}
            variant="public"
            loading={loading}
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
