'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, Search, CalendarDays, Users, Globe, ChevronRight, Sparkles, Filter, LayoutGrid, List, RotateCcw, CheckCircle2, X } from 'lucide-react';
import { MemberLayout } from '@/src/components/member';
import EventCard from '@/src/components/member/events/EventCard';
import type { MemberEvent } from '@/src/types';

export default function MemberEventsPage() {
  const [events, setEvents] = useState<MemberEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'public' | 'internal'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('upcoming');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/member/events');
      const data = await res.json();
      if (data.success) setEvents(data.data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (typeFilter !== 'all' && e.eventType !== typeFilter) return false;
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [events, searchQuery, typeFilter, statusFilter]);

  // Split filtered into sections
  const internalUpcoming = filtered.filter(e => e.eventType === 'internal' && e.status !== 'completed');
  const publicUpcoming = filtered.filter(e => e.eventType !== 'internal' && e.status !== 'completed');
  const completed = filtered.filter(e => e.status === 'completed');

  const hasActiveFilters = searchQuery !== '' || typeFilter !== 'all' || statusFilter !== 'upcoming';

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('upcoming');
  };

  return (
    <MemberLayout>
      <div className="space-y-6 pb-12">
        {/* Dynamic Gradient Hero Header */}
      <section 
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-9 text-white shadow-xl shadow-blue-600/20 border border-blue-300/40"
        style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)',
        }}
      >
        {/* Ambient Light Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-900/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-300/10 rounded-full blur-2xl pointer-events-none" />

        {/* Geometric Background Mesh */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-md shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Portal Kegiatan</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/25 text-emerald-100 border border-emerald-300/40 backdrop-blur-md shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                <span>IAI Muda DKI Jakarta</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
              Agenda & Acara Organisasi 📅
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
              Jelajahi agenda kegiatan publik, seminar, workshop, serta RSVP acara khusus internal pengurus IAI Muda DKI Jakarta.
            </p>
          </div>

          {/* Quick Counter Badges */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            <div className="flex-1 sm:flex-none p-3.5 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md flex items-center gap-3 shadow-lg min-w-[120px]">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold leading-none text-white">{events.length}</div>
                <div className="text-[11px] font-medium text-blue-100 mt-1">Total Acara</div>
              </div>
            </div>

            <div className="flex-1 sm:flex-none p-3.5 rounded-2xl bg-purple-500/25 border border-purple-300/40 backdrop-blur-md flex items-center gap-3 shadow-lg min-w-[120px]">
              <div className="w-10 h-10 rounded-xl bg-purple-400/30 flex items-center justify-center text-purple-100 shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold leading-none text-white">
                  {events.filter(e => e.eventType === 'internal').length}
                </div>
                <div className="text-[11px] font-medium text-purple-200 mt-1">Acara Internal</div>
              </div>
            </div>

            <div className="flex-1 sm:flex-none p-3.5 rounded-2xl bg-emerald-500/25 border border-emerald-300/40 backdrop-blur-md flex items-center gap-3 shadow-lg min-w-[120px]">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/30 flex items-center justify-center text-emerald-100 shrink-0">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold leading-none text-white">
                  {events.filter(e => e.eventType !== 'internal').length}
                </div>
                <div className="text-[11px] font-medium text-emerald-200 mt-1">Acara Publik</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Interactive Search & Filter Controls Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-md shadow-slate-200/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul, topik, atau lokasi acara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2 justify-between md:justify-end">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <FilterPill label="Semua Tipe" active={typeFilter === 'all'} onClick={() => setTypeFilter('all')} />
            <FilterPill label="Publik" active={typeFilter === 'public'} onClick={() => setTypeFilter('public')} color="emerald" />
            <FilterPill label="Internal" active={typeFilter === 'internal'} onClick={() => setTypeFilter('internal')} color="purple" />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <FilterPill label="Upcoming" active={statusFilter === 'upcoming'} onClick={() => setStatusFilter('upcoming')} color="amber" />
            <FilterPill label="Berlangsung" active={statusFilter === 'ongoing'} onClick={() => setStatusFilter('ongoing')} color="emerald" />
            <FilterPill label="Selesai" active={statusFilter === 'completed'} onClick={() => setStatusFilter('completed')} color="slate" />
          </div>

          {/* Reset Filter Button */}
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

          {/* Grid vs List View Mode Toggle */}
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

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 py-8">
          <div className="flex items-center justify-center gap-2 text-slate-500 font-medium text-sm">
            <div className="h-6 w-6 border-2 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
            <span>Memuat data agenda & acara...</span>
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

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <EmptyState
          onReset={handleResetFilters}
          hasEvents={events.length > 0}
        />
      )}

      {/* Section: Acara Internal (Upcoming & Ongoing) */}
      {!loading && internalUpcoming.length > 0 && (
        <EventSection
          icon={Users}
          iconColor="purple"
          title="Acara Internal Organisasi"
          subtitle="Khusus pengurus aktif · Konfirmasi kehadiran via portal"
          events={internalUpcoming}
          viewMode={viewMode}
        />
      )}

      {/* Section: Acara Publik (Upcoming & Ongoing) */}
      {!loading && publicUpcoming.length > 0 && (
        <EventSection
          icon={Globe}
          iconColor="emerald"
          title="Acara & Webinar Publik"
          subtitle="Terbuka untuk umum & akademisi · Pendaftaran via link resmi"
          events={publicUpcoming}
          viewMode={viewMode}
        />
      )}

      {/* Section: Acara Selesai */}
      {!loading && completed.length > 0 && (
        <section className="pt-2">
          <details className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:border-slate-300 transition-all">
            <summary className="px-5 py-4 cursor-pointer flex items-center justify-between hover:bg-slate-50/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Arsip Acara Selesai
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {completed.length}
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-500">Lihat histori kegiatan dan seminar yang telah diselenggarakan</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 group-open:rotate-90 transition-transform duration-200" />
            </summary>
            <div className={`p-4 border-t border-slate-100 ${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
                : 'space-y-3'
            }`}>
              {completed.map(event => (
                <EventCard key={event.id} event={event} variant={viewMode} />
              ))}
            </div>
          </details>
        </section>
      )}
    </div>
    </MemberLayout>
  );
}

