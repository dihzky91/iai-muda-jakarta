'use client';

import { Calendar, MapPin, ArrowRight, ExternalLink } from 'lucide-react';
import type { Event } from '@/src/types';

interface FeaturedEventSpotlightProps {
  event: Event;
  onViewAll: () => void;
}

export default function FeaturedEventSpotlight({ event, onViewAll }: FeaturedEventSpotlightProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="featured-webinar-spotlight">
      <div className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-8 md:p-12 relative overflow-hidden shadow-lg shadow-indigo-500/10">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="md:grid md:grid-cols-12 md:gap-8 items-center relative z-10 space-y-6 md:space-y-0">
          <div className="md:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              SOROTAN ACARA TERBARU
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {event.title}
            </h3>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
              {event.description}
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-mono text-indigo-200 pt-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-white" />
                {event.date}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-emerald-300" />
                {event.location}
              </span>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-start md:justify-end">
            {event.registrationUrl ? (
              <a
                id="homepage-spotlight-register"
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-blue-700 shadow-md hover:bg-slate-50 transition-all cursor-pointer"
              >
                Daftar Sekarang Secara Gratis
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <button
                id="homepage-spotlight-register"
                onClick={onViewAll}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-blue-700 shadow-md hover:bg-slate-50 transition-all cursor-pointer"
              >
                Daftar Sekarang Secara Gratis
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
