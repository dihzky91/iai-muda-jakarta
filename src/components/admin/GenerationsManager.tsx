'use client';

import React, { useState } from 'react';
import { History, Sparkles, AlertTriangle, Info, Check, RotateCcw } from 'lucide-react';
import { Generation, Member } from '@/src/types';
import { useToast } from '@/src/hooks/useToast';
import { useConfirm } from '@/src/hooks/useConfirm';
import PageHeader from './PageHeader';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';

interface GenerationsManagerProps {
  generations: Generation[];
  setGenerations: React.Dispatch<React.SetStateAction<Generation[]>>;
  members: Member[];
}

export default function GenerationsManager({ generations, setGenerations, members }: GenerationsManagerProps) {
  const { toasts, triggerToast, removeToast } = useToast();
  const { confirm, state: confirmState, handleConfirm, handleCancel } = useConfirm();

  const [newGenName, setNewGenName] = useState('');
  const [newGenYears, setNewGenYears] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGenName || !newGenYears) return;

    if (generations.some(g => g.name.toLowerCase() === newGenName.toLowerCase())) {
      triggerToast('Generasi dengan nama tersebut sudah terdaftar.', 'warning');
      return;
    }

    setSubmitting(true);
    const slug = newGenName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    try {
      const res = await fetch('/api/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, name: newGenName, years: newGenYears, isActive: false }),
      });
      const result = await res.json();
      if (result.success) {
        const listRes = await fetch('/api/generations');
        const listResult = await listRes.json();
        if (listResult.success) {
          setGenerations(Array.isArray(listResult.data) ? listResult.data : [listResult.data]);
        }
        triggerToast(`Generasi Baru (${newGenName}) berhasil didaftarkan!`);
        setNewGenName('');
        setNewGenYears('');
      } else {
        triggerToast(`Gagal mendaftarkan generasi: ${result.message}`, 'error');
      }
    } catch (err) {
      triggerToast('Terjadi kesalahan saat mendaftarkan generasi.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRolloverTransition = async (targetGenId: number) => {
    const targetGen = generations.find(g => g.id === targetGenId);
    if (!targetGen) return;

    const confirmed = await confirm({
      title: 'Transisi Kepengurusan',
      message: `Apakah Anda yakin ingin mengaktifkan "${targetGen.name}" sebagai kepengurusan utama aktif? Generasi lain akan otomatis diarsipkan sebagai data sejarah.`,
      confirmText: 'Aktifkan',
      variant: 'warning',
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/generations/${targetGenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });
      const result = await res.json();
      if (!result.success) {
        triggerToast(`Gagal memperbarui generasi: ${result.message}`, 'error');
        return;
      }

      const othersToDeactivate = generations.filter(g => g.id !== targetGenId && g.isActive);
      for (const g of othersToDeactivate) {
        await fetch(`/api/generations/${g.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: false }),
        });
      }

      const listRes = await fetch('/api/generations');
      const listResult = await listRes.json();
      if (listResult.success) {
        setGenerations(Array.isArray(listResult.data) ? listResult.data : [listResult.data]);
      }

      const targetMembers = members.filter(m => m.generationId === targetGenId);
      if (targetMembers.length === 0) {
        triggerToast(`Transisi Berhasil! ${targetGen.name} kini Aktif. Tambahkan pengurus baru melalui tab Kepengurusan.`, 'info');
      } else {
        triggerToast(`Transisi Berhasil! ${targetGen.name} kini ditetapkan sebagai kepengurusan Aktif.`);
      }
    } catch (err) {
      triggerToast('Terjadi kesalahan saat transisi generasi.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Transisi & Rollover Organisasi"
        description="Luncurkan generasi kepengurusan baru, serta arsipkan sejarah komite terdahulu."
      />

      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
        <AlertTriangle className="h-6 w-6 shrink-0 text-amber-500 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-display font-bold text-slate-900 text-base">Alur Transisi Kepengurusan Tahunan (1 Tahun Periode)</h4>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Setiap generasi kepengurusan IAI Muda Wilayah DKI Jakarta hanya bertugas selama tepat 1 tahun. Gunakan konsol ini untuk memigrasi kepengurusan secara mulus. Saat Anda menetapkan Generasi baru sebagai <strong>Aktif</strong>, generasi sebelumnya akan diarsipkan ke basis data arsip/sejarah secara otomatis tanpa kehilangan data anggota lama!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
          <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            <span>Langkah 1: Daftarkan Generasi Baru</span>
          </h3>

          <form onSubmit={handleCreateGeneration} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Nama Generasi Baru</label>
              <input
                type="text"
                required
                placeholder="Contoh: Generasi ke-3"
                value={newGenName}
                onChange={(e) => setNewGenName(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tahun Jabatan (1 Tahun)</label>
              <input
                type="text"
                required
                placeholder="Contoh: 2026-2027"
                value={newGenYears}
                onChange={(e) => setNewGenYears(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold py-3 text-xs text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Mendaftarkan...' : 'Daftarkan Struktur Generasi Baru'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
          <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            <span>Langkah 2: Kelola Status Aktif & Arsip Sejarah</span>
          </h3>

          <div className="space-y-4">
            {generations.map(g => {
              const totalMembers = members.filter(m => m.generationId === g.id).length;
              return (
                <div
                  key={g.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                    g.isActive ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{g.name}</h4>
                      {g.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          Diarsipkan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Masa Jabatan: {g.years}</p>
                    <p className="text-xs text-slate-500 mt-1">👥 {totalMembers} Anggota Komite Terdaftar</p>
                  </div>

                  {!g.isActive ? (
                    <button
                      onClick={() => handleRolloverTransition(g.id)}
                      className="rounded-lg bg-white hover:bg-slate-50 text-blue-600 border border-slate-200 px-3.5 py-2 text-xs font-bold cursor-pointer transition-all flex items-center gap-1 shadow-sm"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Aktifkan Generasi Ini</span>
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-1 px-3 py-2 text-emerald-600 text-xs font-bold">
                      <Check className="h-4 w-4" />
                      <span>Utama</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex items-start gap-2 leading-relaxed">
            <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Mengaktifkan generasi baru akan memperbarui diagram organisasi komite utama di laman publik, serta merubah total keanggotaan aktif secara instan.
            </span>
          </div>
        </div>
      </div>

      <Toast toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog state={confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}
