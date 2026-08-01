'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Award, GraduationCap, ChevronRight, TrendingUp, Users, ShieldCheck, Handshake, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeroProps {
  onExploreStructure: () => void;
  onExploreEvents: () => void;
  memberCount: number;
  activeGenYears: string;
}

export default function Hero({ onExploreStructure, onExploreEvents, memberCount, activeGenYears = '2025-2026' }: HeroProps) {
  const words = ['Digital.', 'Adaptif.', 'Berintegritas.', 'Kolaboratif.', 'Visioner.'];
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2800); // 2.8 seconds per word
    return () => clearInterval(interval);
  }, []);

  const floatAnimation = (delay: number) => ({
    animate: {
      y: [0, -8, 0],
    },
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay,
    }
  });

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32 bg-gradient-to-b from-white via-[#F8FBFF] to-[#EEF5FF]" id="hero-section">
      
      {/* 1. Texture Noise Tipis */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="hero-noise-filter-alt">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#hero-noise-filter-alt)" />
        </svg>
      </div>

      {/* 2. Abstract Radial Glowing Background Effects */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-200/20 to-indigo-100/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-indigo-100/15 to-blue-200/15 blur-3xl pointer-events-none" />

      {/* 3. Abstract Curved Lines (Top-Left & Bottom-Right) */}
      {/* Top-Left Curved Line */}
      <svg className="absolute -top-12 -left-12 w-[380px] h-[380px] sm:w-[450px] sm:h-[450px] pointer-events-none z-0 opacity-40" viewBox="0 0 450 450" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M -20 180 C 120 180, 220 80, 380 -20" stroke="url(#curve-grad-tl-alt)" strokeWidth="1.5" strokeDasharray="6 6" />
        <path d="M -20 230 C 140 230, 250 110, 420 10" stroke="url(#curve-grad-tl-alt)" strokeWidth="1.2" opacity="0.7" />
        <path d="M -20 280 C 160 280, 280 140, 450 40" stroke="url(#curve-grad-tl-alt)" strokeWidth="0.8" opacity="0.4" />
        <defs>
          <linearGradient id="curve-grad-tl-alt" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>

      {/* Bottom-Right Curved Line */}
      <svg className="absolute -bottom-12 -right-12 w-[380px] h-[380px] sm:w-[450px] sm:h-[450px] pointer-events-none z-0 opacity-40" viewBox="0 0 450 450" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 470 270 C 330 270, 230 370, 70 470" stroke="url(#curve-grad-br-alt)" strokeWidth="1.5" strokeDasharray="6 6" />
        <path d="M 470 220 C 310 220, 200 340, 30 440" stroke="url(#curve-grad-br-alt)" strokeWidth="1.2" opacity="0.7" />
        <path d="M 470 170 C 280 170, 170 300, -10 410" stroke="url(#curve-grad-br-alt)" strokeWidth="0.8" opacity="0.4" />
        <defs>
          <linearGradient id="curve-grad-br-alt" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>

      {/* 4. Pola Dot Grid Kecil (Top-Right & Bottom-Left) */}
      {/* Top-Right Dot Grid */}
      <div className="absolute top-6 right-6 sm:top-10 sm:right-10 w-40 h-40 sm:w-52 sm:h-52 pointer-events-none z-0 opacity-25">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="dot-grid-tr-alt" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.2" fill="#2563EB" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dot-grid-tr-alt)" />
        </svg>
      </div>

      {/* Bottom-Left Dot Grid */}
      <div className="absolute bottom-16 left-6 sm:bottom-24 sm:left-10 w-40 h-40 sm:w-52 sm:h-52 pointer-events-none z-0 opacity-25">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="dot-grid-bl-alt" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.2" fill="#2563EB" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dot-grid-bl-alt)" />
        </svg>
      </div>

      {/* 5. Jakarta Skyline Silhouette (Monas & Gedung-gedung dari Gambar Referensi) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <img
          src="/images/jakarta-skyline-bg.png"
          alt="Siluet Jakarta Skyline Monas"
          className="w-full h-full object-fill object-bottom opacity-90 select-none"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">

          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">

            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50/90 border border-blue-100/90 px-3.5 py-1.5 text-xs font-semibold text-blue-600 backdrop-blur-sm shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Generasi ke-2 • Periode {activeGenYears}</span>
            </div>

            <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:leading-[1.1] flex flex-col items-center lg:items-start">
              <span>Generasi Akuntan</span>
              <span className="relative inline-block h-[1.2em] w-full text-center lg:text-left">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={words[wordIndex]}
                    initial={{ opacity: 0, y: 15, rotateX: -20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, y: -15, rotateX: 20 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="absolute left-0 right-0 lg:right-auto lg:left-0 top-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 bg-clip-text text-transparent whitespace-nowrap"
                    style={{ transformOrigin: "center left" }}
                  >
                    {words[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            {/* Subtext description */}
            <p className="mx-auto lg:mx-0 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Selamat datang di portal resmi <strong>IAI Muda Wilayah DKI Jakarta</strong>.
              Kami menjadi wadah bagi generasi akuntan muda untuk mengembangkan kompetensi, memperluas jejaring profesional, dan berkolaborasi menghadapi transformasi dunia bisnis dan keuangan.
            </p>

            {/* Interactive Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                id="hero-explore-structure"
                onClick={onExploreStructure}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                Jelajahi Pengurus
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                id="hero-explore-events"
                onClick={onExploreEvents}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all cursor-pointer"
              >
                Kegiatan Terbaru
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <span className="block font-display text-2xl font-bold text-slate-900">{memberCount}</span>
                <span className="text-xs text-slate-500">Anggota Komite</span>
              </div>
              <div className="text-center lg:text-left">
                <span className="block font-display text-2xl font-bold text-emerald-600">100%</span>
                <span className="text-xs text-slate-500">Fokus Profesional</span>
              </div>
              <div className="text-center lg:text-left">
                <span className="block font-display text-2xl font-bold text-blue-600">5+</span>
                <span className="text-xs text-slate-500">Bidang Kerja</span>
              </div>
            </div>

          </div>

          {/* Hero Right Visual Element: Premium Glassmorphism Ecosystem Card */}
          <div className="mt-16 lg:mt-0 lg:col-span-5 relative flex justify-center items-center" id="hero-visual-card">
            
            {/* Soft Radial Gradient right behind illustration */}
            <div className="absolute -inset-8 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.16)_0%,rgba(99,102,241,0.08)_50%,transparent_75%)] rounded-full blur-2xl pointer-events-none" />

            <div className="relative w-full max-w-md lg:max-w-none h-[460px] sm:h-[500px] rounded-3xl border border-white/60 bg-white/30 backdrop-blur-xl shadow-2xl shadow-indigo-100/30 overflow-hidden flex items-center justify-center">
              
              {/* Connected lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
                <line x1="50%" y1="50%" x2="50%" y2="16%" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                <line x1="50%" y1="50%" x2="80%" y2="30%" stroke="rgba(147, 51, 234, 0.25)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                <line x1="50%" y1="50%" x2="80%" y2="70%" stroke="rgba(236, 72, 153, 0.25)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                <line x1="50%" y1="50%" x2="50%" y2="84%" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                <line x1="50%" y1="50%" x2="20%" y2="70%" stroke="rgba(45, 212, 191, 0.25)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                <line x1="50%" y1="50%" x2="20%" y2="30%" stroke="rgba(251, 191, 36, 0.25)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
              </svg>

              {/* Glowing pulses */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-blue-400/20 animate-ping opacity-60" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full border border-indigo-400/10 animate-pulse" />

              {/* CENTER NODE: Official IAI Muda Logo Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-2 border-2 sm:border-4 border-white shadow-xl shadow-blue-600/20 flex items-center justify-center z-20 hover:scale-105 transition-transform duration-300 cursor-pointer">
                <img
                  src="/images/iai-muda-logo-badge.png"
                  alt="IAI Muda Official Logo"
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
              </div>

              {/* Surrounding Node 1: Learning */}
              <motion.div
                variants={floatAnimation(0)}
                animate="animate"
                className="absolute top-[3%] left-1/2 -translate-x-1/2 flex flex-col items-center px-2 py-1.5 sm:py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-100/80 shadow-md shadow-slate-200/40 hover:shadow-lg hover:scale-105 transition-all duration-300 group w-28 sm:w-32 text-center z-10 cursor-pointer"
              >
                <div className="w-5 h-0.5 rounded-full bg-blue-500 mb-1" />
                <img src="/images/hero-icon-learning.png" alt="Learning Icon" className="w-5 h-5 sm:w-6 sm:h-6 object-contain group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight mt-0.5">Learning</span>
                <span className="text-[8px] sm:text-[8.5px] text-slate-500 leading-tight mt-0.5 max-w-[95px] sm:max-w-[105px]">Belajar tanpa henti, tumbuh tanpa batas.</span>
              </motion.div>

              {/* Surrounding Node 2: Networking */}
              <motion.div
                variants={floatAnimation(0.6)}
                animate="animate"
                className="absolute top-[18%] right-[1%] sm:right-[2%] flex flex-col items-center px-2 py-1.5 sm:py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-100/80 shadow-md shadow-slate-200/40 hover:shadow-lg hover:scale-105 transition-all duration-300 group w-28 sm:w-32 text-center z-10 cursor-pointer"
              >
                <div className="w-5 h-0.5 rounded-full bg-purple-500 mb-1" />
                <img src="/images/hero-icon-networking.png" alt="Networking Icon" className="w-5 h-5 sm:w-6 sm:h-6 object-contain group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight mt-0.5">Networking</span>
                <span className="text-[8px] sm:text-[8.5px] text-slate-500 leading-tight mt-0.5 max-w-[95px] sm:max-w-[105px]">Memperluas jejaring, membangun peluang.</span>
              </motion.div>

              {/* Surrounding Node 3: Leadership */}
              <motion.div
                variants={floatAnimation(1.2)}
                animate="animate"
                className="absolute bottom-[18%] right-[1%] sm:right-[2%] flex flex-col items-center px-2 py-1.5 sm:py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-100/80 shadow-md shadow-slate-200/40 hover:shadow-lg hover:scale-105 transition-all duration-300 group w-28 sm:w-32 text-center z-10 cursor-pointer"
              >
                <div className="w-5 h-0.5 rounded-full bg-pink-500 mb-1" />
                <img src="/images/hero-icon-leadership.png" alt="Leadership Icon" className="w-5 h-5 sm:w-6 sm:h-6 object-contain group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight mt-0.5">Leadership</span>
                <span className="text-[8px] sm:text-[8.5px] text-slate-500 leading-tight mt-0.5 max-w-[95px] sm:max-w-[105px]">Memimpin dengan integritas.</span>
              </motion.div>

              {/* Surrounding Node 4: Professional Growth */}
              <motion.div
                variants={floatAnimation(1.8)}
                animate="animate"
                className="absolute bottom-[3%] left-1/2 -translate-x-1/2 flex flex-col items-center px-2 py-1.5 sm:py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-100/80 shadow-md shadow-slate-200/40 hover:shadow-lg hover:scale-105 transition-all duration-300 group w-28 sm:w-32 text-center z-10 cursor-pointer"
              >
                <div className="w-5 h-0.5 rounded-full bg-sky-400 mb-1" />
                <img src="/images/hero-icon-growth.png" alt="Professional Growth Icon" className="w-5 h-5 sm:w-6 sm:h-6 object-contain group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight mt-0.5">Professional Growth</span>
                <span className="text-[8px] sm:text-[8.5px] text-slate-500 leading-tight mt-0.5 max-w-[95px] sm:max-w-[105px]">Terus berkembang & profesional.</span>
              </motion.div>

              {/* Surrounding Node 5: Collaboration */}
              <motion.div
                variants={floatAnimation(2.4)}
                animate="animate"
                className="absolute bottom-[18%] left-[1%] sm:left-[2%] flex flex-col items-center px-2 py-1.5 sm:py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-100/80 shadow-md shadow-slate-200/40 hover:shadow-lg hover:scale-105 transition-all duration-300 group w-28 sm:w-32 text-center z-10 cursor-pointer"
              >
                <div className="w-5 h-0.5 rounded-full bg-teal-400 mb-1" />
                <img src="/images/hero-icon-collaboration.png" alt="Collaboration Icon" className="w-5 h-5 sm:w-6 sm:h-6 object-contain group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight mt-0.5">Collaboration</span>
                <span className="text-[8px] sm:text-[8.5px] text-slate-500 leading-tight mt-0.5 max-w-[95px] sm:max-w-[105px]">Berkolaborasi untuk dampak besar.</span>
              </motion.div>

              {/* Surrounding Node 6: Innovation */}
              <motion.div
                variants={floatAnimation(3.0)}
                animate="animate"
                className="absolute top-[18%] left-[1%] sm:left-[2%] flex flex-col items-center px-2 py-1.5 sm:py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-100/80 shadow-md shadow-slate-200/40 hover:shadow-lg hover:scale-105 transition-all duration-300 group w-28 sm:w-32 text-center z-10 cursor-pointer"
              >
                <div className="w-5 h-0.5 rounded-full bg-amber-400 mb-1" />
                <img src="/images/hero-icon-innovation.png" alt="Innovation Icon" className="w-5 h-5 sm:w-6 sm:h-6 object-contain group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight mt-0.5">Innovation</span>
                <span className="text-[8px] sm:text-[8.5px] text-slate-500 leading-tight mt-0.5 max-w-[95px] sm:max-w-[105px]">Berpikir kreatif, cipta solusi.</span>
              </motion.div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
