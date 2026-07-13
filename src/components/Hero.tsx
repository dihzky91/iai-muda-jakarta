/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, GraduationCap, ChevronRight, TrendingUp, Users, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onExploreStructure: () => void;
  onExploreEvents: () => void;
  memberCount: number;
  activeGenYears: string;
}

export default function Hero({ onExploreStructure, onExploreEvents, memberCount, activeGenYears }: HeroProps) {
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

            {/* Display Heading */}
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:leading-[1.1]">
              Membentuk Akuntan Muda <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                Cerdas, Digital & Berintegritas
              </span>
            </h1>

            {/* Subtext description */}
            <p className="mx-auto lg:mx-0 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Selamat datang di portal resmi <strong>Ikatan Akuntan Indonesia (IAI) Muda Wilayah DKI Jakarta</strong>. 
              Wadah sinergi, kolaborasi, dan akselerasi kompetensi profesional bagi talenta akuntansi muda guna menjawab tantangan kecerdasan buatan, keberlanjutan bisnis, dan masa depan keuangan global.
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

          {/* Hero Right Visual Element: Youth Accounting Dashboard Mockup */}
          <div className="mt-16 lg:mt-0 lg:col-span-5 relative" id="hero-visual-card">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50">
              
              {/* Card top bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">iai_muda_dki_analytics.json</span>
              </div>

              {/* Graphic stats */}
              <div className="space-y-4 pt-6">
                
                {/* Metric Item 1 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Target Sertifikasi CA</h4>
                      <p className="text-[10px] text-slate-500">Akuntan Muda Wilayah Jakarta</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-600">+45%</span>
                    <p className="text-[9px] text-slate-400 font-medium">YoY Growth</p>
                  </div>
                </div>

                {/* Metric Item 2 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Pendidikan & Edukasi</h4>
                      <p className="text-[10px] text-slate-500">Implementasi PSAK & IFRS</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-blue-600">800+</span>
                    <p className="text-[9px] text-slate-400 font-medium">Partisipan Webinar</p>
                  </div>
                </div>

                {/* Metric Item 3 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Kode Etik Profesional</h4>
                      <p className="text-[10px] text-slate-500">Integritas Standar Tinggi</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">PASSED</span>
                  </div>
                </div>

                {/* Nice tagline visual */}
                <div className="pt-2 text-center">
                  <p className="text-[11px] font-mono text-slate-400 italic">
                    "Prepared for the future, anchored in integrity."
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
