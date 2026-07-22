'use client';

import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, PartyPopper } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time?: string | null;
  location?: string | null;
  imageUrl?: string | null;
  registrationUrl?: string | null;
  status?: string | null;
}

interface UpcomingEventsProps {
  events: Event[];
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-8 px-4">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
        <PartyPopper className="w-7 h-7 text-blue-500" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">Belum Ada Acara</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
        Nantikan kegiatan terbaru dari IAI Muda Jakarta.
      </p>
    </div>
  );
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Acara Mendatang</h2>
          <p className="text-sm text-slate-500 mt-0.5">Jangan lewatkan kegiatan organisasi</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      <div className="p-2">
        {events.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-slate-100">
            {events.slice(0, 3).map((event) => (
              <li key={event.id}>
                <Link
                  href={event.registrationUrl || '#'}
                  className="group flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-semibold text-blue-600 uppercase">
                      {new Date(event.date + 'T00:00:00').toLocaleDateString('id-ID', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-slate-900 leading-none">
                      {new Date(event.date + 'T00:00:00').getDate()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {event.time || 'Waktu menyusul'}
                      {event.location && ` · ${event.location}`}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs font-medium text-blue-600">
                      {event.registrationUrl ? 'Daftar Sekarang' : 'Lihat Detail'}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-6 py-3 border-t border-slate-100">
        <Link
          href="/portal/events"
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800"
        >
          Lihat Semua Acara <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
