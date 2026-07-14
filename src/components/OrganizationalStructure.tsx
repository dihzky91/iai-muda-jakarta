/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Generation, Member } from '../types';
import { Mail, Linkedin, Users, Filter, Award, History, Search } from 'lucide-react';

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
      const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.position.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDivision && matchSearch;
    });
  }, [filteredByGenMembers, selectedDivision, searchQuery]);

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
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 whitespace-nowrap bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
              <Filter className="h-3.5 w-3.5 text-blue-600" />
              <span>Saring Divisi:</span>
            </span>
            {divisions.map((div) => (
              <button
                key={div}
                onClick={() => setSelectedDivision(div)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
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
              const isBPH = m.division.includes('BPH');
              const isKetum = m.position.includes('Ketua');
              return (
                <div 
                  key={m.id}
                  id={`member-card-${m.id}`}
                  className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
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
                        {m.division}
                      </p>
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

    </div>
  );
}
