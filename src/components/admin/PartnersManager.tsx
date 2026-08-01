'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Globe, Building2, Eye, EyeOff, Search, Link as LinkIcon, Users } from 'lucide-react';
import type { Partner } from '@/src/types';

interface PartnersManagerProps {
  partners: Partner[];
  setPartners: React.Dispatch<React.SetStateAction<Partner[]>>;
}

export default function PartnersManager({ partners, setPartners }: PartnersManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    university: '',
    logoUrl: '',
    category: 'hima' as 'hima' | 'organisasi' | 'corporate' | 'media',
    websiteUrl: '',
    contactPerson: '',
    sortOrder: 0,
    isActive: true,
  });

  const openAddModal = () => {
    setEditingPartner(null);
    setFormData({
      name: '',
      university: '',
      logoUrl: '',
      category: 'hima',
      websiteUrl: '',
      contactPerson: '',
      sortOrder: partners.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      university: partner.university || '',
      logoUrl: partner.logoUrl || '',
      category: partner.category,
      websiteUrl: partner.websiteUrl || '',
      contactPerson: partner.contactPerson || '',
      sortOrder: partner.sortOrder || 0,
      isActive: partner.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      if (editingPartner) {
        // PUT update
        const res = await fetch(`/api/admin/partners/${editingPartner.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const result = await res.json();
        if (result.success) {
          setPartners(prev =>
            prev.map(p => (p.id === editingPartner.id ? { ...p, ...formData } : p))
          );
          setIsModalOpen(false);
        } else {
          alert(result.error || 'Gagal mengupdate HIMA/mitra.');
        }
      } else {
        // POST create
        const res = await fetch('/api/admin/partners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const result = await res.json();
        if (result.success && result.data) {
          setPartners(prev => [result.data, ...prev]);
          setIsModalOpen(false);
        } else {
          alert(result.error || 'Gagal menambahkan HIMA/mitra.');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan data.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (partner: Partner) => {
    try {
      const newStatus = !partner.isActive;
      const res = await fetch(`/api/admin/partners/${partner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        setPartners(prev =>
          prev.map(p => (p.id === partner.id ? { ...p, isActive: newStatus } : p))
        );
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus HIMA/mitra ini?')) return;
    try {
      const res = await fetch(`/api/admin/partners/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        setPartners(prev => prev.filter(p => p.id !== id));
      } else {
        alert(result.error || 'Gagal menghapus data.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPartners = partners.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.university && p.university.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Kelola HIMA & Jejaring Kemitraan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola daftar Himpunan Mahasiswa Akuntansi (HIMA) dan mitra strategis yang berkolaborasi dengan IAI Muda DKI Jakarta.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah HIMA / Mitra
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama himpunan atau kampus..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="all">Semua Kategori</option>
          <option value="hima">HIMA Akuntansi</option>
          <option value="organisasi">Organisasi & Komunitas</option>
          <option value="corporate">Corporate / KAP</option>
          <option value="media">Media Partner</option>
        </select>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase">
              <tr>
                <th className="px-6 py-4">Logo & Himpunan</th>
                <th className="px-6 py-4">Universitas / Kampus</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Website / CP</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Belum ada HIMA atau mitra yang terdaftar.
                  </td>
                </tr>
              ) : (
                filteredPartners.map(partner => (
                  <tr key={partner.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                          {partner.logoUrl ? (
                            <img src={partner.logoUrl} alt={partner.name} className="h-full w-full object-cover" />
                          ) : (
                            <Building2 className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">{partner.name}</span>
                          <span className="text-xs text-slate-400">Urutan: #{partner.sortOrder}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {partner.university || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        partner.category === 'hima' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        partner.category === 'organisasi' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        partner.category === 'corporate' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {partner.category.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {partner.websiteUrl ? (
                        <a
                          href={partner.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Link Website
                        </a>
                      ) : (
                        <span className="text-slate-400">{partner.contactPerson || '-'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleActive(partner)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition ${
                          partner.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {partner.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {partner.isActive ? 'Aktif' : 'Non-Aktif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(partner)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(partner.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingPartner ? 'Edit HIMA / Mitra' : 'Tambah HIMA / Mitra Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Himpunan / Mitra *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SPA FEB UI / HIMA Akuntansi UGM"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Universitas / Kampus</label>
                <input
                  type="text"
                  placeholder="e.g. Universitas Indonesia"
                  value={formData.university}
                  onChange={e => setFormData({ ...formData, university: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="hima">HIMA Akuntansi</option>
                    <option value="organisasi">Organisasi</option>
                    <option value="corporate">Corporate / KAP</option>
                    <option value="media">Media Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Urutan Tampil</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">URL Logo (Image URL / Unsplash)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.logoUrl}
                  onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.websiteUrl}
                    onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Contact Person / IG</label>
                  <input
                    type="text"
                    placeholder="@hima_ui / 0812..."
                    value={formData.contactPerson}
                    onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="font-medium text-slate-700">Tampilkan di Publik (Aktif)</label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
