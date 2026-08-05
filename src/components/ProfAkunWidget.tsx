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

const getContextualGreeting = (pathname: string | null, isMounted: boolean): { text: string; sub?: string } => {
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

  if (!isMounted) {
    return { text: 'Hai Pengurus! ☕', sub: 'Prof Akun siap membantu kamu!' };
  }

  const currentHour = new Date().getHours();

  // Time-based greetings
  if (currentHour >= 4 && currentHour < 12) {
    return { text: 'Selamat pagi, Pengurus! ☕', sub: 'Siap produktif? Prof siap bantu!' };
  } else if (currentHour >= 12 && currentHour < 18) {
    return { text: 'Selamat siang, Pengurus! ☀️', sub: 'Ada info & kegiatan menarik hari ini!' };
  } else {
    return { text: 'Selamat malam, Pengurus! 🌙', sub: 'Butuh dokumen atau info kegiatan?' };
  }
};

// Easter Egg Reaction Quotes Pool
const EASTER_EGG_QUOTES = [
  { text: 'Aduh! Prof kaget... 🦉', sub: 'Tapi Prof siap bantu kepengurusan kamu!' },
  { text: 'Semangat Akuntan Muda! ☕', sub: 'Jangan lupa rehat sejenak di tengah kesibukan.' },
  { text: 'Cerdas • Integritas • Solutif! ✨', sub: 'Tagline kebanggaan IAI Muda DKI Jakarta.' },
  { text: 'Akuntansi itu seru! 📊', sub: 'Apalagi kalau dikerjakan bareng sesama pengurus.' },
  { text: 'Poin kamu terus bertambah! 🏆', sub: 'Pantau posisi kamu di Leaderboard portal.' },
  { text: 'Keren banget semangatnya! 🚀', sub: 'Setiap kontribusimu berdampak besar bagi organisasi.' },
  { text: 'Ada info agenda seru minggu ini! 📅', sub: 'Klik Prof untuk menjelajahi event terbaru.' },
  { text: 'Pengurus IAI Muda Jakarta TOP! 🌟', sub: 'Selalu berinovasi & siap melayani.' },
];