function EventSection({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  events,
  viewMode,
}: {
  icon: any;
  iconColor: 'purple' | 'emerald';
  title: string;
  subtitle: string;
  events: MemberEvent[];
  viewMode: 'grid' | 'list';
}) {
  const colorClass = {
    purple: { bg: 'bg-purple-50 text-purple-600 border-purple-200/80', badge: 'bg-purple-100 text-purple-700 border-purple-200' },
    emerald: { bg: 'bg-emerald-50 text-emerald-600 border-emerald-200/80', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  }[iconColor];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl border ${colorClass.bg} flex items-center justify-center shadow-sm`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              {title}
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${colorClass.badge}`}>
                {events.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-3'
      }>
        {events.map(event => (
          <EventCard key={event.id} event={event} variant={viewMode} />
        ))}
      </div>
    </section>
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

function EmptyState({ onReset, hasEvents }: { onReset: () => void; hasEvents: boolean }) {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 mb-4 shadow-sm">
        <CalendarDays className="h-8 w-8" />
      </div>
      <h3 className="text-base font-extrabold text-slate-800">
        {hasEvents ? 'Tidak Ada Acara Sesuai Filter' : 'Belum Ada Acara Dipublikasikan'}
      </h3>
      <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
        {hasEvents
          ? 'Coba ubah opsi filter atau kata kunci pencarian Anda untuk melihat acara lainnya.'
          : 'Acara dan webinar organisasi akan ditampilkan di sini setelah dipublikasikan oleh administrator.'}
      </p>
      {hasEvents && (
        <button
          onClick={onReset}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors shadow-sm"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Semua Filter
        </button>
      )}
    </div>
  );
}

