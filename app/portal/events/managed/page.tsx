'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Search, LayoutGrid, List, RotateCcw, CalendarDays } from 'lucide-react';
import { MemberLayout } from '@/src/components/member';
import ManagedEventCard from '@/src/components/member/events/ManagedEventCard';
import type { ManagedEvent } from '@/src/types';

export default function ManagedEventsPage() {
  const [events, setEvents] = useState<ManagedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchManagedEvents();
  }, []);

  const fetchManagedEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/member/events/managed');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memuat event yang dikelola');
      }

      setEvents(data.events || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q)
    );
  }, [events, searchQuery]);

  return (
    <MemberLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/portal/events"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-slate-600 hover:text-blue-600 hover:border-blue-300 shadow-sm transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Kembali
              </Link>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Committee Only
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
              Event yang Saya Kelola
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Pantau dan kelola acara internal tempat Anda tergabung sebagai panitia.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold leading-none text-slate-900">{events.length}</div>
                <div className="text-[11px] font-medium text-slate-500 mt-1">Event Dikelola</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & View Toggle */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-md shadow-slate-200/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari event yang Anda kelola..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-2 justify-end">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
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
              <div className="h-6 w-6 border-2 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
              <span>Memuat event yang Anda kelola...</span>
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
              onClick={fetchManagedEvents}
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 mb-4 shadow-sm">
              <CalendarDays className="h-8 w-8" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              {events.length === 0 ? 'Belum Ada Event yang Dikelola' : 'Tidak Ada Event Sesuai Pencarian'}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
              {events.length === 0
                ? 'Anda belum ditugaskan sebagai panitia untuk acara apapun. Hubungi admin untuk penugasan.'
                : 'Coba ubah kata kunci pencarian Anda.'}
            </p>
          </div>
        )}

        {/* Events Grid/List */}
        {!loading && !error && filtered.length > 0 && (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'
          }>
            {filtered.map(event => (
              <ManagedEventCard key={event.id} event={event} variant={viewMode} />
            ))}
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
