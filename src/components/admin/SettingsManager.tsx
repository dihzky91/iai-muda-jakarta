'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Settings } from '@/src/types';
import { useToast } from '@/src/hooks/useToast';
import PageHeader from './PageHeader';
import Toast from './Toast';
import ImageUploader from '../ImageUploader';

interface SettingsManagerProps {
  settings: Settings;
  onSettingsUpdate: (updated: Settings) => void;
}

const defaultDivisions = ['Badan Pengurus Harian (BPH)', 'Bidang Edukasi & Sertifikasi', 'Bidang Hubungan Masyarakat', 'Bidang Kewirausahaan & Kemitraan', 'Bidang Media & Desain Kreatif'];

export default function SettingsManager({ settings, onSettingsUpdate }: SettingsManagerProps) {
  const { toasts, triggerToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [subTab, setSubTab] = useState<'contact' | 'social' | 'divisions' | 'photos' | 'branding'>('contact');
  const [editingIndex, setEditingIndex] = useState<number | 'add' | null>(null);
  const [draftName, setDraftName] = useState('');
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const [form, setForm] = useState({
    contactTitle: settings.contactTitle,
    contactDescription: settings.contactDescription,
    address: settings.address,
    email: settings.email,
    phone: settings.phone || '',
    showPhone: settings.showPhone,
    instagramUrl: settings.instagramUrl || '',
    linkedinUrl: settings.linkedinUrl || '',
    youtubeUrl: settings.youtubeUrl || '',
    divisionPhotos: settings.divisionPhotos || '{}',
    divisions: settings.divisions || JSON.stringify(defaultDivisions),
    footerDescription: settings.footerDescription || '',
    logoUrl: settings.logoUrl || '',
    faviconUrl: settings.faviconUrl || '',
  });

  useEffect(() => {
    if (settings) {
      setForm({
        contactTitle: settings.contactTitle,
        contactDescription: settings.contactDescription,
        address: settings.address,
        email: settings.email,
        phone: settings.phone || '',
        showPhone: settings.showPhone,
        instagramUrl: settings.instagramUrl || '',
        linkedinUrl: settings.linkedinUrl || '',
        youtubeUrl: settings.youtubeUrl || '',
        divisionPhotos: settings.divisionPhotos || '{}',
        divisions: settings.divisions || JSON.stringify(defaultDivisions),
        footerDescription: settings.footerDescription || '',
        logoUrl: settings.logoUrl || '',
        faviconUrl: settings.faviconUrl || '',
      });
    }
  }, [settings]);

  const divisionList = useMemo(() => {
    try {
      const parsed = JSON.parse(form.divisions || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch { /* noop */ }
    return defaultDivisions;
  }, [form.divisions]);

  const parsedDivisionPhotos = useMemo(() => {
    try {
      return JSON.parse(form.divisionPhotos || '{}');
    } catch {
      return {};
    }
  }, [form.divisionPhotos]);

  const handleStartAdd = () => {
    setEditingIndex('add');
    setDraftName('');
  };

  const handleStartEdit = (idx: number) => {
    setEditingIndex(idx);
    setDraftName(divisionList[idx]);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setDraftName('');
    setDeletingIndex(null);
  };

  const handleSaveDraft = () => {
    const name = draftName.trim();
    if (!name) {
      handleCancelEdit();
      return;
    }
    if (editingIndex === 'add') {
      setForm(prev => ({ ...prev, divisions: JSON.stringify([...divisionList, name]) }));
    } else if (typeof editingIndex === 'number') {
      const current = divisionList[editingIndex];
      if (name === current) {
        handleCancelEdit();
        return;
      }
      setForm(prev => ({ ...prev, divisions: JSON.stringify(divisionList.map((d, i) => (i === editingIndex ? name : d))) }));
    }
    handleCancelEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveDraft();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleConfirmDelete = (idx: number) => {
    setForm(prev => ({ ...prev, divisions: JSON.stringify(divisionList.filter((_, i) => i !== idx)) }));
    setDeletingIndex(null);
  };

  const handleDivisionPhotoChange = (divisionName: string, url: string) => {
    const updated = { ...parsedDivisionPhotos, [divisionName]: url };
    setForm(prev => ({ ...prev, divisionPhotos: JSON.stringify(updated) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        onSettingsUpdate({ ...settings, ...form });
        triggerToast('Pengaturan berhasil diperbarui!');
      } else {
        triggerToast(data.message || 'Gagal menyimpan pengaturan.', 'error');
      }
    } catch (err) {
      triggerToast('Terjadi kesalahan saat menyimpan pengaturan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: 'contact', label: 'Informasi Kontak', icon: '📋' },
    { key: 'social', label: 'Media Sosial', icon: '🔗' },
    { key: 'divisions', label: 'Kelola Bidang', icon: '🏷️' },
    { key: 'photos', label: 'Foto Divisi', icon: '🖼️' },
    { key: 'branding', label: 'Logo & Favicon', icon: '🎨' },
  ] as const;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Pengaturan Aplikasi"
        description="Kelola informasi kontak, media sosial, bidang/divisi, dan foto grup komite."
      />

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm max-w-3xl animate-scale-up">
        <div className="flex items-center gap-1 p-2 border-b border-slate-100 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSubTab(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                subTab === tab.key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {subTab === 'contact' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Informasi Kontak Organisasi</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Tampil di bagian "Hubungi Kami" pada halaman beranda.</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Judul Bagian Kontak</label>
                <input
                  type="text"
                  required
                  value={form.contactTitle}
                  onChange={(e) => setForm(prev => ({ ...prev, contactTitle: e.target.value }))}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium"
                  placeholder="Hubungi IAI Wilayah DKI Jakarta..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Deskripsi Bagian Kontak</label>
                <textarea
                  rows={3}
                  required
                  value={form.contactDescription}
                  onChange={(e) => setForm(prev => ({ ...prev, contactDescription: e.target.value }))}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all leading-relaxed font-medium"
                  placeholder="Masukkan deskripsi..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Email Resmi</label>
                  <input
                    type="text"
                    required
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium"
                    placeholder="iaimuda.dki@iai.or.id"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">No. Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium"
                    placeholder="(021) 3190-4232 ext. 202"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Alamat Kantor</label>
                <textarea
                  rows={2}
                  required
                  value={form.address}
                  onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all leading-relaxed font-medium"
                  placeholder="Masukkan alamat lengkap..."
                />
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <h4 className="text-xs font-bold text-slate-800">Tampilkan No. Telepon / WhatsApp</h4>
                  <p className="text-[10px] text-slate-500 leading-normal">Jika dinonaktifkan, kontak telepon akan disembunyikan dari halaman depan.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.showPhone}
                    onChange={(e) => setForm(prev => ({ ...prev, showPhone: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Deskripsi Footer Website</label>
                <textarea
                  rows={3}
                  value={form.footerDescription}
                  onChange={(e) => setForm(prev => ({ ...prev, footerDescription: e.target.value }))}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all leading-relaxed font-medium"
                  placeholder="IAI Muda Wilayah DKI Jakarta merupakan badan kelengkapan..."
                />
                <p className="text-[10px] text-slate-400">Teks deskripsi singkat organisasi yang tampil di bagian footer website.</p>
              </div>
            </div>
          )}

          {subTab === 'social' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Tautan Media Sosial</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Ikon media sosial akan tampil di footer dan halaman kontak.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-2">📸 Instagram</label>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                    <span className="text-slate-400 text-xs font-mono">instagram.com/</span>
                    <input
                      type="text"
                      placeholder="username"
                      value={(form.instagramUrl || '').replace('https://instagram.com/', '')}
                      onChange={(e) => setForm(prev => ({ ...prev, instagramUrl: e.target.value ? `https://instagram.com/${e.target.value}` : '' }))}
                      className="flex-1 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-2">💼 LinkedIn</label>
                  <input
                    type="text"
                    placeholder="https://linkedin.com/company/..."
                    value={form.linkedinUrl}
                    onChange={(e) => setForm(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-2">▶️ YouTube</label>
                  <input
                    type="text"
                    placeholder="https://youtube.com/@channel"
                    value={form.youtubeUrl}
                    onChange={(e) => setForm(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {subTab === 'divisions' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Kelola Bidang / Divisi</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Tambah, ubah nama, atau hapus bidang. Berlaku langsung di semua dropdown anggota.</p>
                </div>
                <button
                  type="button"
                  onClick={handleStartAdd}
                  disabled={editingIndex === 'add'}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 px-3 py-2 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Tambah Bidang
                </button>
              </div>
              <div className="space-y-2">
                {divisionList.map((div, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 group hover:border-blue-200 hover:bg-blue-50/40 transition-all">
                    <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                    {editingIndex === idx ? (
                      <input
                        autoFocus
                        type="text"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        onBlur={handleSaveDraft}
                        onKeyDown={handleKeyDown}
                        className="flex-1 rounded-lg bg-white border border-blue-300 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Nama bidang..."
                      />
                    ) : (
                      <span className="flex-1 text-xs font-semibold text-slate-800">{div}</span>
                    )}
                    {editingIndex === idx ? null : deletingIndex === idx ? (
                      <div className="flex items-center gap-1 animate-fade-in">
                        <span className="text-[10px] text-slate-500 hidden sm:inline">Hapus?</span>
                        <button type="button" onClick={() => handleConfirmDelete(idx)} className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 transition-all cursor-pointer" title="Ya, hapus">✓</button>
                        <button type="button" onClick={() => setDeletingIndex(null)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all cursor-pointer" title="Batal">✕</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => handleStartEdit(idx)} title="Ubah nama" className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-blue-600 transition-all cursor-pointer">✏️</button>
                        {divisionList.length > 1 && (
                          <button type="button" onClick={() => setDeletingIndex(idx)} title="Hapus" className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-red-500 transition-all cursor-pointer">🗑️</button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {editingIndex === 'add' && (
                  <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 animate-fade-in">
                    <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{divisionList.length + 1}</span>
                    <input
                      autoFocus
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      onBlur={handleSaveDraft}
                      onKeyDown={handleKeyDown}
                      className="flex-1 rounded-lg bg-white border border-blue-300 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Nama bidang baru..."
                    />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                ⚠️ Klik <strong>Simpan Perubahan</strong> di bawah agar perubahan bidang tersimpan permanen ke database.
              </p>
            </div>
          )}

          {subTab === 'branding' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">URL Logo Organisasi</label>
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={form.logoUrl}
                    onChange={(e) => setForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <p className="text-[10px] text-slate-400">Ditampilkan di pojok kiri header (mengganti ikon default). Kosongkan untuk menggunakan ikon default.</p>
                  {form.logoUrl && (
                    <div className="mt-2">
                      <p className="text-[10px] font-semibold text-slate-500 mb-1">Pratinjau:</p>
                      <img src={form.logoUrl} alt="Preview logo" className="h-12 w-12 rounded-xl border border-slate-200 object-contain bg-white" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">URL Favicon</label>
                  <input
                    type="url"
                    placeholder="https://example.com/favicon.ico"
                    value={form.faviconUrl}
                    onChange={(e) => setForm(prev => ({ ...prev, faviconUrl: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <p className="text-[10px] text-slate-400">Ikon tab browser. Biarkan kosong untuk tidak menggunakan favicon kustom.</p>
                </div>
              </div>
            </div>
          )}

          {subTab === 'photos' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Foto Group Bidang / Komite</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">URL foto group resmi per divisi. Menjadi banner di halaman Struktur Komite.</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {divisionList.map((divName) => (
                  <div key={divName} className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">{divName}</label>
                    <input
                      type="text"
                      placeholder="https://... atau URL foto group"
                      value={parsedDivisionPhotos[divName] || ''}
                      onChange={(e) => handleDivisionPhotoChange(divName, e.target.value)}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-6 py-3.5 text-xs shadow-md shadow-blue-500/10 hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
