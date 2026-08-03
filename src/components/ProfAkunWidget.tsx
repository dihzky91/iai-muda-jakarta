'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Sparkles, MessageCircle, Calendar, Award, CheckCircle2, BookOpenCheck, Users } from 'lucide-react';

interface GuideSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  actionText?: string;
  actionHref?: string;
}

const GUIDE_SLIDES: GuideSlide[] = [
  {
    id: 'welcome',
    badge: 'Cerdas • Integritas • Solutif',
    title: 'Hai Pengurus!',
    subtitle: 'Selamat datang di Portal Internal IAI Muda DKI Jakarta',
    description: 'Prof Akun adalah asisten cerdas yang siap membantu kamu menemukan berbagai informasi penting, mengakses dokumen, dan mengelola kegiatan dengan mudah.',
    icon: <Sparkles className="h-5 w-5 text-amber-500" />,
    image: '/images/prof-akun-waving.png',
  },
  {
    id: 'directory',
    badge: 'Jejaring Organisasi',
    title: 'Direktori Anggota & Pengurus',
    subtitle: 'Jelajahi & bangun koneksi antar sesama pengurus',
    description: 'Temukan profil pengurus, nomor kontak, serta jaringan alumni dan anggota aktif IAI Muda DKI Jakarta untuk berkolaborasi dengan mudah.',
    icon: <Users className="h-5 w-5 text-blue-600" />,
    image: '/images/prof-akun-guiding.png',
    actionText: 'Lihat Direktori Anggota',
    actionHref: '/portal/directory',
  },
  {
    id: 'onboarding',
    badge: 'Dokumen & Panduan',
    title: 'Onboarding Library',
    subtitle: 'Unduh & kelola dokumen kepengurusan awal',
    description: 'Akses template berkas organisasi, panduan kerja pengurus, serta dokumen administratif yang wajib diisi pada awal masa bakti pengurus.',
    icon: <BookOpenCheck className="h-5 w-5 text-indigo-600" />,
    image: '/images/prof-akun-reading.png',
    actionText: 'Buka Onboarding Library',
    actionHref: '/portal/onboarding',
  },
  {
    id: 'events',
    badge: 'Agenda & Pelatihan',
    title: 'Event & Kegiatan Terbaru',
    subtitle: 'Ikuti webinar, pelatihan, dan workshop akuntansi',
    description: 'Jangan lewatkan agenda seru dan pelatihan peningkatan kompetensi dari IAI Muda Jakarta. Kamu bisa melihat jadwal dan langsung mendaftar di menu Event.',
    icon: <Calendar className="h-5 w-5 text-blue-600" />,
    image: '/images/prof-akun-megaphone.png',
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
    image: '/images/prof-akun-tablet.png',
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
    image: '/images/prof-akun-laptop.png',
    actionText: 'Hubungi Helpdesk Admin',
    actionHref: 'https://wa.me/6281234567890?text=Halo%20Admin%20IAI%20Muda%20Jakarta,%20saya%20butuh%20bantuan',
  },
];

const getContextualGreeting = (pathname: string | null): { text: string; sub?: string } => {
  const currentHour = new Date().getHours();

  if (pathname?.includes('/directory')) {
    return {
      text: 'Temukan rekan pengurus di Direktori.',
      sub: 'Jelajahi profil & kontak anggota aktif 🤝',
    };
  }
  if (pathname?.includes('/events')) {
    return {
      text: 'Ada agenda & webinar baru minggu ini!',
      sub: 'Klik untuk lihat detail acara 📅',
    };
  }
  if (pathname?.includes('/onboarding')) {
    return {
      text: 'Sudah melengkapi berkas pengurus?',
      sub: 'Klik untuk cek Onboarding Library 📚',
    };
  }
  if (pathname?.includes('/feed')) {
    return {
      text: 'Ada kabar & diskusi pengurus baru!',
      sub: 'Klik untuk jelajahi panduan portal 💬',
    };
  }

  // Time-based greetings
  if (currentHour >= 4 && currentHour < 12) {
    return { text: 'Selamat pagi, Pengurus! ☕', sub: 'Siap produktif? Prof siap bantu!' };
  } else if (currentHour >= 12 && currentHour < 18) {
    return { text: 'Selamat siang, Pengurus! ☀️', sub: 'Ada info & kegiatan menarik hari ini!' };
  } else {
    return { text: 'Selamat malam, Pengurus! 🌙', sub: 'Butuh dokumen atau info kegiatan?' };
  }
};

