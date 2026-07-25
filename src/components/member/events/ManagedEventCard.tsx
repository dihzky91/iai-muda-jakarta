'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Users, ArrowRight, Briefcase, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import type { ManagedEvent } from '@/src/types';

interface ManagedEventCardProps {
  event: ManagedEvent;
  variant?: 'grid' | 'list';
}

const STATUS_STYLE: Record<string, { label: string; cls: string; dot: string }> = {
  ongoing: { label: 'Berlangsung', cls: 'bg-emerald-500/90 text-white backdrop-blur-md border border-emerald-400/30', dot: 'bg-emerald-200 animate-ping' },
  upcoming: { label: 'Mendatang', cls: 'bg-amber-500/90 text-white backdrop-blur-md border border-amber-400/30', dot: 'bg-amber-200' },
  completed: { label: 'Selesai', cls: 'bg-slate-800/90 text-slate-200 backdrop-blur-md border border-slate-700/50', dot: 'bg-slate-400' },
};

export default function ManagedEventCard({ event, variant = 'grid' }: ManagedEventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const eventDate = new Date(event.date + 'T00:00:00');
  const statusStyle = STATUS_STYLE[event.status || 'upcoming'] || STATUS_STYLE.upcoming;
  const committeeCount = event.committees?.length || 0;
  const materialCount = event.materials?.length || 0;

  const Wrapper = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>
      {children}
    </div>
  );

  if (variant === 'list') {
    return (
      <Wrapper className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex flex-col items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 leading-none">
              {eventDate.toLocaleDateString('id-ID', { month: 'short' })}
            </span>
            <span className="text-xl font-extrabold leading-none mt-0.5">
              {eventDate.getDate()}
            </span>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full shadow-md backdrop-blur-md ${statusStyle.cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                {statusStyle.label}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full bg-purple-600/90 text-white backdrop-blur-md shadow-md border border-purple-400/30">
                <Users className="h-3 w-3 text-purple-200" /> Internal
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {event.title}
            </h3>

            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              {event.time && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  {event.time}
                </span>
              )}
              {event.location && (
                <span className="flex items-center gap-1 truncate max-w-[240px]">
                  <MapPin className="h-3.5 w-3.5 text-rose-500" />
                  {event.location}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end shrink-0">
          <Link
            href={`/portal/events/${event.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all duration-300 shadow-sm"
          >
            Detail
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300">
      <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <Briefcase className="h-16 w-16 text-blue-300/30" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap z-10">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full shadow-md backdrop-blur-md ${statusStyle.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {statusStyle.label}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full bg-purple-600/90 text-white backdrop-blur-md shadow-md border border-purple-400/30">
            <Users className="h-3 w-3 text-purple-200" /> Internal
          </span>
        </div>

        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md rounded-xl px-3 py-1.5 text-center shadow-lg border border-white/40 z-10 group-hover:scale-105 transition-transform">
          <div className="text-[10px] font-extrabold text-blue-600 uppercase leading-none tracking-wider">
            {eventDate.toLocaleDateString('id-ID', { month: 'short' })}
          </div>
          <div className="text-base font-extrabold text-slate-900 leading-none mt-0.5">
            {eventDate.getDate()}
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col justify-between gap-3 bg-white">
        <div className="space-y-2">
          <h3 className="text-base font-extrabold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
            {event.title}
          </h3>

          <div className="space-y-1 text-xs text-slate-500 font-medium">
            {event.time && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                <span>{event.time} WIB</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>

          {event.committeeRole && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700">
              <Briefcase className="h-3 w-3" />
              Peran: {formatRole(event.committeeRole)}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {committeeCount} panitia
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {materialCount} materi
            </span>
          </div>

          <Link
            href={`/portal/events/${event.id}`}
            className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-600 group-hover:text-blue-700 transition-colors"
          >
            Kelola
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </Wrapper>
  );
}

function formatRole(role: string): string {
  return role
    .replace(/_/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
