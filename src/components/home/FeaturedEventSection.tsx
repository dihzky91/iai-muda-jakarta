'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Star, 
  ExternalLink, 
  ArrowRight, 
  Calendar, 
  Video, 
  Ticket, 
  Award, 
  FileCheck, 
  ChevronLeft, 
  ChevronRight,
  Users,
  MapPin
} from 'lucide-react';
import type { Event } from '@/src/types';

interface FeaturedEventSectionProps {
  events: Event[];
}

/**
 * Client Component: Featured Event Spotlight Dashboard & Carousel
 * Tampilan persis sesuai desain mockup SaaS (Apple/Linear/Vercel inspired).
 */
export default function FeaturedEventSection({ events }: FeaturedEventSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const featuredList = events.length > 0 ? events : [];
  const currentEvent = featuredList[currentIndex];

  // Auto-slide 8 detik jika ada lebih dari 1 event
  useEffect(() => {
    if (featuredList.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featuredList.length, isHovered]);

  if (!currentEvent) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? featuredList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredList.length);
  };

  // Mobile Touch Swipe Handling
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  // Formatting Helper untuk tanggal
  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return 'Tanggal belum ditentukan';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formattedDate = formatDateDisplay(currentEvent.date);
  const eventTime = currentEvent.time ? `${currentEvent.time} WIB` : 'Sesuai Jadwal';
  const rawLocation = currentEvent.location || 'Zoom Meeting & YouTube Live';

  // Deteksi lokasi (Online, Offline / Tatap Muka, atau Hybrid)
  const isOnlineLoc = /zoom|google meet|meet|online|webinar|live stream|youtube/i.test(rawLocation);
  const isHybridLoc = /hybrid/i.test(rawLocation);
  const isOfflineLoc = !isOnlineLoc || isHybridLoc;

  let locationSubtitle = 'Online Event';
  let LocationIcon = Video;
  let iconBgClass = 'bg-purple-50 text-purple-600 hover:border-purple-200';

  if (isHybridLoc) {
    locationSubtitle = 'Hybrid Event (Online & Offline)';
    LocationIcon = Video;
    iconBgClass = 'bg-indigo-50 text-indigo-600 hover:border-indigo-200';
  } else if (isOfflineLoc) {
    locationSubtitle = 'Offline Event (Tatap Muka)';
    LocationIcon = MapPin;
    iconBgClass = 'bg-amber-50 text-amber-600 hover:border-amber-200';
  }

  const categoryLabel = currentEvent.categoryBadge || 'WEBINAR';
  const priceLabel = currentEvent.priceText || 'Gratis';

  // Handling SKP (Jika kosong/null/Non-SKP/Tanpa SKP/0 SKP)
  const rawSkp = currentEvent.skpText;
  const isNoSkp = !rawSkp || /^(non-?skp|tanpa skp|0 skp|tidak ada skp|none|-)$/i.test(rawSkp.trim());
  const skpText = isNoSkp ? 'Non-SKP' : rawSkp;
  const skpSub = isNoSkp ? (currentEvent.skpSubtitle && currentEvent.skpSubtitle !== 'IAI & Mahasiswa' ? currentEvent.skpSubtitle : 'Tanpa Bobot SKP') : (currentEvent.skpSubtitle || 'IAI & Mahasiswa');

  const speakersLabel = currentEvent.speakersText || 'Bersama 3+\nNarasumber Ahli';

  return (
    <section 
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative"
      id="featured-event-dashboard"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="relative rounded-[2.5rem] bg-white border border-slate-200/80 p-6 sm:p-10 md:p-12 shadow-2xl shadow-slate-200/50 overflow-hidden transition-all duration-300"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >

        {/* Floating Navigation Arrows (Desktop) */}
        {featuredList.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-white/90 border border-slate-200 text-slate-700 shadow-lg hover:bg-white hover:text-blue-600 hover:scale-110 active:scale-95 transition-all"
              aria-label="Acara Sebelumnya"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-white/90 border border-slate-200 text-slate-700 shadow-lg hover:bg-white hover:text-blue-600 hover:scale-110 active:scale-95 transition-all"
              aria-label="Acara Selanjutnya"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Main Content Grid (Left 60% / Right 40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Left Column: Details & Action (65%) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Small Badge: Sorotan Acara */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-extrabold text-blue-600 border border-blue-100 shadow-xs uppercase tracking-wider">
                <Star className="h-3.5 w-3.5 fill-blue-600 text-blue-600" />
                SOROTAN ACARA
              </span>
              {currentEvent.status === 'ongoing' || currentEvent.isLive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-extrabold text-rose-600 border border-rose-100 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  LIVE NOW
                </span>
              ) : null}
            </div>

            {/* Large Title */}
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
              {currentEvent.title}
            </h2>

            {/* Description */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
              {currentEvent.description}
            </p>

            {/* CTA Buttons & Speaker Avatars Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {currentEvent.registrationUrl ? (
                <a
                  href={currentEvent.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Daftar Sekarang Secara Gratis
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <Link
                  href="/acara"
                  className="inline-flex items-center gap-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Daftar Sekarang Secara Gratis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              {/* Speaker Avatars Pill (Hanya tampil jika ada data narasumber) */}
              {currentEvent.speakersText && currentEvent.speakersText.trim() !== '' && (
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-200/70 px-4 py-2 shadow-xs">
                  <div className="flex -space-x-2 overflow-hidden">
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                      alt="Speaker 1"
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
                      alt="Speaker 2"
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150"
                      alt="Speaker 3"
                    />
                  </div>
                  <div className="text-[11px] leading-tight font-semibold text-slate-700 whitespace-pre-line">
                    {currentEvent.speakersText}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Event Poster Area with Localized Decorative Blobs & Dot-Grid */}
          <div className="lg:col-span-5 flex justify-center items-center py-8 px-4 lg:px-10 relative">
            
            {/* 1. Subtle Dot-Grid Pattern behind poster area only */}
            <div className="absolute inset-2 bg-[radial-gradient(#3b82f6_1.5px,transparent_1.5px)] [background-size:22px_22px] opacity-15 pointer-events-none rounded-3xl" />

            {/* 2. Faint Radial Glow behind poster area */}
            <div className="absolute inset-2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-200/40 via-indigo-100/10 to-transparent pointer-events-none -z-10 blur-xl" />

            {/* 3. Large Organic Abstract Gradient Blob (2.5x larger than poster, 560px, 100px Heavy Blur, ~12% Opacity) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] sm:w-[580px] h-[520px] sm:h-[580px] rounded-full bg-gradient-to-tr from-blue-600/15 via-indigo-500/12 to-blue-400/8 blur-[100px] pointer-events-none -z-10" />

            {/* 4. Small Blob near Top-Left of poster */}
            <div className="absolute top-2 left-6 w-44 h-44 rounded-full bg-gradient-to-br from-cyan-400/15 via-blue-400/10 to-transparent blur-[70px] pointer-events-none -z-10" />

            {/* 5. Smaller Blob near Bottom-Right of poster */}
            <div className="absolute bottom-2 right-6 w-48 h-48 rounded-full bg-gradient-to-tr from-indigo-600/14 via-purple-500/10 to-transparent blur-[75px] pointer-events-none -z-10" />

            {/* Event Poster Container (Centered cleanly in poster area) */}
            <div className="relative group w-full max-w-[270px] sm:max-w-[290px] z-10 my-2">
              
              {/* Elevated Clean Poster Shell */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/15 border border-slate-200/80 bg-white transition-transform duration-500 group-hover:scale-[1.02]">
                
                {/* Poster Image / Graphic Cover */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 flex flex-col justify-between p-5 text-white">
                  {currentEvent.imageUrl ? (
                    <img
                      src={currentEvent.imageUrl}
                      alt={currentEvent.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <>
                      {/* Default Graphic Cover matching screenshot */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-950" />
                      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
                      
                      {/* Brand Header */}
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
                          <span className="font-display font-extrabold text-xs tracking-wider">IAI Muda</span>
                        </div>
                        {currentEvent.isLive || currentEvent.status === 'ongoing' ? (
                          <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md animate-pulse">
                            ● LIVE
                          </span>
                        ) : null}
                      </div>

                      {/* Poster Content */}
                      <div className="relative z-10 space-y-3 my-auto">
                        <span className="inline-block bg-blue-500/80 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-white/20">
                          {categoryLabel}
                        </span>
                        <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white leading-tight">
                          {currentEvent.title}
                        </h3>
                        <div className="space-y-1 text-xs text-blue-100 font-medium">
                          <p>📅 {formattedDate}</p>
                          <p>🕒 {eventTime}</p>
                          <p>📍 {rawLocation}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Gradient Overlay for bottom badges readability */}
                  <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent pointer-events-none" />

                  {/* Poster Overlay Badges */}
                  <div className="relative z-10 flex items-center justify-between w-full mt-auto">
                    <span className="bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-lg border border-white/20 shadow-sm">
                      {categoryLabel}
                    </span>
                    {currentEvent.status === 'ongoing' || currentEvent.isLive ? (
                      <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md animate-pulse">
                        ● LIVE
                      </span>
                    ) : null}
                  </div>

                </div>
              </div>

              {/* Decorative Glow Blob behind poster */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl opacity-20 blur-xl group-hover:opacity-35 transition-opacity -z-10" />

            </div>
          </div>

        </div>

        {/* Bottom Metadata Bar (Dynamic Cards Grid) */}
        <div className="mt-10 pt-8 border-t border-slate-100 relative z-10">
          {(() => {
            const hasLocationCard = Boolean(currentEvent.location && currentEvent.location.trim() !== '');
            const hasPriceCard = Boolean(currentEvent.priceText && currentEvent.priceText.trim() !== '');
            const hasSkpCard = Boolean(currentEvent.skpText && currentEvent.skpText.trim() !== '' && !isNoSkp);
            const hasCertCard = currentEvent.hasCertificate !== false;

            const cardItems = [
              // Card 1: Tanggal (Selalu Tampil)
              <div key="date" className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-white hover:shadow-md hover:border-blue-200 transition-all group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {formattedDate}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 truncate">
                    {eventTime}
                  </div>
                </div>
              </div>,

              // Card 2: Lokasi / Platform
              hasLocationCard && (
                <div key="location" className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-white hover:shadow-md hover:border-blue-200 transition-all group">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isOfflineLoc ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'} group-hover:scale-110 transition-transform`}>
                    <LocationIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate" title={rawLocation}>
                      {rawLocation}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 truncate">
                      {locationSubtitle}
                    </div>
                  </div>
                </div>
              ),

              // Card 3: Biaya / Entry
              hasPriceCard && (
                <div key="price" className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-white hover:shadow-md hover:border-emerald-200 transition-all group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {priceLabel}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 truncate">
                      Terbuka untuk umum
                    </div>
                  </div>
                </div>
              ),

              // Card 4: SKP
              hasSkpCard && (
                <div key="skp" className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-white hover:shadow-md hover:border-amber-200 transition-all group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {skpText}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 truncate">
                      {skpSub}
                    </div>
                  </div>
                </div>
              ),

              // Card 5: Sertifikat
              hasCertCard && (
                <div key="cert" className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-white hover:shadow-md hover:border-rose-200 transition-all group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      E-Sertifikat
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 truncate">
                      Untuk peserta
                    </div>
                  </div>
                </div>
              ),
            ].filter(Boolean);

            const gridColsClass = 
              cardItems.length === 1 ? 'grid-cols-1 max-w-sm' :
              cardItems.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl' :
              cardItems.length === 3 ? 'grid-cols-1 sm:grid-cols-3' :
              cardItems.length === 4 ? 'grid-cols-2 sm:grid-cols-4' :
              'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';

            return (
              <div className={`grid gap-3.5 sm:gap-4 ${gridColsClass}`}>
                {cardItems}
              </div>
            );
          })()}
        </div>

        {/* Pagination Dots (bottom center) */}
        {featuredList.length > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            {featuredList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex 
                    ? 'w-7 bg-blue-600 shadow-xs' 
                    : 'w-2.5 bg-slate-200 hover:bg-slate-300'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
