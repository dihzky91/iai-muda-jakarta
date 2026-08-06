'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Crown,
  History,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Sparkles,
  Calendar,
  Building2,
  Quote,
  Star,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import type { Generation } from '../../types';

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

interface HallOfFameManagerProps {
  generations: Generation[];
}

export default function HallOfFameManager({ generations }: HallOfFameManagerProps) {
  const [selectedGenId, setSelectedGenId] = useState<number>(
    generations.find((g) => g.isActive)?.id || generations[0]?.id || 1
  );

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [championsList, setChampionsList] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'cabinet' | 'milestones' | 'alumni' | 'champions'>('cabinet');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Cabinet Form State
  const selectedGen = generations.find((g) => g.id === selectedGenId);
  const [cabinetName, setCabinetName] = useState('');
  const [visionMission, setVisionMission] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [savingCabinet, setSavingCabinet] = useState(false);

  // Modal States for Add/Edit
  const [milestoneModal, setMilestoneModal] = useState<Partial<Milestone> | null>(null);
  const [alumniModal, setAlumniModal] = useState<Partial<Alumni> | null>(null);
  const [championModal, setChampionModal] = useState<Partial<Champion> | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/hall-of-fame');
      const data = await res.json();
      if (res.ok) {
        setMilestones(data.milestones || []);
        setAlumniList(data.alumni || []);
        setChampionsList(data.champions || []);
      }
    } catch (err) {
      console.error('Failed to load admin Hall of Fame data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedGen) {
      setCabinetName(selectedGen.cabinetName || '');
      setVisionMission(selectedGen.visionMission || '');
      setLogoUrl(selectedGen.logoUrl || '');
    }
  }, [selectedGenId, selectedGen]);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // --- SAVE CABINET METADATA ---
  const handleSaveCabinet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCabinet(true);
    try {
      const res = await fetch('/api/admin/hall-of-fame', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedGenId,
          cabinetName,
          visionMission,
          logoUrl,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', 'Metadata Kabinet berhasil diperbarui!');
        // Update local object
        if (selectedGen) {
          selectedGen.cabinetName = cabinetName;
          selectedGen.visionMission = visionMission;
          selectedGen.logoUrl = logoUrl;
        }
      } else {
        showFeedback('error', data.error || 'Gagal menyimpan kabinet');
      }
    } catch (err) {
      showFeedback('error', 'Terjadi kesalahan sistem');
    } finally {
      setSavingCabinet(false);
    }
  };

  // --- MILESTONES CRUD ---
  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneModal) return;

    const isEdit = !!milestoneModal.id;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/admin/hall-of-fame/milestones', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...milestoneModal,
          generationId: selectedGenId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', isEdit ? 'Milestone berhasil diperbarui!' : 'Milestone berhasil ditambahkan!');
        setMilestoneModal(null);
        loadData();
      } else {
        showFeedback('error', data.error || 'Gagal menyimpan milestone');
      }
    } catch {
      showFeedback('error', 'Terjadi kesalahan sistem');
    }
  };

  const handleDeleteMilestone = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus milestone ini?')) return;
    try {
      const res = await fetch(`/api/admin/hall-of-fame/milestones?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFeedback('success', 'Milestone berhasil dihapus!');
        loadData();
      }
    } catch {
      showFeedback('error', 'Gagal menghapus milestone');
    }
  };

  // --- ALUMNI CRUD ---
  const handleSaveAlumni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumniModal) return;

    const isEdit = !!alumniModal.id;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/admin/hall-of-fame/alumni', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...alumniModal,
          generationId: selectedGenId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', isEdit ? 'Data Alumni diperbarui!' : 'Data Alumni ditambahkan!');
        setAlumniModal(null);
        loadData();
      } else {
        showFeedback('error', data.error || 'Gagal menyimpan alumni');
      }
    } catch {
      showFeedback('error', 'Terjadi kesalahan sistem');
    }
  };

  const handleDeleteAlumni = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data alumni ini?')) return;
    try {
      const res = await fetch(`/api/admin/hall-of-fame/alumni?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFeedback('success', 'Data alumni berhasil dihapus!');
        loadData();
      }
    } catch {
      showFeedback('error', 'Gagal menghapus alumni');
    }
  };

  // --- CHAMPIONS CRUD ---
  const handleSaveChampion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!championModal) return;

    const isEdit = !!championModal.id;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/admin/hall-of-fame/champions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...championModal,
          generationId: selectedGenId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', isEdit ? 'Penghargaan diperbarui!' : 'Penghargaan ditambahkan!');
        setChampionModal(null);
        loadData();
      } else {
        showFeedback('error', data.error || 'Gagal menyimpan penghargaan');
      }
    } catch {
      showFeedback('error', 'Terjadi kesalahan sistem');
    }
  };

  const handleDeleteChampion = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus penghargaan ini?')) return;
    try {
      const res = await fetch(`/api/admin/hall-of-fame/champions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFeedback('success', 'Penghargaan berhasil dihapus!');
        loadData();
      }
    } catch {
      showFeedback('error', 'Gagal menghapus penghargaan');
    }
  };

  // Filtered lists for current selectedGenId
  const currentMilestones = milestones.filter((m) => m.generationId === selectedGenId);
  const currentAlumni = alumniList.filter((a) => a.generationId === selectedGenId);
  const currentChampions = championsList.filter((c) => c.generationId === selectedGenId);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-3xl border border-amber-500/30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-400/30 text-amber-400">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Kelola Hall of Fame & Museum Sejarah</h1>
            <p className="text-xs text-slate-300">
              Pengelolaan milestone proker unggulan, pimpinan & alumni BPH, dan wall of champions per generasi.
            </p>
          </div>
        </div>

        {/* Generation Selector */}
        <div className="flex items-center gap-2 bg-white/10 p-2 rounded-2xl border border-white/10">
          <History className="w-4 h-4 text-amber-400 ml-1" />
          <select
            value={selectedGenId}
            onChange={(e) => setSelectedGenId(Number(e.target.value))}
            className="bg-transparent text-white font-bold text-xs sm:text-sm px-2 py-1 outline-none cursor-pointer"
          >
            {generations.map((gen) => (
              <option key={gen.id} value={gen.id} className="bg-slate-900 text-white">
                {gen.name} ({gen.years}) {gen.isActive ? '⭐ Active' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('cabinet')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeSubTab === 'cabinet'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ⚙️ Metadata Kabinet
        </button>
        <button
          onClick={() => setActiveSubTab('milestones')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeSubTab === 'milestones'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📜 Milestone Sejarah ({currentMilestones.length})
        </button>
        <button
          onClick={() => setActiveSubTab('alumni')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeSubTab === 'alumni'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          👑 BPH & Alumni ({currentAlumni.length})
        </button>
        <button
          onClick={() => setActiveSubTab('champions')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeSubTab === 'champions'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🏆 Wall of Champions ({currentChampions.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: CABINET METADATA */}
      {/* ========================================================================= */}
      {activeSubTab === 'cabinet' && (
        <form onSubmit={handleSaveCabinet} className="bg-white rounded-3xl p-6 border border-slate-200 space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Informasi Kabinet — {selectedGen?.name} ({selectedGen?.years})
          </h2>

          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Kabinet (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Kabinet Akselerasi (boleh dikosongkan jika tidak memakai nama)"
                value={cabinetName}
                onChange={(e) => setCabinetName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Jika dikosongkan, UI Hall of Fame hanya akan menampilkan nama Generasi & Tahun.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Visi & Misi Kabinet / Slogan Utama
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Mengakselerasi kompetensi dan jejaring profesional akuntan muda DKI Jakarta..."
                value={visionMission}
                onChange={(e) => setVisionMission(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingCabinet}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {savingCabinet ? 'Menyimpan...' : 'Simpan Informasi Kabinet'}
          </button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: MILESTONES MANAGEMENT */}
      {/* ========================================================================= */}
      {activeSubTab === 'milestones' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Daftar Milestone Sejarah ({selectedGen?.name})
            </h2>
            <button
              onClick={() => setMilestoneModal({ generationId: selectedGenId, sortOrder: currentMilestones.length + 1 })}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah Milestone
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {currentMilestones.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                Belum ada milestone untuk generasi ini. Klik tombol di atas untuk menambah.
              </div>
            ) : (
              currentMilestones.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        {item.eventDate}
                      </span>
                      {item.impactTag && (
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          {item.impactTag}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setMilestoneModal(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMilestone(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: ALUMNI BOARD MANAGEMENT */}
      {/* ========================================================================= */}
      {activeSubTab === 'alumni' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Daftar BPH Demisioner & Alumni ({selectedGen?.name})
            </h2>
            <button
              onClick={() => setAlumniModal({ generationId: selectedGenId, sortOrder: currentAlumni.length + 1 })}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah Alumni / BPH
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentAlumni.length === 0 ? (
              <div className="col-span-2 bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-xs font-semibold">
                Belum ada data alumni/BPH demisioner untuk generasi ini.
              </div>
            ) : (
              currentAlumni.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {item.photoUrl ? (
                      <img src={item.photoUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 font-bold text-slate-700 flex items-center justify-center">
                        {item.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        {item.roleName}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">{item.name}</h4>
                      {item.currentCompany && (
                        <p className="text-[11px] text-slate-500 truncate">{item.currentCompany}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setAlumniModal(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAlumni(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: WALL OF CHAMPIONS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeSubTab === 'champions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Penghargaan Pilihan ({selectedGen?.name})
            </h2>
            <button
              onClick={() => setChampionModal({ generationId: selectedGenId, awardType: 'best_proker', sortOrder: currentChampions.length + 1 })}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah Penghargaan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentChampions.length === 0 ? (
              <div className="col-span-2 bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-xs font-semibold">
                Belum ada penghargaan terdaftar untuk generasi ini.
              </div>
            ) : (
              currentChampions.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 uppercase">
                      {item.awardType}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">{item.title}</h4>
                    <p className="text-xs font-semibold text-slate-700">Pemenang: {item.winnerName}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setChampionModal(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteChampion(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT MILESTONE */}
      {/* ========================================================================= */}
      {milestoneModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveMilestone} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {milestoneModal.id ? 'Edit Milestone Sejarah' : 'Tambah Milestone Sejarah'}
              </h3>
              <button type="button" onClick={() => setMilestoneModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Tanggal / Waktu Event *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 15 Juli 2026"
                  value={milestoneModal.eventDate || ''}
                  onChange={(e) => setMilestoneModal({ ...milestoneModal, eventDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Judul Milestone *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Musyawarah Wilayah I & Deklarasi IAI Muda DKI"
                  value={milestoneModal.title || ''}
                  onChange={(e) => setMilestoneModal({ ...milestoneModal, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Deskripsi Ringkas *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan momentum atau proker akbar tersebut..."
                  value={milestoneModal.description || ''}
                  onChange={(e) => setMilestoneModal({ ...milestoneModal, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Impact Tag Badge (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: 1,500+ Registrasi Peserta"
                  value={milestoneModal.impactTag || ''}
                  onChange={(e) => setMilestoneModal({ ...milestoneModal, impactTag: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">URL Foto Dokumentasi (Opsional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={milestoneModal.imageUrl || ''}
                  onChange={(e) => setMilestoneModal({ ...milestoneModal, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMilestoneModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Simpan Milestone
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT ALUMNI */}
      {/* ========================================================================= */}
      {alumniModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveAlumni} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {alumniModal.id ? 'Edit Alumni BPH' : 'Tambah Alumni BPH'}
              </h3>
              <button type="button" onClick={() => setAlumniModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Farhan, S.Ak., CA"
                  value={alumniModal.name || ''}
                  onChange={(e) => setAlumniModal({ ...alumniModal, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Jabatan Terdahulu *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ketua Umum (Demisioner Gen-1)"
                  value={alumniModal.roleName || ''}
                  onChange={(e) => setAlumniModal({ ...alumniModal, roleName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Karir / Perusahaan Saat Ini</label>
                <input
                  type="text"
                  placeholder="Contoh: Senior Auditor di KAP EY Indonesia"
                  value={alumniModal.currentCompany || ''}
                  onChange={(e) => setAlumniModal({ ...alumniModal, currentCompany: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">URL Foto Resmi</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={alumniModal.photoUrl || ''}
                  onChange={(e) => setAlumniModal({ ...alumniModal, photoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Legacy Quote / Pesan Motivasi</label>
                <textarea
                  rows={2}
                  placeholder="Pesan inspiratif untuk pengurus generasi penerus..."
                  value={alumniModal.quote || ''}
                  onChange={(e) => setAlumniModal({ ...alumniModal, quote: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAlumniModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Simpan Data Alumni
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CHAMPIONS */}
      {/* ========================================================================= */}
      {championModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveChampion} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {championModal.id ? 'Edit Penghargaan' : 'Tambah Penghargaan'}
              </h3>
              <button type="button" onClick={() => setChampionModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Kategori Award *</label>
                <select
                  value={championModal.awardType || 'best_proker'}
                  onChange={(e) => setChampionModal({ ...championModal, awardType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="member_of_the_year">Member of the Year</option>
                  <option value="best_proker">Best Program Kerja</option>
                  <option value="other">Penghargaan Khusus / Lainnya</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Judul Penghargaan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 🚀 Best Program Kerja 2025"
                  value={championModal.title || ''}
                  onChange={(e) => setChampionModal({ ...championModal, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Nama Pemenang / Nama Proker *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: IAI Muda DKI Career Talk 2026"
                  value={championModal.winnerName || ''}
                  onChange={(e) => setChampionModal({ ...championModal, winnerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Alasan / Deskripsi Kemenangan</label>
                <textarea
                  rows={2}
                  placeholder="Jelaskan alasan pencapaian award ini..."
                  value={championModal.description || ''}
                  onChange={(e) => setChampionModal({ ...championModal, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">URL Foto Dokumentasi Award</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={championModal.imageUrl || ''}
                  onChange={(e) => setChampionModal({ ...championModal, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setChampionModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Simpan Penghargaan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
