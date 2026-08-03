'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X, ChevronRight, ChevronLeft, Sparkles, MessageCircle, Calendar, Award, CheckCircle2 } from 'lucide-react';

interface GuideSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  actionText?: string;
  actionHref?: string;
}

const GUIDE_SLIDES: GuideSlide[] = [
  {
    id: 'welcome',
    badge: 'Cerdas • Integritas • Solutif',
    title: 'Hai Pengurus & Anggota!',
    subtitle: 'Selamat datang di Portal Internal IAI Muda DKI Jakarta',
    description: 'Prof Akun adalah asisten cerdas yang siap membantu kamu menemukan berbagai informasi penting, mengakses dokumen, dan mengelola kegiatan dengan mudah.',
    icon: <Sparkles className="h-5 w-5 text-amber-500" />,
  },
  {
    id: 'events',
    badge: 'Agenda & Pelatihan',
    title: 'Event & Kegiatan Terbaru',
    subtitle: 'Ikuti webinar, pelatihan, dan workshop akuntansi',
    description: 'Jangan lewatkan agenda seru dan pelatihan peningkatan kompetensi dari IAI Muda Jakarta. Kamu bisa melihat jadwal dan langsung mendaftar di menu Event.',
    icon: <Calendar className="h-5 w-5 text-blue-600" />,
    actionText: 'Jelajahi Event',
    actionHref: '/portal/events',
  },
  {
    id: 'gamification',
    badge: 'Prestasi & Poin',
    title: 'Gamifikasi & Poin Keaktifan',
    subtitle: 'Kumpulkan poin & dapatkan lencana penghargaan',
    description: 'Setiap partisipasi aktifmu di kegiatan portal akan memberikan Poin & Lencana spesial. Pantau posisimu di papan klasemen (Leaderboard) Akuntan Muda!',
    icon: <Award className="h-5 w-5 text-amber-500" />,
    actionText: 'Cek Poin Saya',
    actionHref: '/portal/dashboard',
  },
  {
    id: 'helpdesk',
    badge: 'Layanan Anggota',
    title: 'Butuh Bantuan Lebih Lanjut?',
    subtitle: 'Tim Admin IAI Muda Jakarta Siap Membantu',
    description: 'Jika kamu memiliki pertanyaan seputar keanggotaan, kendala akun, atau informasi organisasi, hubungi kami langsung via WhatsApp.',
    icon: <MessageCircle className="h-5 w-5 text-emerald-500" />,
    actionText: 'Hubungi Helpdesk Admin',
    actionHref: 'https://wa.me/6281234567890?text=Halo%20Admin%20IAI%20Muda%20Jakarta,%20saya%20butuh%20bantuan',
  },
];

export default function ProfAkunWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('prof_akun_dismissed');
    if (dismissed === 'true') {
      setHasDismissed(true);
      setShowSpeechBubble(false);
    }
  }, []);

  // Jangan tampilkan Prof Akun di halaman login/auth (Strict Rules of Hooks compliance)
  if (pathname?.includes('/login')) {
    return null;
  }

  const handleOpenModal = () => {
    setIsOpen(true);
    setShowSpeechBubble(false);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    localStorage.setItem('prof_akun_dismissed', 'true');
    setHasDismissed(true);
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < GUIDE_SLIDES.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else {
      handleCloseModal();
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const currentSlide = GUIDE_SLIDES[currentSlideIndex];

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 font-sans select-none">

      {/* POP-OUT MODAL CARD (Clean Navy Header #0D1B3D Layout) */}
      {isOpen && (
        <div className="w-[330px] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Header Card (Navy Accent #0D1B3D) */}
          <div className="bg-[#0D1B3D] text-white p-5 relative overflow-hidden">
            {/* Background Decorative Pattern */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-600/20 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center shrink-0 shadow-inner">
                  <img
                    src="/images/prof-akun.png"
                    alt="Prof Akun"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-base tracking-tight text-white">Prof Akun</h3>
                    <span className="bg-blue-500/30 text-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-400/30">
                      Asisten Digital
                    </span>
                  </div>
                  <p className="text-xs text-blue-200/80 font-medium">IAI Muda DKI Jakarta</p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 bg-gradient-to-b from-blue-50/40 to-white">
            
            {/* Category / Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-100/80 px-3 py-1 rounded-full border border-blue-200/60">
                {currentSlide.icon}
                {currentSlide.badge}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                {currentSlideIndex + 1} / {GUIDE_SLIDES.length}
              </span>
            </div>

            {/* Slide Title & Description */}
            <h4 className="text-lg font-bold text-[#0D1B3D] tracking-tight leading-snug mb-1">
              {currentSlide.title}
            </h4>
            <p className="text-xs font-semibold text-blue-600 mb-3">
              {currentSlide.subtitle}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed font-normal mb-5">
              {currentSlide.description}
            </p>

            {/* Optional Action Button */}
            {currentSlide.actionText && (
              <a
                href={currentSlide.actionHref}
                target={currentSlide.actionHref?.startsWith('http') ? '_blank' : '_self'}
                rel="noreferrer"
                className="mb-5 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all transform active:scale-95"
              >
                {currentSlide.actionText}
                <ChevronRight className="h-4 w-4" />
              </a>
            )}

            {/* Pagination Dots & Navigation Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              
              {/* Previous Button */}
              <button
                onClick={handlePrevSlide}
                disabled={currentSlideIndex === 0}
                className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  currentSlideIndex === 0
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer'
                }`}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Kembali
              </button>

              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {GUIDE_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === currentSlideIndex
                        ? 'w-5 bg-blue-600'
                        : 'w-2 bg-slate-200 hover:bg-slate-300'
                    }`}
                  />
                ))}
              </div>

              {/* Next / Finish Button */}
              <button
                onClick={handleNextSlide}
                className="flex items-center gap-1 text-xs font-bold text-white bg-[#0D1B3D] hover:bg-slate-900 px-4 py-1.5 rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
              >
                {currentSlideIndex === GUIDE_SLIDES.length - 1 ? (
                  <>
                    <span>Mengerti, Terima kasih!</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  </>
                ) : (
                  <>
                    <span>Lanjut</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* SPEECH BUBBLE */}
      {!isOpen && showSpeechBubble && (
        <div className="relative bg-white text-slate-800 text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl border border-blue-100 flex items-center gap-2 max-w-[240px] animate-bounce">
          <span>Hai! Ada yang bisa Prof Akun bantu?</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSpeechBubble(false);
            }}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            title="Tutup pesan"
          >
            <X className="h-3 w-3" />
          </button>

          {/* Tail Triangle */}
          <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white drop-shadow-sm" />
        </div>
      )}

      {/* FLOATING AVATAR TRIGGER BUTTON */}
      <button
        onClick={handleOpenModal}
        className="group relative w-16 h-16 rounded-full bg-gradient-to-tr from-[#0D1B3D] via-blue-900 to-blue-700 p-1 shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer border-2 border-white"
        title="Buka Prof Akun Asisten Portal"
      >
        {/* Glow Ring */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-300" />

        {/* Inner Container */}
        <div className="relative w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center p-0.5">
          <img
            src="/images/prof-akun.png"
            alt="Prof Akun Floating Mascot"
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Notification Dot */}
        {!hasDismissed && (
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white text-[9px] font-bold text-white items-center justify-center">
              1
            </span>
          </span>
        )}
      </button>

    </div>
  );
}
