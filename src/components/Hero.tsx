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

export default function Hero({ onExploreStructure, onExploreEvents, memberCount, activeGenYears }: HeroProps) {
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
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32 bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-slate-50" id="hero-section">
      {/* Background radial glowing effects */}
      <div className="absolute top-0 left-1/4 -z-10 h-96 w-96 rounded-full bg-blue-200/20 blur-3xl" />
      <div className="absolute bottom-10 right-1/4 -z-10 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">

          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">

            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3.5 py-1.5 text-xs font-semibold text-blue-600">
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
                Eksplor Pengurus Komite
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                id="hero-explore-events"
                onClick={onExploreEvents}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all cursor-pointer"
              >
                Agenda & Webinar Terbaru
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
            
            {/* Ambient Background Glow inside the container */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl opacity-60 pointer-events-none" />

            <div className="relative w-full max-w-md lg:max-w-none h-[420px] rounded-3xl border border-white/40 bg-white/20 backdrop-blur-xl shadow-2xl shadow-indigo-100/30 overflow-hidden flex items-center justify-center">
              
              {/* Connected lines from center (50%, 50%) to each point */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
                <line x1="50%" y1="50%" x2="50%" y2="18%" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                <line x1="50%" y1="50%" x2="78%" y2="34%" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                <line x1="50%" y1="50%" x2="78%" y2="66%" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                <line x1="50%" y1="50%" x2="50%" y2="82%" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                <line x1="50%" y1="50%" x2="22%" y2="66%" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                <line x1="50%" y1="50%" x2="22%" y2="34%" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
              </svg>

              {/* Glowing pulses around center node */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-blue-400/20 animate-ping opacity-60" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-indigo-400/10 animate-pulse" />

              {/* CENTER NODE: IAI Muda */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 border-4 border-white flex flex-col items-center justify-center shadow-xl shadow-blue-600/30 text-white z-20 hover:scale-105 transition-transform duration-300 cursor-pointer">
                <span className="text-[10px] font-bold text-blue-100 tracking-widest leading-none">IAI</span>
                <span className="text-base font-extrabold tracking-wider mt-1 leading-none">Muda</span>
              </div>

              {/* Surrounding Node 1: Learning */}
              <motion.div
                variants={floatAnimation(0)}
                animate="animate"
                className="absolute top-[8%] left-1/2 -translate-x-1/2 flex flex-col items-center justify-center p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-blue-500/15 hover:border-blue-400/40 hover:bg-white/80 transition-all duration-300 group cursor-pointer w-28 text-center z-10"
              >
                <GraduationCap className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] font-bold text-slate-700 mt-1.5 tracking-wide whitespace-nowrap">Learning</span>
              </motion.div>

              {/* Surrounding Node 2: Networking */}
              <motion.div
                variants={floatAnimation(0.6)}
                animate="animate"
                className="absolute top-[26%] right-[6%] flex flex-col items-center justify-center p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-blue-500/15 hover:border-blue-400/40 hover:bg-white/80 transition-all duration-300 group cursor-pointer w-28 text-center z-10"
              >
                <Users className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] font-bold text-slate-700 mt-1.5 tracking-wide whitespace-nowrap">Networking</span>
              </motion.div>

              {/* Surrounding Node 3: Leadership */}
              <motion.div
                variants={floatAnimation(1.2)}
                animate="animate"
                className="absolute bottom-[26%] right-[6%] flex flex-col items-center justify-center p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-blue-500/15 hover:border-blue-400/40 hover:bg-white/80 transition-all duration-300 group cursor-pointer w-28 text-center z-10"
              >
                <Award className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] font-bold text-slate-700 mt-1.5 tracking-wide whitespace-nowrap">Leadership</span>
              </motion.div>

              {/* Surrounding Node 4: Professional Growth */}
              <motion.div
                variants={floatAnimation(1.8)}
                animate="animate"
                className="absolute bottom-[8%] left-1/2 -translate-x-1/2 flex flex-col items-center justify-center p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-blue-500/15 hover:border-blue-400/40 hover:bg-white/80 transition-all duration-300 group cursor-pointer w-36 text-center z-10"
              >
                <TrendingUp className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] font-bold text-slate-700 mt-1.5 tracking-wide whitespace-nowrap">Professional Growth</span>
              </motion.div>

              {/* Surrounding Node 5: Collaboration */}
              <motion.div
                variants={floatAnimation(2.4)}
                animate="animate"
                className="absolute bottom-[26%] left-[6%] flex flex-col items-center justify-center p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-blue-500/15 hover:border-blue-400/40 hover:bg-white/80 transition-all duration-300 group cursor-pointer w-30 text-center z-10"
              >
                <Handshake className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] font-bold text-slate-700 mt-1.5 tracking-wide whitespace-nowrap">Collaboration</span>
              </motion.div>

              {/* Surrounding Node 6: Innovation */}
              <motion.div
                variants={floatAnimation(3.0)}
                animate="animate"
                className="absolute top-[26%] left-[6%] flex flex-col items-center justify-center p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-blue-500/15 hover:border-blue-400/40 hover:bg-white/80 transition-all duration-300 group cursor-pointer w-28 text-center z-10"
              >
                <Lightbulb className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-[10px] font-bold text-slate-700 mt-1.5 tracking-wide whitespace-nowrap">Innovation</span>
              </motion.div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
