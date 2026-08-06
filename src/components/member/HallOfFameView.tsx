'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Award,
  Calendar,
  Sparkles,
  ChevronDown,
  Quote,
  Briefcase,
  Users,
  Building2,
  X,
  ExternalLink,
  Crown,
  History,
  Medal,
  Star,
} from 'lucide-react';

interface Generation {
  id: number;
  slug: string;
  name: string;
  years: string;
  cabinetName?: string | null;
  visionMission?: string | null;
  logoUrl?: string | null;
  isActive: boolean;
  totalMembers?: number;
}

interface Milestone {
  id: number;
  generationId: number;
  eventDate: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  impactTag?: string | null;
  sortOrder: number;
}

interface Alumni {
  id: number;
  generationId: number;
  name: string;
  roleName: string;
  currentCompany?: string | null;
  photoUrl?: string | null;
  quote?: string | null;
  sortOrder: number;
}

interface Champion {
  id: number;
  generationId: number;
  awardType: 'member_of_the_year' | 'best_proker' | 'other';
  title: string;
  winnerName: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
}

export default function HallOfFameView() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [selectedGen, setSelectedGen] = useState<Generation | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [alumniBoard, setAlumniBoard] = useState<Alumni[]>([]);
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'leadership' | 'champions'>('timeline');

  // Lightbox Modal State
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  const fetchHallOfFame = async (genId?: number) => {
    setLoading(true);
    try {
      const url = genId ? `/api/hall-of-fame?generationId=${genId}` : '/api/hall-of-fame';
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        setGenerations(data.generations || []);
        setSelectedGen(data.selectedGeneration || null);
        setMilestones(data.milestones || []);
        setAlumniBoard(data.alumniBoard || []);
        setChampions(data.champions || []);
      }
    } catch (err) {
      console.error('Failed to load Hall of Fame:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHallOfFame();
  }, []);

  const handleGenChange = (genId: number) => {
    fetchHallOfFame(genId);
  };

  if (loading && !selectedGen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-20">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin" />
          <Trophy className="w-6 h-6 text-amber-400 absolute" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500">Memuat Hall of Fame & Sejarah Organisasi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ========================================================================= */}
      {/* 👑 HERO BANNER SECTION (#0D1B3D & GOLD ACCENTS) */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A1628] via-[#0D1B3D] to-[#14264E] text-white p-6 sm:p-10 shadow-2xl border border-amber-500/20">
        {/* Decorative Ambient Glowing Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header Badge & Period Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 shadow-inner">
                <Crown className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  Museum & Sejarah Organisasi
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
                  Hall of Fame & Legacy
                </h1>
              </div>
            </div>

            {/* Generation Period Dropdown / Selector */}
            <div className="w-full sm:w-auto min-w-0 flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15">
              <History className="w-4 h-4 text-amber-400 ml-2 shrink-0" />
              <select
                value={selectedGen?.id || ''}
                onChange={(e) => handleGenChange(Number(e.target.value))}
                className="w-full min-w-0 bg-transparent text-white font-semibold text-xs sm:text-sm px-2 py-1.5 outline-none cursor-pointer border-none focus:ring-0 truncate"
              >
                {generations.map((gen) => (
                  <option key={gen.id} value={gen.id} className="bg-slate-900 text-white py-2">
                    {gen.name} ({gen.years}) {gen.cabinetName ? `— ${gen.cabinetName}` : ''} {gen.isActive ? '⭐ Active' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cabinet & Generation Details */}
          {selectedGen && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">
                    {selectedGen.name}
                  </span>
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-white/10 text-white/90 border border-white/10">
                    {selectedGen.years}
                  </span>
                  {selectedGen.isActive && (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Periode Berjalan
                    </span>
                  )}
                </div>

                {selectedGen.cabinetName && (
                  <p className="text-lg font-bold text-amber-200/90 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    {selectedGen.cabinetName}
                  </p>
                )}

                {selectedGen.visionMission && (
                  <p className="text-sm text-slate-300 max-w-3xl leading-relaxed italic border-l-2 border-amber-400/50 pl-3">
                    "{selectedGen.visionMission}"
                  </p>
                )}
              </div>

              {/* Quick Stat Highlights */}
              <div className="grid grid-cols-3 gap-3 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-center">
                <div>
                  <p className="text-2xl font-black text-amber-400">{milestones.length}</p>
                  <p className="text-[11px] text-slate-300 font-medium">Milestone Utama</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-amber-400">{alumniBoard.length}</p>
                  <p className="text-[11px] text-slate-300 font-medium">BPH & Alumni</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-amber-400">{champions.length}</p>
                  <p className="text-[11px] text-slate-300 font-medium">Awards</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🎯 SECTION TABS (Timeline, Leadership Wall, Wall of Champions) */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-slate-900 text-amber-400 shadow-md shadow-slate-900/10'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          Garis Sejarah ({milestones.length})
        </button>
        <button
          onClick={() => setActiveTab('leadership')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'leadership'
              ? 'bg-slate-900 text-amber-400 shadow-md shadow-slate-900/10'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Crown className="w-4 h-4" />
          Leadership Legacy Wall ({alumniBoard.length})
        </button>
        <button
          onClick={() => setActiveTab('champions')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'champions'
              ? 'bg-slate-900 text-amber-400 shadow-md shadow-slate-900/10'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Wall of Champions ({champions.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INTERACTIVE VERTICAL TIMELINE */}
      {/* ========================================================================= */}
      {activeTab === 'timeline' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Rekam Jejak Momentum & Program Unggulan
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {selectedGen?.name}
            </span>
          </div>

          {milestones.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <History className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-base font-bold text-slate-700">Belum Ada Timeline Sejarah</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Belum ada dokumentasi milestone sejarah yang dimasukkan untuk {selectedGen?.name}. Admin dapat menambahkannya melalui Admin CMS.
              </p>
            </div>
          ) : (
            <div className="relative pl-8 sm:pl-12 space-y-10 my-6">
              {/* Glowing Vertical Line */}
              <div className="absolute left-3.5 sm:left-5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-amber-400 via-amber-400/60 to-amber-400/20 rounded-full" />

              {milestones.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  {/* Glowing Node Marker (Center Aligned on Line) */}
                  <div className="absolute -left-[18px] sm:-left-[28px] -translate-x-1/2 top-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 border-2 border-amber-400 text-amber-400 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-slate-900 transition-all z-10">
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                  </div>

                  {/* Card Content */}
                  <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-amber-400/50 transition-all space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.eventDate}
                      </div>

                      {item.impactTag && (
                        <span className="text-xs font-extrabold text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80">
                          {item.impactTag}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>

                    {/* Image Highlight with Lightbox Trigger */}
                    {item.imageUrl && (
                      <div
                        onClick={() => setLightboxImage({ url: item.imageUrl!, title: item.title })}
                        className="relative rounded-xl overflow-hidden cursor-pointer group/img border border-slate-200 max-h-80"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
                          <ExternalLink className="w-4 h-4" /> Klik untuk perbesar dokumentasi
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LEADERSHIP LEGACY WALL */}
      {/* ========================================================================= */}
      {activeTab === 'leadership' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Pimpinan & Demisioner BPH ({selectedGen?.name})
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Executive Alumni
            </span>
          </div>

          {alumniBoard.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-base font-bold text-slate-700">Belum Ada Data Alumni BPH</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Data pimpinan/alumni BPH untuk {selectedGen?.name} belum diinputkan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alumniBoard.map((alumni) => (
                <motion.div
                  key={alumni.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-3xl p-6 border border-amber-200/80 hover:border-amber-400 text-slate-900 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-5 relative overflow-hidden group"
                >
                  {/* Subtle Top Gold Accent Bar */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400" />

                  <div className="space-y-4">
                    {/* Header Photo & Details */}
                    <div className="flex items-center gap-4">
                      {alumni.photoUrl ? (
                        <img
                          src={alumni.photoUrl}
                          alt={alumni.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400/80 shadow-md group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-amber-700 font-extrabold text-xl">
                          {alumni.name.charAt(0)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 mb-1">
                          {alumni.roleName}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                          {alumni.name}
                        </h3>
                        {alumni.currentCompany && (
                          <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5 truncate font-medium">
                            <Briefcase className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            {alumni.currentCompany}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Legacy Quote */}
                    {alumni.quote && (
                      <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/70 relative">
                        <Quote className="w-4 h-4 text-amber-500/30 absolute top-2 right-2" />
                        <p className="text-xs text-slate-700 italic leading-relaxed font-medium">
                          "{alumni.quote}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span className="font-semibold">{selectedGen?.name}</span>
                    <span className="text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/70">
                      Demisioner
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WALL OF CHAMPIONS */}
      {/* ========================================================================= */}
      {activeTab === 'champions' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Penghargaan Pilihan Periode ({selectedGen?.name})
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Apresiasi Berkelanjutan
            </span>
          </div>

          {champions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <Medal className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-base font-bold text-slate-700">Belum Ada Wall of Champions</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Belum ada apresiasi Member of the Year atau Program Kerja Terbaik untuk {selectedGen?.name}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {champions.map((champion) => (
                <div
                  key={champion.id}
                  className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-md hover:shadow-xl transition-all space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          {champion.awardType === 'member_of_the_year'
                            ? 'Member of the Year'
                            : champion.awardType === 'best_proker'
                            ? 'Best Program Kerja'
                            : 'Award'}
                        </span>
                        <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                          {champion.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Pemenang / Penerima Award:
                    </p>
                    <p className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {champion.winnerName}
                    </p>
                  </div>

                  {champion.description && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {champion.description}
                    </p>
                  )}

                  {champion.imageUrl && (
                    <div
                      onClick={() => setLightboxImage({ url: champion.imageUrl!, title: champion.title })}
                      className="rounded-2xl overflow-hidden cursor-pointer h-48 border border-slate-200 relative group"
                    >
                      <img
                        src={champion.imageUrl}
                        alt={champion.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 🖼️ LIGHTBOX MODAL POP-UP */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {lightboxImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-white/20 shadow-2xl space-y-4 p-4"
            >
              <div className="flex items-center justify-between px-2 pt-2 border-b border-white/10 pb-3">
                <h4 className="text-sm font-bold text-white truncate max-w-md">
                  {lightboxImage.title}
                </h4>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black">
                <img
                  src={lightboxImage.url}
                  alt={lightboxImage.title}
                  className="max-h-[75vh] w-auto object-contain"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
