'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Search, LayoutGrid, List, RotateCcw, CalendarDays, Shield } from 'lucide-react';
import { MemberLayout } from '@/src/components/member';
import EventCard from '@/src/components/member/events/EventCard';
import type { MemberEvent } from '@/src/types';

export default function InternalEventsPage() {
  const [events, setEvents] = useState<MemberEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberInfo, setMemberInfo] = useState<{ isAlumni: boolean; canSeeAllInternal: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchInternalEvents();
  }, []);

  const fetchInternalEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/member/events/internal');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memuat event internal');
      }

      setEvents(data.events || []);
      setMemberInfo(data.memberInfo || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
      );
    });
  }, [events, searchQuery, statusFilter]);

  const upcoming = filtered.filter(e => e.status !== 'completed');
  const completed = filtered.filter(e => e.status === 'completed');

  return (
    <MemberLayout>
      <div className="space-y-6 pb-12">
        {/* Header Banner */}
        <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-xl shadow-blue-900/10">
          <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <Link
                  href="/portal/events"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition cursor-pointer"
                  title="Kembali ke Portal Events"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold tracking-wider text-blue-200 uppercase border border-white/10">
                  <Users className="w-3.5 h-3.5 text-purple-300" />
                  <span>Pengurus Internal</span>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                Event Internal
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                Acara khusus pengurus aktif. Silakan konfirmasi kehadiran melalui fitur RSVP.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center gap-3 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold leading-none text-white">{events.length}</div>
                  <div className="text-[11px] font-medium text-blue-100 mt-1">Event Internal</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alumni Notice */}
        {memberInfo?.isAlumni && (
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-start gap-3">
            <Shield className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-purple-900">Mode Alumni</p>
              <p className="text-[11px] text-purple-700 mt-0.5">
                Anda melihat event internal yang diizinkan untuk alumni. Beberapa event internal pengurus aktif mungkin tidak ditampilkan.
              </p>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-md shadow-slate-200/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari event internal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-between md:justify-end">
            {/* Status Filter Pills */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <FilterPill label="Semua" active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} color="blue" />
              <FilterPill label="Upcoming" active={statusFilter === 'upcoming'} onClick={() => setStatusFilter('upcoming')} color="amber" />
              <FilterPill label="Berlangsung" active={statusFilter === 'ongoing'} onClick={() => setStatusFilter('ongoing')} color="emerald" />
              <FilterPill label="Selesai" active={statusFilter === 'completed'} onClick={() => setStatusFilter('completed')} color="slate" />
            </div>

            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            )}

            <div className="flex items-center gap-0.5 p-1 bg-slate-100 rounded-xl border border-slate-200/60">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan Grid"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan List"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4 py-8">
            <div className="flex items-center justify-center gap-2 text-slate-500 font-medium text-sm">
              <div className="h-6 w-6 border-2 border-purple-500/30 border-t-purple-600 rounded-full animate-spin" />
              <span>Memuat event internal...</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-white border border-slate-200/60 animate-pulse p-4 space-y-3">
                  <div className="h-32 rounded-xl bg-slate-100" />
                  <div className="h-4 w-3/4 bg-slate-100 rounded" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-12 px-4 bg-white rounded-3xl border border-dashed border-rose-200 shadow-sm">
            <p className="text-sm font-bold text-rose-600 mb-2">Terjadi Kesalahan</p>
            <p className="text-xs text-slate-500">{error}</p>
            <button
              onClick={fetchInternalEvents}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-12 px-4 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 text-purple-600 mb-4 shadow-sm">
              <CalendarDays className="h-8 w-8" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              {events.length === 0 ? 'Tidak Ada Event Internal' : 'Tidak Ada Event Sesuai Filter'}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
              {events.length === 0
                ? 'Saat ini belum ada acara internal yang tersedia untuk Anda.'
                : 'Coba ubah opsi filter atau kata kunci pencarian Anda.'}
            </p>
          </div>
        )}

        {/* Upcoming Events */}
        {!loading && !error && upcoming.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl border border-purple-200/80 bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  Event Internal Mendatang
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                    {upcoming.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">Konfirmasi kehadiran melalui RSVP</p>
              </div>
            </div>

            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
            }>
              {upcoming.map(event => (
                <EventCard key={event.id} event={event} variant={viewMode} />
              ))}
            </div>
          </section>
        )}

        {/* Completed Events */}
        {!loading && !error && completed.length > 0 && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl border border-slate-200/80 bg-slate-100 text-slate-600 flex items-center justify-center shadow-sm">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  Arsip Event Internal
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {completed.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">Histori acara internal yang telah selesai</p>
              </div>
            </div>

            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
            }>
              {completed.map(event => (
                <EventCard key={event.id} event={event} variant={viewMode} />
              ))}
            </div>
          </section>
        )}
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
  const activeClass = {
    blue: 'bg-blue-600 text-white shadow-sm shadow-blue-500/20',
    emerald: 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20',
    purple: 'bg-purple-600 text-white shadow-sm shadow-purple-500/20',
    amber: 'bg-amber-500 text-white shadow-sm shadow-amber-500/20',
    slate: 'bg-slate-800 text-white shadow-sm shadow-slate-700/20',
  }[color];

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all duration-200 ${
        active
          ? activeClass
          : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
      }`}
    >
      {label}
    </button>
  );
}
