'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileText, Plus, Upload, Check, Trash2, Edit2, Download,
  Eye, Layers, GripVertical, FileCheck, ArrowUpDown, RefreshCw, X, AlertCircle
} from 'lucide-react';
import { Resource, ResourceVisibility } from '@/src/types';
import { useToast } from '@/src/hooks/useToast';
import { useConfirm } from '@/src/hooks/useConfirm';
import PageHeader from './PageHeader';
import ListContainer from './ListContainer';
import SearchFilterBar from './SearchFilterBar';
import EmptyState from './EmptyState';
import Drawer from './Drawer';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';

const SUBCATEGORIES = [
  'Panduan Umum',
  'Struktur & Tugas',
  'Template',
  'Kontak Penting',
  'Lainnya',
];

interface FormState {
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  subcategory: string;
  visibility: ResourceVisibility;
  sortOrder: number;
  isActive: boolean;
}

const emptyForm: FormState = {
  title: '',
  description: '',
  fileUrl: '',
  fileName: '',
  fileType: '',
  fileSize: 0,
  subcategory: 'Panduan Umum',
  visibility: 'pengurus',
  sortOrder: 0,
  isActive: true,
};

function formatBytes(bytes: number, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function OnboardingManager() {
  const { toasts, triggerToast, removeToast } = useToast();
  const { confirm, state: confirmState, handleConfirm, handleCancel } = useConfirm();

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/resources?category=onboarding');
      const json = await res.json();
      if (json.success) {
        setResources(json.data || []);
      } else {
        triggerToast(`Gagal memuat dokumen: ${json.message}`, 'error');
      }
    } catch {
      triggerToast('Terjadi kesalahan saat memuat dokumen onboarding.', 'error');
    } finally {
      setLoading(false);
    }
  }, [triggerToast]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const matchSearch =
        search === '' ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase())) ||
        (item.fileName && item.fileName.toLowerCase().includes(search.toLowerCase()));

      const matchSub =
        selectedSubcategory === 'all' || item.subcategory === selectedSubcategory;

      return matchSearch && matchSub;
    });
  }, [resources, search, selectedSubcategory]);

  const handleOpenAdd = () => {
    setEditingResource(null);
    setForm({
      ...emptyForm,
      sortOrder: resources.length + 1,
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (res: Resource) => {
    setEditingResource(res);
    setForm({
      title: res.title,
      description: res.description || '',
      fileUrl: res.fileUrl,
      fileName: res.fileName || '',
      fileType: res.fileType || '',
      fileSize: res.fileSize || 0,
      subcategory: res.subcategory || 'Panduan Umum',
      visibility: res.visibility || 'pengurus',
      sortOrder: res.sortOrder || 0,
      isActive: res.isActive,
    });
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingResource(null);
    setForm(emptyForm);
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        setForm((prev) => ({
          ...prev,
          fileUrl: result.url,
          fileName: result.originalName || file.name,
          fileType: result.fileType || file.name.split('.').pop()?.toLowerCase() || '',
          fileSize: result.size || file.size,
          title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
        }));
        triggerToast('File berhasil diunggah!');
      } else {
        triggerToast(`Gagal mengunggah file: ${result.message}`, 'error');
      }
    } catch {
      triggerToast('Gagal mengunggah file. Silakan coba lagi.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      triggerToast('Judul dokumen wajib diisi!', 'error');
      return;
    }

    if (!form.fileUrl) {
      triggerToast('File dokumen wajib diunggah!', 'error');
      return;
    }

    setSubmitting(true);

    try {
      if (editingResource) {
        const res = await fetch(`/api/admin/resources/${editingResource.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const result = await res.json();
        if (result.success) {
          triggerToast('Dokumen onboarding berhasil diperbarui!');
          fetchResources();
          handleCloseDrawer();
        } else {
          triggerToast(`Gagal memperbarui: ${result.message}`, 'error');
        }
      } else {
        const res = await fetch('/api/admin/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            category: 'onboarding',
          }),
        });
        const result = await res.json();
        if (result.success) {
          triggerToast('Dokumen onboarding baru berhasil ditambahkan!');
          fetchResources();
          handleCloseDrawer();
        } else {
          triggerToast(`Gagal menambahkan: ${result.message}`, 'error');
        }
      }
    } catch {
      triggerToast('Terjadi kesalahan saat menyimpan dokumen.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (resItem: Resource) => {
    const confirmed = await confirm({
      title: 'Hapus Dokumen Onboarding',
      message: `Apakah Anda yakin ingin menghapus dokumen "${resItem.title}"?`,
      confirmText: 'Hapus Dokumen',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/resources/${resItem.id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        setResources((prev) => prev.filter((item) => item.id !== resItem.id));
        triggerToast('Dokumen berhasil dihapus.');
      } else {
        triggerToast(`Gagal menghapus: ${result.message}`, 'error');
      }
    } catch {
      triggerToast('Gagal menghapus dokumen.', 'error');
    }
  };

  const getVisibilityBadge = (visibility: ResourceVisibility) => {
    switch (visibility) {
      case 'pengurus':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Pengurus Aktif</span>;
      case 'alumni':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Alumni</span>;
      case 'both':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Pengurus & Alumni</span>;
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Onboarding Library"
        description="Kelola dokumen panduan dan template wajib baca untuk pengurus aktif IAI Muda DKI Jakarta."
      />

      <ListContainer
        title="Dokumen Onboarding Pengurus"
        subtitle={`Total ${resources.length} dokumen onboarding terdaftar`}
        addLabel="Tambah Dokumen"
        onAdd={handleOpenAdd}
        filter={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            <div className="flex-1">
              <SearchFilterBar
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari judul, deskripsi, atau nama file..."
              />
            </div>
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            >
              <option value="all">Semua Subkategori</option>
              {SUBCATEGORIES.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        }
      >
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p className="text-xs font-medium">Memuat dokumen onboarding...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Tidak ada dokumen onboarding"
            description={
              resources.length === 0
                ? 'Belum ada dokumen onboarding yang diunggah. Klik Tambah Dokumen untuk memulai.'
                : 'Tidak ada dokumen yang cocok dengan filter pencarian.'
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredResources.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-700 font-bold shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                        Sort #{item.sortOrder}
                      </span>
                      {item.subcategory && (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">
                          {item.subcategory}
                        </span>
                      )}
                      {getVisibilityBadge(item.visibility)}
                      {!item.isActive && (
                        <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded">
                          Non-Aktif
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h4>

                    {item.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                      {item.fileName && (
                        <span className="font-mono text-slate-600 flex items-center gap-1">
                          📄 {item.fileName}
                        </span>
                      )}
                      {item.fileSize ? (
                        <span>{formatBytes(item.fileSize)}</span>
                      ) : null}
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <Download className="h-3.5 w-3.5 text-blue-600" />
                        {item.downloadCount} kali diunduh
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                    title="Buka File / Download"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                    title="Ubah Dokumen"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                    title="Hapus Dokumen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ListContainer>

      {/* Drawer Form Create & Edit */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-blue-600" />
            <span>{editingResource ? 'Edit Dokumen Onboarding' : 'Tambah Dokumen Onboarding'}</span>
          </div>
        }
        subtitle="Lengkapi metadata dan file panduan onboarding."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Judul Dokumen <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Buku Panduan Pengurus IAI Muda 2024/2025"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Deskripsi Singkat</label>
            <textarea
              rows={3}
              placeholder="Penjelasan ringkas isi dokumen..."
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Subkategori</label>
              <select
                value={form.subcategory}
                onChange={(e) => setForm((prev) => ({ ...prev, subcategory: e.target.value }))}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-850 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              >
                {SUBCATEGORIES.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Visibility Akses</label>
              <select
                value={form.visibility}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, visibility: e.target.value as ResourceVisibility }))
                }
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-850 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              >
                <option value="pengurus">Pengurus Aktif Saja (Default)</option>
                <option value="alumni">Alumni Saja</option>
                <option value="both">Pengurus Aktif & Alumni</option>
              </select>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              File Dokumen <span className="text-red-500">*</span>
            </label>

            {form.fileUrl ? (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {form.fileName || 'File Dokumen'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {form.fileType.toUpperCase()} {form.fileSize ? `• ${formatBytes(form.fileSize)}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, fileUrl: '', fileName: '', fileType: '', fileSize: 0 }))
                  }
                  className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                  title="Ganti File"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  dragOver
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-300'
                }`}
              >
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  {uploading ? 'Mengunggah file...' : 'Tarik & lepas file dokumen ke sini, atau klik tombol pilih'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Format yang didukung: PDF, DOCX, PPTX, XLSX, ZIP (Maks. 50MB)
                </p>
                <label className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer transition-all">
                  <span>Pilih File</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.zip"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Urutan Tampil (Sort Order)</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer py-2.5">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-slate-800">Aktifkan Dokumen</span>
              </label>
            </div>
          </div>

          <div className="pt-6 flex items-center gap-3 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={handleCloseDrawer}
              className="flex-1 rounded-xl bg-slate-100 text-slate-600 py-3 text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className={`flex-[2] rounded-xl font-bold py-3 text-xs text-white shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 ${
                editingResource
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/10'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  {editingResource ? 'Simpan Perubahan' : 'Tambah Dokumen'}
                </>
              )}
            </button>
          </div>
        </form>
      </Drawer>

      <Toast toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog state={confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}