export default function ProfAkunWidget() {
  const pathname = usePathname();
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [dragBounds, setDragBounds] = useState({ left: -300, right: 0, top: -500, bottom: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Interactive Mascot State (Easter Eggs & Reactions)
  const [tapCount, setTapCount] = useState(0);
  const [reactionQuote, setReactionQuote] = useState<{ text: string; sub?: string } | null>(null);
  const [isBouncing, setIsBouncing] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);

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
    setReactionQuote(null);
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

  // Interactive Mascot Click / Tap Reaction Handler
  const handleMascotClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If modal is open, toggle close
    if (isOpen) {
      handleCloseModal();
      return;
    }

    const nextTap = tapCount + 1;
    setTapCount(nextTap);
    setShowSpeechBubble(true);

    // Spawn Sparkle Burst Particles
    const newSparkleId = Date.now();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const relativeX = e.clientX - rect.left - 20;
    const relativeY = e.clientY - rect.top - 20;

    setSparkles((prev) => [...prev.slice(-4), { id: newSparkleId, x: relativeX, y: relativeY }]);
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== newSparkleId));
    }, 800);

    // Easter Egg Spin every 5 taps
    if (nextTap % 5 === 0) {
      setIsSpinning(true);
      setReactionQuote({
        text: '🎉 WOW! Easter Egg Prof Akun Terbuka! 🌟',
        sub: `Kamu sudah men-tap Prof Akun sebanyak ${nextTap}x! Kamu keren!`,
      });
      setTimeout(() => setIsSpinning(false), 800);
    } else {
      // Normal Bounce & Random Quote
      setIsBouncing(true);
      const randomQuote = EASTER_EGG_QUOTES[Math.floor(Math.random() * EASTER_EGG_QUOTES.length)];
      setReactionQuote(randomQuote);
      setTimeout(() => setIsBouncing(false), 500);
    }
  };

  const currentSlide = GUIDE_SLIDES[currentSlideIndex];
  const greeting = reactionQuote || getContextualGreeting(pathname, isMounted);
  const isReaction = !!reactionQuote;

  return (
    <motion.div
      ref={widgetRef}
      drag
      dragConstraints={dragBounds}
      dragElastic={0.1}
      dragMomentum={false}
      whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
      className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 flex flex-col items-end gap-3 font-sans select-none max-w-[calc(100vw-2rem)] cursor-grab active:cursor-grabbing"
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
              className="sm:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-md z-40 transition-opacity"
            />

            {/* Modal Box: Bottom Sheet on Mobile, Floating Card on Desktop */}
            <motion.div
              initial={{ opacity: 0, y: 35, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 25, scale: 0.95 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed sm:relative inset-x-0 bottom-0 sm:bottom-auto sm:inset-auto z-50 w-full sm:w-[380px] max-w-full sm:max-w-[380px] bg-white/95 backdrop-blur-2xl rounded-t-[2.25rem] sm:rounded-[2rem] shadow-[0_25px_70px_-15px_rgba(13,27,61,0.45)] border-t sm:border border-blue-100/90 overflow-hidden ring-1 ring-slate-900/5"
            >
              {/* Mobile Drag Handle Bar */}
              <div className="sm:hidden flex justify-center pt-3 pb-1 bg-gradient-to-r from-[#070E20] via-[#0D1B3D] to-[#1E293B]">
                <div className="w-12 h-1.5 bg-white/30 rounded-full backdrop-blur-sm" />
              </div>

              {/* Glassmorphism Cyber-Navy Header Card */}
              <div className="bg-gradient-to-r from-[#070E20] via-[#0D1B3D] to-[#1A2E5A] text-white p-5 relative overflow-hidden border-b border-white/10">
                {/* Ambient Glowing Radial Mesh Background */}
                <div className="absolute -right-8 -bottom-10 w-36 h-36 bg-blue-500/25 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -left-6 -top-8 w-28 h-28 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    {/* Glowing AI Avatar Icon Frame */}
                    <div className="relative group">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/30 to-indigo-600/30 border border-blue-400/40 flex items-center justify-center shrink-0 shadow-inner backdrop-blur-md">
                        <Sparkles className="h-5.5 w-5.5 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0D1B3D]"></span>
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base tracking-tight text-white drop-shadow-sm">Prof Akun</h3>
                        <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md text-blue-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/15 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Online
                        </span>
                      </div>
                      <p className="text-[11.5px] text-blue-200/90 font-medium">Asisten Digital IAI Muda Jakarta</p>
                    </div>
                  </div>

                  {/* Close Button with Micro Hover Animation */}
                  <button
                    onClick={handleCloseModal}
                    aria-label="Tutup modal Prof Akun"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white/80 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer backdrop-blur-sm border border-white/10"
                    title="Tutup"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Progress Segment Indicator Bar */}
                <div className="mt-4 flex gap-1.5 relative z-10">
                  {GUIDE_SLIDES.map((_, idx) => (
                    <div
                      key={idx}
                      className="h-1 flex-1 rounded-full overflow-hidden bg-white/15 backdrop-blur-sm"
                    >
                      <motion.div
                        initial={false}
                        animate={{
                          width: idx <= currentSlideIndex ? '100%' : '0%',
                          backgroundColor: idx === currentSlideIndex ? '#60A5FA' : idx < currentSlideIndex ? '#3B82F6' : 'transparent',
                        }}
                        transition={{ duration: 0.3 }}
                        className="h-full rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Body Content with Smooth Dynamic Slide Animations */}
              <div className="p-6 bg-gradient-to-b from-blue-50/40 via-white to-slate-50/50">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide.id}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    {/* Category Badge & Step Counter */}
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="inline-flex items-center gap-2 text-xs font-extrabold text-blue-700 bg-gradient-to-r from-blue-100/90 to-indigo-100/90 px-3.5 py-1.5 rounded-xl border border-blue-200/80 shadow-xs backdrop-blur-sm">
                        {currentSlide.icon}
                        <span>{currentSlide.badge}</span>
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {currentSlideIndex + 1} / {GUIDE_SLIDES.length}
                      </span>
                    </div>

                    {/* Slide Title & Subtitle */}
                    <h4 className="text-lg font-black text-[#0D1B3D] tracking-tight leading-snug mb-1">
                      {currentSlide.title}
                    </h4>
                    <p className="text-xs font-bold text-blue-600 mb-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {currentSlide.subtitle}
                    </p>
                    
                    {/* Description Card */}
                    <div className="p-3.5 bg-white/80 rounded-2xl border border-slate-200/60 shadow-xs mb-4">
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {currentSlide.description}
                      </p>
                    </div>

                    {/* Interactive Action CTA Button */}
                    {currentSlide.actionText && (
                      <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href={currentSlide.actionHref}
                        target={currentSlide.actionHref?.startsWith('http') ? '_blank' : '_self'}
                        rel="noreferrer"
                        className="mb-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-blue-500/25 transition-all group cursor-pointer"
                      >
                        <span>{currentSlide.actionText}</span>
                        <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </motion.a>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Pagination Controls & Navigation Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                  
                  {/* Previous Button */}
                  <button
                    onClick={handlePrevSlide}
                    disabled={currentSlideIndex === 0}
                    aria-label="Kembali ke slide sebelumnya"
                    className={`flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                      currentSlideIndex === 0
                        ? 'text-slate-400 bg-slate-100/50 cursor-not-allowed'
                        : 'text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 cursor-pointer'
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Kembali</span>
                  </button>

                  {/* Dot Indicators */}
                  <div className="flex items-center gap-1.5">
                    {GUIDE_SLIDES.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlideIndex(idx)}
                        aria-label={`Ke slide ${idx + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === currentSlideIndex
                            ? 'w-5 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm'
                            : 'w-2 bg-slate-200 hover:bg-slate-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Next / Finish Button */}
                  <button
                    onClick={handleNextSlide}
                    aria-label={currentSlideIndex === GUIDE_SLIDES.length - 1 ? "Selesai panduan" : "Lanjut ke slide berikutnya"}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#0D1B3D] to-[#1E293B] hover:from-[#070E20] hover:to-[#0D1B3D] px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
                  >
                    {currentSlideIndex === GUIDE_SLIDES.length - 1 ? (
                      <>
                        <span>Selesai</span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      </>
                    ) : (
                      <>
                        <span>Lanjut</span>
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                </div>

              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SPEECH BUBBLE (Glassmorphism & Dynamic Reaction Accent) */}
      {!isOpen && showSpeechBubble && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={handleOpenModal}
          className={`relative backdrop-blur-xl text-slate-800 p-4 px-4.5 rounded-2xl rounded-br-none shadow-[0_15px_35px_rgba(13,27,61,0.18)] flex flex-col gap-1.5 max-w-[260px] cursor-pointer group transition-all duration-300 transform hover:-translate-y-1 ${
            isReaction
              ? 'bg-amber-50/95 border-2 border-amber-300 ring-4 ring-amber-400/20'
              : 'bg-white/95 border border-blue-200/80 hover:border-blue-400'
          }`}
        >
          {/* Header Badge */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100/90 pb-1.5">
            <span className={`flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-wider ${
              isReaction ? 'text-amber-700' : 'text-blue-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isReaction ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
              {isReaction ? '✨ Reaksi Prof' : 'Prof Akun'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSpeechBubble(false);
                setReactionQuote(null);
              }}
              aria-label="Tutup pesan"
              className="text-slate-500 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
              title="Tutup pesan"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Contextual / Reaction Text */}
          <p className="text-xs font-black text-[#0D1B3D] leading-snug">
            {greeting.text}
          </p>
          {greeting.sub && (
            <p className="text-[11px] font-semibold text-slate-600 leading-tight">
              {greeting.sub}
            </p>
          )}

          {/* Precision Speech Tail */}
          <div className={`absolute -bottom-2 right-4 w-3.5 h-3.5 border-r border-b rotate-45 pointer-events-none transition-colors ${
            isReaction ? 'bg-amber-50 border-amber-300' : 'bg-white/95 border-blue-200/80 group-hover:border-blue-400'
          }`} />
        </motion.div>
      )}

      {/* FLOATING AVATAR TRIGGER BUTTON */}
      <div className="relative">
        
        {/* Floating Sparkle Particles Burst */}
        <AnimatePresence>
          {sparkles.map((sp) => (
            <motion.div
              key={sp.id}
              initial={{ opacity: 1, y: 0, scale: 0.5, x: sp.x }}
              animate={{ opacity: 0, y: -50, scale: 1.4, x: sp.x + (Math.random() * 24 - 12) }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
              className="absolute top-0 pointer-events-none z-30"
            >
              <Sparkles className="h-5.5 w-5.5 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)]" />
            </motion.div>
          ))}
        </AnimatePresence>

        <button
          onClick={handleMascotClick}
          aria-label="Buka bantuan Prof Akun"
          className="group relative flex flex-col items-center justify-center transition-all duration-300 cursor-pointer focus:outline-none select-none"
          title="Klik Prof Akun untuk Reaksi / Buka Panduan"
        >
          {/* Soft Ground Glow & Shadow */}
          <div className="absolute -bottom-1 w-16 h-3 bg-[#0D1B3D]/30 rounded-full blur-[4px] transition-all duration-300 group-hover:w-18 group-hover:bg-blue-600/50" />

          {/* Uncropped Free Mascot Image with Framer Motion Bounce / Spin Physics */}
          <motion.div
            animate={{
              scale: isBouncing ? [1, 1.25, 0.9, 1.12, 1] : 1,
              rotate: isSpinning ? [0, 360] : isBouncing ? [-10, 10, -5, 5, 0] : 0,
              y: isBouncing ? [0, -18, 0, -8, 0] : 0,
            }}
            transition={{
              duration: isSpinning ? 0.75 : 0.45,
              ease: 'easeOut',
            }}
            className="relative z-10 transition-transform duration-300 transform group-hover:-translate-y-2.5 group-hover:scale-110 active:scale-95"
          >
            <img
              src={isOpen ? currentSlide.image : '/images/prof-akun-waving.png'}
              alt="Prof Akun Mascot"
              width={104}
              height={104}
              className="h-22 sm:h-26 w-auto object-contain filter drop-shadow-[0_10px_20px_rgba(13,27,61,0.3)] group-hover:drop-shadow-[0_16px_28px_rgba(37,99,235,0.4)] transition-all duration-300"
            />
          </motion.div>
        </button>

      </div>

    </motion.div>
  );
}
