'use client';

import Link from 'next/link';
import { Calendar, MapPin, Users, Globe, Check, X, HelpCircle, ArrowRight, ExternalLink, Clock, Sparkles } from 'lucide-react';
import type { Event, RsvpStatus } from '@/src/types';

type MemberEvent = Event & { myRsvpStatus?: RsvpStatus | null };

interface EventCardProps {
  event: MemberEvent;
  variant?: 'card' | 'grid' | 'list';
}

const RSVP_BADGE: Record<RsvpStatus, { label: string; cls: string; icon: any }> = {
  attending: { label: 'Hadir', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', icon: Check },
  maybe: { label: 'Mungkin', cls: 'bg-amber-50 text-amber-700 border-amber-200/80', icon: HelpCircle },
  not_attending: { label: 'Tidak Hadir', cls: 'bg-rose-50 text-rose-700 border-rose-200/80', icon: X },
};

const STATUS_STYLE: Record<string, { label: string; cls: string; dot: string }> = {
  ongoing: { label: 'Berlangsung', cls: 'bg-emerald-500/90 text-white backdrop-blur-md border border-emerald-400/30', dot: 'bg-emerald-200 animate-ping' },
  upcoming: { label: 'Mendatang', cls: 'bg-amber-500/90 text-white backdrop-blur-md border border-amber-400/30', dot: 'bg-amber-200' },
  completed: { label: 'Selesai', cls: 'bg-slate-800/90 text-slate-200 backdrop-blur-md border border-slate-700/50', dot: 'bg-slate-400' },
};

export default function EventCard({ event, variant = 'card' }: EventCardProps) {
  const isInternal = event.eventType === 'internal';
  const eventDate = new Date(event.date + 'T00:00:00');
  const statusStyle = STATUS_STYLE[event.status || 'upcoming'] || STATUS_STYLE.upcoming;
  const rsvp = event.myRsvpStatus ? RSVP_BADGE[event.myRsvpStatus] : null;

  const Wrapper = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <Link href={`/portal/events/${event.id}`} className={className}>
      {children}
    </Link>
  );

  if (variant === 'list') {
    return (
      <Wrapper className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Date Badge */}
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
              <TypeBadge type={isInternal ? 'internal' : 'public'} />
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${statusStyle.cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                {statusStyle.label}
              </span>
              {rsvp && <RsvpBadge rsvp={rsvp} />}
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

        <div className="flex items-center justify-end sm:justify-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white text-xs font-bold transition-all duration-300 shadow-sm">
            {isInternal ? 'RSVP' : event.registrationUrl ? 'Daftar' : 'Detail'}
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300">
      {/* Image Banner Container */}
      <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center relative overflow-hidden ${
            isInternal 
              ? 'bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900' 
              : 'bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950'
          }`}>
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            {isInternal ? (
              <Users className="h-16 w-16 text-purple-300/30" />
            ) : (
              <Calendar className="h-16 w-16 text-blue-300/30" />
            )}
          </div>
        )}

        {/* Ambient Gradient Overlays for Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

        {/* Top Badges: Type & Status */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap z-10">
          <TypeBadge type={isInternal ? 'internal' : 'public'} />
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full shadow-md backdrop-blur-md ${statusStyle.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {statusStyle.label}
          </span>
        </div>

        {/* Bottom Right Floating Date Badge */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md rounded-xl px-3 py-1.5 text-center shadow-lg border border-white/40 z-10 group-hover:scale-105 transition-transform">
          <div className="text-[10px] font-extrabold text-blue-600 uppercase leading-none tracking-wider">
            {eventDate.toLocaleDateString('id-ID', { month: 'short' })}
          </div>
          <div className="text-base font-extrabold text-slate-900 leading-none mt-0.5">
            {eventDate.getDate()}
          </div>
        </div>
      </div>

      {/* Content Section */}
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
        </div>

        {rsvp && (
          <div className="pt-1">
            <RsvpBadge rsvp={rsvp} />
          </div>
        )}

        {/* Card Footer with Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400">
            {isInternal ? 'Khusus Pengurus' : 'Terbuka Untuk Umum'}
          </span>

          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-600 group-hover:text-blue-700 transition-colors">
            {isInternal ? 'RSVP Event' : event.registrationUrl ? 'Daftar' : 'Detail'}
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Wrapper>
  );
}

function TypeBadge({ type }: { type: 'public' | 'internal' }) {
  if (type === 'internal') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full bg-purple-600/90 text-white backdrop-blur-md shadow-md border border-purple-400/30">
        <Users className="h-3 w-3 text-purple-200" /> Internal
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-600/90 text-white backdrop-blur-md shadow-md border border-emerald-400/30">
      <Globe className="h-3 w-3 text-emerald-200" /> Publik
    </span>
  );
}

function RsvpBadge({ rsvp }: { rsvp: { label: string; cls: string; icon: any } }) {
  const Icon = rsvp.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border ${rsvp.cls}`}>
      <Icon className="h-3 w-3" />
      Status: {rsvp.label}
    </span>
  );
}

