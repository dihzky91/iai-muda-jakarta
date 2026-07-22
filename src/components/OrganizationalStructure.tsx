'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Generation, Member, Settings } from '../types';
import { Mail, Linkedin, Users, Filter, Award, History, Search, X, Clock, ImageOff, Camera } from 'lucide-react';

interface OrganizationalStructureProps {
  generations: Generation[];
  members: Member[];
  settings?: Settings;
}

export default function OrganizationalStructure({ generations, members, settings }: OrganizationalStructureProps) {
  // Find current active generation
  const activeGen = useMemo(() => generations.find(g => g.isActive) || generations[0] || null, [generations]);
  
  // State for selected generation in view (defaults to current active generation)
  const [selectedGenId, setSelectedGenId] = useState<number>(activeGen?.id || 0);

  // Sync selectedGenId when generations data loads from DB (replaces fallback negative IDs)
  useEffect(() => {
    if (activeGen && activeGen.id > 0) {
      setSelectedGenId(activeGen.id);
    }
  }, [activeGen?.id]);
  
  // State for division filter
  const [selectedDivision, setSelectedDivision] = useState<string>('all');

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected member for profile modal
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Banner dismiss state — reset when division changes
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);

  // ── Division group photo mapping ─────────────────────────────────────────
  // Parsing dari settings jika ada, fallback ke default map
  const divisionPhotoMap: Record<string, string> = useMemo(() => {
    try {
      if (settings?.divisionPhotos) {
        return JSON.parse(settings.divisionPhotos);
      }
    } catch (e) {
      console.error('Failed to parse divisionPhotos:', e);
    }
    return {
      'Badan Pengurus Harian (BPH)': '',
      'Bidang Edukasi & Sertifikasi': '',
      'Bidang Hubungan Masyarakat': '',
      'Bidang Kewirausahaan & Kemitraan': '',
      'Bidang Media & Desain Kreatif': '',
    };
  }, [settings?.divisionPhotos]);

  // Current division photo URL (empty string if not mapped or 'all')
  const divisionPhoto = selectedDivision !== 'all' ? (divisionPhotoMap[selectedDivision] ?? '') : '';

  // Show banner only when a specific division is selected and not dismissed
  const showBanner = selectedDivision !== 'all' && !bannerDismissed;

  // Selected Generation details
  const selectedGen = useMemo(() => {
    return generations.find(g => g.id === selectedGenId) || activeGen || generations[0] || null;
  }, [generations, selectedGenId, activeGen]);

  // Filter members of selected generation
  const filteredByGenMembers = useMemo(() => {
    return members.filter(m => m.generationId === selectedGenId);
  }, [members, selectedGenId]);

  // Extract unique divisions for this generation
  const divisions = useMemo(() => {
    const divs = new Set<string>();
    filteredByGenMembers.forEach(m => {
      if (m.division) divs.add(m.division);
    });
    return ['all', ...Array.from(divs)];
  }, [filteredByGenMembers]);

  // Final filtered list of members based on division and search query
  const finalMembersList = useMemo(() => {
    return filteredByGenMembers.filter(m => {
      const matchDivision = selectedDivision === 'all' || m.division === selectedDivision;
      const matchSearch = (m.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (m.position ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchDivision && matchSearch;
    });
  }, [filteredByGenMembers, selectedDivision, searchQuery]);

  // Count members in selected division (placed after finalMembersList)
  const divisionMemberCount = finalMembersList.length;

  const selectedMemberGen = useMemo(() => {
    if (!selectedMember) return null;
    return generations.find(g => g.id === selectedMember.generationId);
  }, [generations, selectedMember]);

  // Detect if this person has served in multiple generations (same name across records)
  const memberHistory = useMemo(() => {
    if (!selectedMember) return [];
    const normalizedName = (selectedMember.name ?? '').trim().toLowerCase();
    // Find all records matching this name across ALL generations
    const allRecords = members.filter(
      m => (m.name ?? '').trim().toLowerCase() === normalizedName
    );
    // Map each record to its generation details, sorted by generation id ascending
    return allRecords
      .map(m => ({
        memberId: m.id,
        position: m.position,
        division: m.division,
        gen: generations.find(g => g.id === m.generationId),
      }))
      .filter(r => r.gen != null)
      .sort((a, b) => (a.gen!.id ?? 0) - (b.gen!.id ?? 0));
  }, [selectedMember, members, generations]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0, moved: false });

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    dragState.current = {
      isDown: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      moved: false,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    const ds = dragState.current;
    if (!ds.isDown || !el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - ds.startX) * 1.5;
    if (Math.abs(walk) > 5) ds.moved = true;
    el.scrollLeft = ds.scrollLeft - walk;
  };

  const handleDragEnd = () => {
    dragState.current.isDown = false;
  };

  const handleDivClick = (e: React.MouseEvent) => {
    if (dragState.current.moved) {
      e.stopPropagation();
    }
  };

  return (
    <div className="space-y-12 py-8" id="organizational-structure-section">
      
      {/* Upper header section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Kepengurusan IAI Muda DKI Jakarta
        </h2>
        <p className="text-slate-600 text-sm sm:text-base">
          Mengenal jajaran pemimpin akuntan muda yang berdedikasi tinggi mengemban amanah kepengurusan IAI Muda DKI Jakarta.
        </p>
      </div>

      {/* Generation selector (Archive/History section) */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto shadow-sm">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 tracking-wider uppercase block">
            Pilih Periode Kepengurusan (Arsip Sejarah)
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {generations.map((g) => (
              <button
                key={g.id}
                id={`gen-select-${g.id}`}
                onClick={() => {
                  setSelectedGenId(g.id);
                  setSelectedDivision('all');
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  selectedGenId === g.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/10'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-100'
                }`}
              >
                <History className="h-3.5 w-3.5" />
                <span>{g.name} ({g.years})</span>
                {g.isActive && (
                  <span className="ml-1 px-1.5 py-0.5 text-[9px] uppercase font-bold rounded bg-emerald-500 text-white animate-pulse">
                    Aktif
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic statistics block for the selected generation */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 self-start md:self-auto">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-slate-900">
              {filteredByGenMembers.length} Orang
            </div>
            <p className="text-[11px] text-slate-500 font-semibold font-sans">
                    Total Pengurus {selectedGen?.name || '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Division filter bar */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Division filters tabs */}
          <div ref={scrollRef}
               onMouseDown={handleMouseDown}
               onMouseMove={handleMouseMove}
               onMouseUp={handleDragEnd}
               onMouseLeave={handleDragEnd}
               onClickCapture={handleDivClick}
               className="flex items-center gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none cursor-grab active:cursor-grabbing select-none"
               style={{ maskImage: 'linear-gradient(to right, transparent 6px, black 20px, black 90%, transparent 98%)', WebkitMaskImage: 'linear-gradient(to right, transparent 6px, black 20px, black 90%, transparent 98%)' }}>
            <span className="shrink-0 text-xs font-bold text-slate-600 flex items-center gap-1.5 whitespace-nowrap bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
              <Filter className="h-3.5 w-3.5 text-blue-600" />
              <span>Saring Divisi:</span>
            </span>
            {divisions.map((div) => (
              <button
                key={div}
                onClick={() => {
                  setSelectedDivision(div);
                  setBannerDismissed(false); // reset banner on division change
                }}
                className={`snap-start shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedDivision === div
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                {div === 'all' ? 'Semua Bidang' : div}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau jabatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-white border border-slate-200 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

        </div>

        {/* ── Division Hero Banner ──────────────────────────────────────── */}
        {showBanner && (
          <div
            className="relative w-full overflow-hidden rounded-3xl border border-slate-200 shadow-md"
            style={{ animation: 'divisionBannerIn 0.35s cubic-bezier(0.22,1,0.36,1) both' }}
          >
            {divisionPhoto ? (
              /* Foto asli divisi */
              <div className="relative h-52 sm:h-64">
                <img
                  src={divisionPhoto}
                  alt={`Foto group ${selectedDivision}`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-top"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-white/70" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Foto Divisi</span>
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-extrabold text-white leading-tight">
                      {selectedDivision}
                    </h3>
                    <p className="text-xs font-semibold text-white/80">
                      {divisionMemberCount} Anggota Pengurus
                    </p>
                  </div>
                  <button
                    onClick={() => setBannerDismissed(true)}
                    className="flex-shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all"
                    title="Tutup banner"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Placeholder — foto belum diisi */
              <div className="relative h-40 sm:h-48 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50 flex flex-col items-center justify-center gap-3">
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-30"
                  style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 75% 50%, #3b82f6 0%, transparent 50%)' }}
                />
                <div className="relative z-10 flex flex-col items-center gap-2 text-center px-6">
                  <div className="h-12 w-12 rounded-2xl bg-white/80 border border-slate-200 flex items-center justify-center shadow-sm">
                    <ImageOff className="h-6 w-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{selectedDivision}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Foto group belum tersedia · {divisionMemberCount} Anggota
                    </p>
                    <p className="text-[11px] text-blue-600 font-semibold mt-1">
                      Tambahkan URL foto via Admin CMS → Pengaturan
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setBannerDismissed(true)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/60 hover:bg-white text-slate-500 hover:text-slate-700 transition-all"
                  title="Tutup banner"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Members grid layout */}
        {finalMembersList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
            {finalMembersList.map((m) => {
              const isBPH = m.division?.includes('BPH') ?? false;
              const isKetum = m.position?.includes('Ketua') ?? false;
              return (
                <div 
                  key={m.id}
                  id={`member-card-${m.id}`}
                  onClick={() => setSelectedMember(m)}
                  className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 cursor-pointer hover:shadow-md ${
                    isBPH 
                      ? 'bg-white border-blue-100 shadow-sm hover:border-blue-200'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {/* Subtle hover background decoration */}
                  <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-colors" />

                  {/* Profile Image container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
                    {m.imageUrl ? (
                      <img 
                        src={m.imageUrl} 
                        alt={m.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100">
                        <Users className="h-12 w-12 text-slate-400" />
                      </div>
                    )}
                    {/* Position Label Tag */}
                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase ring-1 ${
                        isBPH
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                          : 'bg-blue-50 text-blue-700 ring-blue-100'
                      }`}>
                        {m.position}
                      </span>
                    </div>
                  </div>

                  {/* Description Info */}
                  <div className="p-5 space-y-3 relative z-10">
                    <div>
                      <h3 className="font-display font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                        {m.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {m.division ?? '—'}
                      </p>
                      {m.university && (
                        <p className="text-[11px] text-slate-400 mt-1 italic font-medium">
                          {m.university}
                        </p>
                      )}
                    </div>

                     {/* Email and LinkedIn handles */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-mono font-semibold text-slate-400 max-w-[70%] truncate">
                        {m.email || 'komite@iai-dki.or.id'}
                      </span>
                      <div className="flex items-center gap-2">
                        {m.email && (
                          <a 
                            href={`mailto:${m.email}`} 
                            title="Kirim Email"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 hover:text-blue-600 hover:bg-slate-50 rounded transition-all"
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                        <a 
                          href={m.linkedinUrl || "https://linkedin.com"} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          title="Kunjungi LinkedIn"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 hover:text-blue-600 hover:bg-slate-50 rounded transition-all"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 text-sm font-semibold">Pengurus tidak ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
          </div>
        )}
      </div>

      {/* Profile Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedMember(null)}>
          <div 
            className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-100 transform transition-all duration-300 scale-100 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header/Banner — taller with decorative circles */}
            <div className="h-36 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 relative overflow-hidden">
              <div className="absolute -top-8 -left-8 h-40 w-40 rounded-full bg-white/5" />
              <div className="absolute -bottom-12 -right-8 h-48 w-48 rounded-full bg-white/5" />
              <div className="absolute top-4 right-14 h-16 w-16 rounded-full bg-white/5" />
              <button 
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all z-10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="px-6 pb-8 relative">
              {/* Photo — centered, large, overlapping header */}
              <div className="flex justify-center -mt-16 mb-4">
                <div className="h-32 w-32 rounded-2xl border-4 border-white bg-slate-50 overflow-hidden shadow-xl ring-4 ring-blue-100">
                  {selectedMember.imageUrl ? (
                    <img 
                      src={selectedMember.imageUrl} 
                      alt={selectedMember.name} 
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                      <Users className="h-14 w-14 text-blue-300" />
                    </div>
                  )}
                </div>
              </div>

              {/* Identity info — centered */}
              <div className="text-center space-y-2">
                <h3 className="font-display text-xl font-bold text-slate-900">{selectedMember.name}</h3>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-mono font-bold text-blue-700 ring-1 ring-blue-100 ring-inset">
                    {selectedMember.position}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedMember.division}
                  </span>
                </div>
                {selectedMember.university && (
                  <p className="text-xs font-bold text-indigo-600 flex items-center justify-center gap-1.5">
                    🎓 <span>{selectedMember.university}</span>
                  </p>
                )}
              </div>

              {/* Generation/Period history */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Riwayat Kepengurusan
                  </h4>
                  {memberHistory.length > 1 && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                      {memberHistory.length} Periode
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {memberHistory.length > 0 ? memberHistory.map((rec) => {
                    const isCurrentRecord = rec.memberId === selectedMember.id;
                    const isActiveGen = rec.gen?.isActive ?? false;
                    return (
                      <div
                        key={rec.memberId}
                        className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 transition-all ${
                          isCurrentRecord
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-slate-50 border-slate-100'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800">
                              {rec.gen?.name}
                            </span>
                            {isActiveGen ? (
                              <span className="text-[9px] font-bold uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded animate-pulse">
                                Aktif
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold uppercase bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">
                                Arsip
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {rec.position}{rec.division ? ` · ${rec.division}` : ''}
                          </p>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-blue-600 bg-white border border-blue-100 px-2 py-1 rounded-lg whitespace-nowrap flex-shrink-0">
                          {rec.gen?.years}
                        </span>
                      </div>
                    );
                  }) : (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">—</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Social/Contact buttons */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                {selectedMember.email && (
                  <a 
                    href={`mailto:${selectedMember.email}`} 
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 px-4 py-3 text-xs sm:text-sm font-bold text-slate-700 transition-all"
                  >
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span>Kirim Email</span>
                  </a>
                )}
                <a 
                  href={selectedMember.linkedinUrl || "https://linkedin.com"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-4 py-3 text-xs sm:text-sm shadow-md hover:from-blue-500 hover:to-indigo-500 transition-all"
                >
                  <Linkedin className="h-4 w-4" />
                  <span>Kunjungi LinkedIn</span>
                </a>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
