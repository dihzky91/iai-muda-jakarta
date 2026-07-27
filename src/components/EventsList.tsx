'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Event } from '../types';
import EventRegistrationModal from './EventRegistrationModal';
import { Calendar, MapPin, Clock, Search, ExternalLink } from 'lucide-react';

interface EventsListProps {
  events: Event[];
}

export default function EventsList({ events }: EventsListProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Event Registration State (only need to track which event is selected for modal)
  const [registeringEvent, setRegisteringEvent] = useState<Event | null>(null);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchStatus = selectedStatus === 'all' || e.status === selectedStatus;
      const matchSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [events, selectedStatus, searchQuery]);


  return (
    <div className="space-y-10 py-8" id="events-section-container">
      
      {/* Header section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Agenda, Webinar & Kegiatan IAI Muda
        </h2>
        <p className="text-slate-600 text-sm sm:text-base">
          Tingkatkan kualifikasi profesionalmu melalui program upgrading kompetensi terpadu yang dirancang khusus untuk mahasiswa dan akuntan muda.
        </p>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        
        {/* Status selection pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              selectedStatus === 'all'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/10 border-blue-600'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-100'
            }`}
          >
            Semua Agenda
          </button>
          <button
            onClick={() => setSelectedStatus('ongoing')}
            className={`rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
              selectedStatus === 'ongoing'
                ? 'bg-emerald-600 text-white font-bold shadow-md border-emerald-600'
                : 'bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 border-emerald-100'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Berlangsung (Ongoing)
          </button>
          <button
            onClick={() => setSelectedStatus('upcoming')}
            className={`rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
              selectedStatus === 'upcoming'
                ? 'bg-amber-500 text-white font-bold shadow-md border-amber-500'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-100'
            }`}
          >
            Akan Datang (Upcoming)
          </button>
          <button
            onClick={() => setSelectedStatus('completed')}
            className={`rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              selectedStatus === 'completed'
                ? 'bg-slate-700 text-white font-bold border-slate-700'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-100'
            }`}
          >
            Telah Selesai (Completed)
          </button>
        </div>

        {/* Dynamic event search query box */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari topik webinar, kompetensi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-white border border-slate-200 pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

      </div>

      {/* Events Listing Cards */}
      <div className="max-w-7xl mx-auto">
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((evt) => {
              const isOngoing = evt.status === 'ongoing';
              const isUpcoming = evt.status === 'upcoming';
              const isCompleted = evt.status === 'completed';

              return (
                <div 
                  key={evt.id}
                  id={`event-card-${evt.id}`}
                  className="flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                >
                  {/* Event Thumbnail */}
                  <div className="relative aspect-video w-full bg-slate-50 overflow-hidden">
                    {evt.imageUrl ? (
                      <Image
                        src={evt.imageUrl}
                        alt={evt.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        referrerPolicy="no-referrer"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100">
                        <Calendar className="h-10 w-10 text-slate-400" />
                      </div>
                    )}
                    
                    {/* Floating Status Badge */}
                    <div className="absolute top-3 left-3">
                      {isOngoing && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-emerald-500/10">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          Berlangsung
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                          Mendatang
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center rounded-full bg-slate-700 px-3 py-1 text-xs font-bold text-slate-200">
                          Selesai
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Event Information */}
                  <div className="flex-1 p-6 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      
                      {/* Meta information row */}
                      <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-slate-500 font-mono font-medium">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-blue-600" />
                          <span>{evt.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-blue-600" />
                          <span>{evt.time} WIB</span>
                        </div>
                      </div>

                      <h3 className="font-display font-bold text-slate-900 text-lg tracking-tight line-clamp-2">
                        {evt.title}
                      </h3>
                      
                      <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                        {evt.description}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>

                    </div>

                    {/* Button triggers */}
                    <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                      {isCompleted ? (
                        <button 
                          disabled 
                          className="w-full rounded-xl bg-slate-100 text-slate-400 py-2.5 text-xs font-bold cursor-not-allowed"
                        >
                          Pendaftaran Ditutup
                        </button>
                      ) : (
                        <button
                          id={`event-reg-btn-${evt.id}`}
                          onClick={() => {
                            if (evt.registrationUrl) {
                              window.open(evt.registrationUrl, '_blank', 'noopener,noreferrer');
                            } else {
                              setRegisteringEvent(evt);
                            }
                          }}
                          className={`w-full rounded-xl py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isOngoing
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:from-emerald-500 hover:to-teal-500'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/10'
                          }`}
                        >
                          Daftar Sekarang
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 max-w-lg mx-auto shadow-sm">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-bold">Tidak ada kegiatan ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan saringan status atau hapus pencarian Anda.</p>
          </div>
        )}
      </div>

      {/* --- EVENT REGISTRATION OVERLAY (extracted to EventRegistrationModal) --- */}
      {registeringEvent && (
        <EventRegistrationModal
          event={registeringEvent}
          onClose={() => setRegisteringEvent(null)}
        />
      )}

    </div>
  );
}
