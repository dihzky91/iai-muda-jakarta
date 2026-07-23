'use client';

import Link from 'next/link';
import { Calendar, MapPin, Users, Globe, Check, X, HelpCircle, ArrowRight, ExternalLink, Clock } from 'lucide-react';
import type { Event, RsvpStatus } from '@/src/types';

type MemberEvent = Event & { myRsvpStatus?: RsvpStatus | null };

interface EventCardProps {
  event: MemberEvent;
  variant?: 'card' | 'list';
}

const RSVP_BADGE: Record<RsvpStatus, { label: string; cls: string; icon: any }> = {
  attending: { label: 'Hadir', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Check },
  maybe: { label: 'Mungkin', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: HelpCircle },
  not_attending: { label: 'Tidak Hadir', cls: 'bg-rose-50 text-rose-700 border-rose-200', icon: X },
};

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  ongoing: { label: 'Berlangsung', cls: 'bg-emerald-500 text-white' },
  upcoming: { label: 'Mendatang', cls: 'bg-amber-500 text-white' },
  completed: { label: 'Selesai', cls: 'bg-slate-700 text-slate-200' },
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
      <Wrapper className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-center">
          <span className="text-[9px] font-bold text-blue-600 uppercase">
            {eventDate.toLocaleDateString('id-ID', { month: 'short' })}
          </span>
          <span className="text-base font-extrabold text-slate-900 leading-none">
            {eventDate.getDate()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 line-clamp-1">
              {event.title}
            </h3>
            {isInternal && <TypeBadge type="internal" />}
            {rsvp && <RsvpBadge rsvp={rsvp} />}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
            {event.time && `${event.time} · `}
            {event.location || 'Lokasi menyusul'}
          </p>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all">
      {/* Image / placeholder */}
      <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} referrerPolicy="no-referrer" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {isInternal ? (
              <Users className="h-10 w-10 text-purple-300" />
            ) : (
              <Calendar className="h-10 w-10 text-slate-300" />
            )}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          <TypeBadge type={isInternal ? 'internal' : 'public'} />
          <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full shadow-sm ${statusStyle.cls}`}>
            {statusStyle.label}
          </span>
        </div>

        {/* Date badge */}
        <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur rounded-lg px-2 py-1 text-center shadow-sm">
          <div className="text-[9px] font-bold text-blue-600 uppercase leading-none">
            {eventDate.toLocaleDateString('id-ID', { month: 'short' })}
          </div>
          <div className="text-sm font-extrabold text-slate-900 leading-none mt-0.5">
            {eventDate.getDate()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-3.5 flex flex-col gap-2">
        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
          {event.title}
        </h3>

        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          {event.time && (
            <>
              <Clock className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span>{event.time}</span>
              <span className="text-slate-300">·</span>
            </>
          )}
          {event.location && (
            <>
              <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </>
          )}
        </div>

        {rsvp && (
          <div className={`inline-flex items-center gap-1 self-start text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${rsvp.cls}`}>
            <rsvp.icon className="h-2.5 w-2.5" />
            RSVP: {rsvp.label}
          </div>
        )}

        <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          {isInternal ? (
            <span className="text-purple-600 font-bold flex items-center gap-0.5">
              RSVP
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          ) : event.registrationUrl ? (
            <span className="text-blue-600 font-bold flex items-center gap-0.5">
              Daftar
              <ExternalLink className="h-3 w-3" />
            </span>
          ) : (
            <span className="text-slate-500 font-medium">Detail</span>
          )}
        </div>
      </div>
    </Wrapper>
  );
}

function TypeBadge({ type }: { type: 'public' | 'internal' }) {
  if (type === 'internal') {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-600 text-white shadow-sm">
        <Users className="h-2.5 w-2.5" /> Internal
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500 text-white shadow-sm">
      <Globe className="h-2.5 w-2.5" /> Publik
    </span>
  );
}

function RsvpBadge({ rsvp }: { rsvp: { label: string; cls: string; icon: any } }) {
  const Icon = rsvp.icon;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${rsvp.cls}`}>
      <Icon className="h-2.5 w-2.5" />
      {rsvp.label}
    </span>
  );
}
