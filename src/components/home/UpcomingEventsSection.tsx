'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, ChevronLeft, ChevronRight, Video, Tag } from 'lucide-react';
import type { Event } from '@/src/types';

interface UpcomingEventsSectionProps {
  events: Event[];
}

/**
 * Client Component: Upcoming Events Horizontal Carousel
 * Menampilkan agenda kegiatan mendatang dengan 4 kartu di desktop, responsivitas slider,
 * dan tombol "Lihat Semua" yang mengarah ke /acara.
 */
export default function UpcomingEventsSection({ events }: UpcomingEventsSectionProps) {
  const [scrollIndex, setScrollIndex] = useState(0);

  if (!events || events.length === 0) return null;

  // Formatting Helper untuk tanggal
  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handlePrev = () => {
    setScrollIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setScrollIndex((prev) => Math.min(Math.max(0, events.length - 4), prev + 1));
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8" id="upcoming-events-section">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider font-mono">
            AGENDA TERIKAT
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Kegiatan Mendatang
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Agenda kegiatan dan webinar peningkatan kompetensi berikutnya
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {events.length > 4 && (
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                disabled={scrollIndex === 0}
                className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                disabled={scrollIndex >= events.length - 4}
                className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <Link
            href="/acara"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-4 py-2.5 transition-all"
          >
            Lihat Semua Acara
            <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
          </Link>
        </div>
      </div>

      {/* Cards Grid / Carousel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {events.slice(scrollIndex, scrollIndex + 4).map((evt) => {
          const formattedDate = formatDateDisplay(evt.date);
          const isOnline = (evt.location || '').toLowerCase().includes('zoom') || (evt.location || '').toLowerCase().includes('online');

          return (
            <div
              key={evt.id}
              className="group rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image & Badges Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                {evt.imageUrl ? (
                  <img
                    src={evt.imageUrl}
                    alt={evt.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 p-4 flex flex-col justify-between">
                    <span className="text-[10px] font-extrabold text-white/80 uppercase tracking-widest font-mono">
                      IAI MUDA
                    </span>
                    <h4 className="font-display font-extrabold text-white text-sm line-clamp-2">
                      {evt.title}
                    </h4>
                  </div>
                )}

                {/* Top Category Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-slate-800 shadow-xs border border-slate-100">
                    <Tag className="h-3 w-3 text-blue-600" />
                    {evt.categoryBadge || 'WEBINAR'}
                  </span>
                </div>

                {/* Top Online / Offline Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold shadow-xs ${
                    isOnline 
                      ? 'bg-emerald-500/90 text-white backdrop-blur-md'
                      : 'bg-indigo-500/90 text-white backdrop-blur-md'
                  }`}>
                    {isOnline ? <Video className="h-2.5 w-2.5" /> : <MapPin className="h-2.5 w-2.5" />}
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 font-extrabold font-mono">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formattedDate}</span>
                    {evt.time && <span>• {evt.time} WIB</span>}
                  </div>

                  <h3 className="font-display font-extrabold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {evt.title}
                  </h3>

                  <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed font-normal">
                    {evt.description}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 truncate max-w-[150px]">
                    📍 {evt.location || 'Zoom Meeting'}
                  </span>
                  
                  <Link
                    href="/acara"
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Detail
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
}
