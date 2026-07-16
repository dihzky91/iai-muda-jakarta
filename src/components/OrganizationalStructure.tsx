/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Generation, Member } from '../types';
import { Mail, Linkedin, Users, Filter, Award, History, Search, X } from 'lucide-react';

interface OrganizationalStructureProps {
  generations: Generation[];
  members: Member[];
}

export default function OrganizationalStructure({ generations, members }: OrganizationalStructureProps) {
  // Find current active generation
  const activeGen = useMemo(() => generations.find(g => g.isActive) || generations[0], [generations]);
  
  // State for selected generation in view (defaults to current active generation)
  const [selectedGenId, setSelectedGenId] = useState<number>(activeGen.id);

  // Sync selectedGenId when generations data loads from DB (replaces fallback negative IDs)
  useEffect(() => {
    if (activeGen && activeGen.id > 0) {
      setSelectedGenId(activeGen.id);
    }
  }, [activeGen.id]);
  
  // State for division filter
  const [selectedDivision, setSelectedDivision] = useState<string>('all');

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected member for profile modal
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Selected Generation details
  const selectedGen = useMemo(() => {
    return generations.find(g => g.id === selectedGenId) || activeGen;
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

  const selectedMemberGen = useMemo(() => {
    if (!selectedMember) return null;
    return generations.find(g => g.id === selectedMember.generationId);
  }, [generations, selectedMember]);

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
          Struktur Komite Pengurus
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
              Total Pengurus {selectedGen.name}
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
                onClick={() => setSelectedDivision(div)}
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
            {/* Modal Header/Banner */}
            <div className="h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 relative">
              <button 
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="px-6 pb-8 relative">
              {/* Photo offset */}
              <div className="relative -mt-12 mb-4">
                <div className="h-24 w-24 rounded-2xl border-4 border-white bg-slate-50 overflow-hidden shadow-md">
                  {selectedMember.imageUrl ? (
                    <img 
                      src={selectedMember.imageUrl} 
                      alt={selectedMember.name} 
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100">
                      <Users className="h-10 w-10 text-slate-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Identity info */}
              <div className="space-y-1">
                <h3 className="font-display text-xl font-bold text-slate-900">{selectedMember.name}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-mono font-bold text-blue-700 ring-1 ring-blue-100 ring-inset">
                    {selectedMember.position}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedMember.division}
                  </span>
                </div>
                {selectedMember.university && (
                  <p className="text-xs font-bold text-indigo-600 mt-1.5 flex items-center gap-1.5">
                    🎓 <span>{selectedMember.university}</span>
                  </p>
                )}
              </div>

              {/* Generation/Period info */}
              <div className="mt-6 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Periode Kepengurusan</h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    {selectedMemberGen ? selectedMemberGen.name : '—'}
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {selectedMemberGen ? selectedMemberGen.years : '—'}
                  </span>
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
