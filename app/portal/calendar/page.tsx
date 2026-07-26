'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Search,
  Sparkles,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { MemberLayout } from '@/src/components/member';
import { CalendarGrid, type CalendarEvent } from '@/src/components/calendar';

type RsvpStatus = 'attending' | 'not_attending' | 'maybe';

type PortalCalendarEvent = CalendarEvent & {
  myRsvpStatus?: RsvpStatus | null;
};

type TypeFilter = 'all' | 'public' | 'internal';
type StatusFilter = 'all' | 'upcoming' | 'ongoing' | 'completed';

export default function PortalCalendarPage() {
  const [events, setEvents] = useState<PortalCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      // Dua request ini tidak saling bergantung. Sebelumnya yang kedua baru
      // dimulai setelah yang pertama selesai, jadi latensinya berurutan.
      // allSettled dipakai supaya kegagalan RSVP tidak ikut menjatuhkan
      // kalender — sama seperti try/catch bersarang sebelumnya.
      const [calendarResult, rsvpResult] = await Promise.allSettled([
        fetch('/api/calendar/events?scope=member').then((r) => r.json()),
        fetch('/api/member/events').then((r) => r.json()),
      ]);

      if (calendarResult.status !== 'fulfilled' || !calendarResult.value?.success) return;

      const rsvpMap = new Map<number, RsvpStatus>();
      if (rsvpResult.status === 'fulfilled' && rsvpResult.value?.success && Array.isArray(rsvpResult.value.data)) {
        for (const e of rsvpResult.value.data) {
          if (e?.id && e?.myRsvpStatus) {
            rsvpMap.set(e.id, e.myRsvpStatus);
          }
        }
      }

      const merged = (calendarResult.value.data as CalendarEvent[]).map((ev) => ({
        ...ev,
        myRsvpStatus: rsvpMap.get(ev.id) ?? null,
      }));
      setEvents(merged);
    } catch (err) {
      console.error('Failed to fetch calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (typeFilter !== 'all' && e.eventType !== typeFilter) return false;
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          (e.location ?? '').toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [events, searchQuery, typeFilter, statusFilter]);

  const hasActiveFilters =
    searchQuery !== '' || typeFilter !== 'all' || statusFilter !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  const handleEventClick = (e: CalendarEvent) => {
    // Navigasi ke detail event portal (existing page)
    if (typeof window !== 'undefined') {
      window.location.href = `/portal/events/${e.id}`;
    }
  };

  return (
    <MemberLayout>
      <div className="space-y-6 pb-12">
        {/* Hero Header — konsisten dengan portal/events/page.tsx */}
        <section
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-9 text-white shadow-xl shadow-blue-600/20 border border-blue-300/40"
          style={{
            background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)',
          }}
        >
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-900/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-300/10 rounded-full blur-2xl pointer-events-none" />

          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-md shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Kalender Organisasi</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/25 text-emerald-100 border border-emerald-300/40 backdrop-blur-md shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  <span>IAI Muda DKI Jakarta</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
                Kalender Acara 📅
              </h1>

              <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
                Lihat agenda publik & internal dalam tampilan kalender bulanan. Klik tanggal atau
                acara untuk melihat detail & konfirmasi kehadiran (RSVP).
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
              <div className="flex-1 sm:flex-none p-3.5 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md flex items-center gap-3 shadow-lg min-w-[120px]">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold leading-none text-white">
                    {events.length}
                  </div>
                  <div className="text-[11px] font-medium text-blue-100 mt-1">Total Acara</div>
                </div>
              </div>

              <div className="flex-1 sm:flex-none p-3.5 rounded-2xl bg-emerald-500/25 border border-emerald-300/40 backdrop-blur-md flex items-center gap-3 shadow-lg min-w-[120px]">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/30 flex items-center justify-center text-emerald-100 shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold leading-none text-white">
                    {events.filter((e) => e.status === 'upcoming').length}
                  </div>
                  <div className="text-[11px] font-medium text-emerald-100 mt-1">Akan Datang</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Filters Bar */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-md shadow-slate-200/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul, lokasi, atau deskripsi acara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tipe Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <FilterPill
                label="Semua"
                active={typeFilter === 'all'}
                onClick={() => setTypeFilter('all')}
                color="blue"
              />
              <FilterPill
                label="Publik"
                active={typeFilter === 'public'}
                onClick={() => setTypeFilter('public')}
                color="emerald"
              />
              <FilterPill
                label="Internal"
                active={typeFilter === 'internal'}
                onClick={() => setTypeFilter('internal')}
                color="purple"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <FilterPill
                label="Semua Status"
                active={statusFilter === 'all'}
                onClick={() => setStatusFilter('all')}
                color="slate"
              />
              <FilterPill
                label="Upcoming"
                active={statusFilter === 'upcoming'}
                onClick={() => setStatusFilter('upcoming')}
                color="amber"
              />
              <FilterPill
                label="Berlangsung"
                active={statusFilter === 'ongoing'}
                onClick={() => setStatusFilter('ongoing')}
                color="emerald"
              />
              <FilterPill
                label="Selesai"
                active={statusFilter === 'completed'}
                onClick={() => setStatusFilter('completed')}
                color="slate"
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                title="Reset Filter"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Link ke daftar list */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan {filtered.length} dari {events.length} acara
          </span>
          <Link
            href="/portal/events"
            className="inline-flex items-center gap-1 text-blue-600 font-bold hover:text-blue-700 transition-colors"
          >
            Lihat tampilan daftar
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Calendar */}
        <CalendarGrid
          events={filtered}
          variant="member"
          loading={loading}
          onEventClick={handleEventClick}
        />
      </div>
    </MemberLayout>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  color = 'blue',
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'slate';
}) {
  const activeClass: Record<string, string> = {
    blue: 'bg-blue-600 text-white shadow-sm shadow-blue-500/20',
    emerald: 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20',
    purple: 'bg-purple-600 text-white shadow-sm shadow-purple-500/20',
    amber: 'bg-amber-500 text-white shadow-sm shadow-amber-500/20',
    slate: 'bg-slate-800 text-white shadow-sm shadow-slate-700/20',
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all duration-200 ${
        active
          ? activeClass[color]
          : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
      }`}
    >
      {label}
    </button>
  );
}
