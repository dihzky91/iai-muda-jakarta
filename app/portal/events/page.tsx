'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, Search, CalendarDays, Users, Globe, ChevronRight, Sparkles, Filter } from 'lucide-react';
import EventCard from '@/src/components/member/events/EventCard';
import type { MemberEvent } from '@/src/types';

export default function MemberEventsPage() {
  const [events, setEvents] = useState<MemberEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'public' | 'internal'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('upcoming');

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

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">Agenda & Acara</h1>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles className="h-2.5 w-2.5" /> Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Lihat agenda publik & RSVP untuk acara internal organisasi.</p>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-slate-500">
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50">
            <span className="text-slate-700">{events.length}</span> total
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 text-purple-700">
            <Users className="h-3 w-3" />
            <span>{events.filter(e => e.eventType === 'internal').length}</span> internal
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700">
            <Globe className="h-3 w-3" />
            <span>{events.filter(e => e.eventType !== 'internal').length}</span> publik
          </div>
        </div>
      </div>

      {/* Compact Search + Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari acara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg bg-white border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <FilterPill label="Semua" active={typeFilter === 'all'} onClick={() => setTypeFilter('all')} />
          <FilterPill label="Publik" active={typeFilter === 'public'} onClick={() => setTypeFilter('public')} color="emerald" />
          <FilterPill label="Internal" active={typeFilter === 'internal'} onClick={() => setTypeFilter('internal')} color="purple" />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <FilterPill label="Upcoming" active={statusFilter === 'upcoming'} onClick={() => setStatusFilter('upcoming')} color="amber" />
          <FilterPill label="Berlangsung" active={statusFilter === 'ongoing'} onClick={() => setStatusFilter('ongoing')} color="emerald" />
          <FilterPill label="Selesai" active={statusFilter === 'completed'} onClick={() => setStatusFilter('completed')} color="slate" />
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="text-[10px] font-bold text-slate-500 hover:text-rose-600 underline px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-7 w-7 border-2 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 mt-2">Memuat acara...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <EmptyState
          onAddEvent={() => alert('Untuk membuat event, hubungi admin CMS di /admin/events.')}
          hasEvents={events.length > 0}
        />
      )}

      {/* Section: Internal (Upcoming) */}
      {!loading && internalUpcoming.length > 0 && (
        <EventSection
          icon={Users}
          iconColor="purple"
          title="Acara Internal"
          subtitle="Hanya pengurus · RSVP via portal"
          events={internalUpcoming}
          seeAllHref="/portal/events?type=internal"
          currentFilter={typeFilter}
        />
      )}

      {/* Section: Publik (Upcoming) */}
      {!loading && publicUpcoming.length > 0 && (
        <EventSection
          icon={Globe}
          iconColor="emerald"
          title="Acara Publik"
          subtitle="Terbuka untuk umum · Pendaftaran via Google Form"
          events={publicUpcoming}
          seeAllHref="/portal/events?type=public"
          currentFilter={typeFilter}
        />
      )}

      {/* Section: Completed */}
      {!loading && completed.length > 0 && (
        <details className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <summary className="px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-bold text-slate-700">Acara Selesai</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {completed.length}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </summary>
          <div className="p-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {completed.slice(0, 6).map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          {completed.length > 6 && (
            <div className="p-3 text-center border-t border-slate-100">
              <span className="text-[10px] text-slate-500">+{completed.length - 6} acara selesai lainnya</span>
            </div>
          )}
        </details>
      )}
    </div>
  );
}

function EventSection({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  events,
  seeAllHref,
  currentFilter,
}: {
  icon: any;
  iconColor: 'purple' | 'emerald';
  title: string;
  subtitle: string;
  events: MemberEvent[];
  seeAllHref: string;
  currentFilter: 'all' | 'public' | 'internal';
}) {
  const colorClass = {
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
  }[iconColor];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${colorClass.bg} ${colorClass.text} flex items-center justify-center`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              {title}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${colorClass.badge}`}>
                {events.length}
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">{subtitle}</p>
          </div>
        </div>

        {currentFilter === 'all' && events.length > 3 && (
          <Link
            href={seeAllHref}
            className="text-[11px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-0.5"
          >
            Lihat semua <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {events.slice(0, 6).map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}

function FilterPill({ label, active, onClick, color = 'blue' }: { label: string; active: boolean; onClick: () => void; color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'slate' }) {
  const activeClass = {
    blue: 'bg-blue-600 text-white border-blue-600',
    emerald: 'bg-emerald-600 text-white border-emerald-600',
    purple: 'bg-purple-600 text-white border-purple-600',
    amber: 'bg-amber-500 text-white border-amber-500',
    slate: 'bg-slate-700 text-white border-slate-700',
  }[color];

  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md border whitespace-nowrap transition-all ${
        active
          ? activeClass
          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState({ onAddEvent, hasEvents }: { onAddEvent: () => void; hasEvents: boolean }) {
  return (
    <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 mb-3">
        <CalendarDays className="h-7 w-7 text-blue-400" />
      </div>
      <h3 className="text-sm font-bold text-slate-800">
        {hasEvents ? 'Tidak ada acara sesuai filter' : 'Belum ada acara'}
      </h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
        {hasEvents
          ? 'Coba ubah filter atau kata kunci pencarian Anda.'
          : 'Acara akan muncul di sini setelah dipublikasikan oleh admin.'}
      </p>
      {!hasEvents && (
        <button
          onClick={onAddEvent}
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
        >
          <Sparkles className="h-3 w-3" />
          Pelajari cara membuat event
        </button>
      )}
    </div>
  );
}

// Local CheckCircle2 replacement (avoid import)
function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