export default function ProfAkunWidget() {
  const pathname = usePathname();
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [dragBounds, setDragBounds] = useState({ left: -300, right: 0, top: -500, bottom: 0 });

  useEffect(() => {
    // Dynamically update drag boundaries on window resize
    const updateBounds = () => {
      setDragBounds({
        left: -(window.innerWidth - 100),
        right: 0,
        top: -(window.innerHeight - 120),
        bottom: 0,
      });
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  useEffect(() => {
    // Reset speech bubble visibility on page navigation so contextual greeting shows
    setShowSpeechBubble(true);
  }, [pathname]);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isOpen && widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
    setShowSpeechBubble(true);
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
  const greeting = getContextualGreeting(pathname);

  return (
    <motion.div
      ref={widgetRef}
      drag
      dragConstraints={dragBounds}
      dragElastic={0.1}
      dragMomentum={false}
      whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
      className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 flex flex-col items-end gap-2.5 font-sans select-none max-w-[calc(100vw-2rem)] cursor-grab active:cursor-grabbing"
    >
      {/* MOBILE BOTTOM SHEET & DESKTOP POP-OUT MODAL */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Dimmed Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="sm:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
            />

            {/* Modal Box: Bottom Sheet on Mobile, Floating Card on Desktop */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed sm:relative inset-x-0 bottom-0 sm:bottom-auto sm:inset-auto z-50 w-full sm:w-[360px] max-w-full sm:max-w-[360px] bg-white rounded-t-[2rem] sm:rounded-3xl shadow-2xl border-t sm:border border-blue-100/80 overflow-hidden"
            >
              {/* Mobile Notch Handle */}
              <div className="sm:hidden flex justify-center pt-2.5 pb-1 bg-[#0D1B3D]">
                <div className="w-12 h-1.5 bg-white/30 rounded-full" />
              </div>

              {/* Header Card (Navy Accent #0D1B3D) */}
              <div className="bg-[#0D1B3D] text-white p-4.5 px-5 relative overflow-hidden">
                {/* Background Decorative Pattern */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-600/20 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    {/* Clean AI Badge Icon (No duplicate mascot image) */}
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 shadow-inner">
                      <Sparkles className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm tracking-tight text-white">Prof Akun</h3>
                        <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-medium px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Online
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-200/80 font-medium">Asisten Digital IAI Muda Jakarta</p>
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={handleCloseModal}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Tutup"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

          {/* Body Content */}
          <div className="p-5 bg-gradient-to-b from-blue-50/30 to-white">
            
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
            <h4 className="text-base font-bold text-[#0D1B3D] tracking-tight leading-snug mb-1">
              {currentSlide.title}
            </h4>
            <p className="text-xs font-semibold text-blue-600 mb-2">
              {currentSlide.subtitle}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed font-normal mb-4">
              {currentSlide.description}
            </p>

            {/* Optional Action Button (Sleek & Compact) */}
            {currentSlide.actionText && (
              <a
                href={currentSlide.actionHref}
                target={currentSlide.actionHref?.startsWith('http') ? '_blank' : '_self'}
                rel="noreferrer"
                className="mb-4 flex items-center justify-center gap-1.5 w-full py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all transform active:scale-95"
              >
                <span>{currentSlide.actionText}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </a>
            )}

            {/* Pagination Dots & Navigation Controls (Proportional & Balanced) */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              
              {/* Previous Button */}
              <button
                onClick={handlePrevSlide}
                disabled={currentSlideIndex === 0}
                className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
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
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentSlideIndex
                        ? 'w-4 bg-blue-600'
                        : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                    }`}
                  />
                ))}
              </div>

              {/* Next / Finish Button */}
              <button
                onClick={handleNextSlide}
                className="flex items-center gap-1 text-xs font-bold text-white bg-[#0D1B3D] hover:bg-slate-900 px-3.5 py-1.5 rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
              >
                {currentSlideIndex === GUIDE_SLIDES.length - 1 ? (
                  <>
                    <span>Selesai</span>
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

        </motion.div>
      </>
    )}
  </AnimatePresence>

      {/* SPEECH BUBBLE (Glassmorphism & Precision Speech Tail + Contextual Greeting) */}
      {!isOpen && showSpeechBubble && (
        <div
          onClick={handleOpenModal}
          className="relative bg-white/95 backdrop-blur-md text-slate-800 p-3.5 px-4 rounded-2xl rounded-br-none shadow-2xl border border-blue-200/80 flex flex-col gap-1 max-w-[250px] cursor-pointer group hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-2"
        >
          {/* Header Badge */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-0.5">
            <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Prof Akun
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSpeechBubble(false);
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
              title="Tutup pesan"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {/* Contextual Text */}
          <p className="text-xs font-extrabold text-[#0D1B3D] leading-snug">
            {greeting.text}
          </p>
          {greeting.sub && (
            <p className="text-[11px] font-medium text-slate-500 leading-tight">
              {greeting.sub}
            </p>
          )}

          {/* Precision Speech Tail pointing directly down to Prof Akun mascot */}
          <div className="absolute -bottom-2 right-4 w-3.5 h-3.5 bg-white/95 border-r border-b border-blue-200/80 rotate-45 pointer-events-none group-hover:border-blue-400 transition-colors" />
        </div>
      )}

      {/* FLOATING AVATAR TRIGGER BUTTON (Uncropped Free Character Mascot) */}
      <button
        onClick={handleOpenModal}
        className="group relative flex flex-col items-center justify-center transition-all duration-300 cursor-pointer focus:outline-none select-none"
        title="Buka Prof Akun Asisten Portal"
      >
        {/* Soft Ground Shadow */}
        <div className="absolute -bottom-1 w-14 h-3 bg-slate-900/25 rounded-full blur-[3px] transition-all duration-300 group-hover:w-16 group-hover:bg-blue-600/40" />

        {/* Uncropped Free Mascot Image */}
        <div className="relative z-10 transition-transform duration-300 transform group-hover:-translate-y-2 group-hover:scale-110 active:scale-95">
          <img
            src={isOpen ? currentSlide.image : '/images/prof-akun-waving.png'}
            alt="Prof Akun Mascot"
            className="h-20 sm:h-24 w-auto object-contain filter drop-shadow-[0_8px_16px_rgba(13,27,61,0.25)] group-hover:drop-shadow-[0_14px_24px_rgba(37,99,235,0.35)] transition-all duration-300"
          />
        </div>
      </button>

    </motion.div>
  );
}
