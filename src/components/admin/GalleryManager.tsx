'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Image as ImageIcon, Sparkles, Upload, Check, Plus, Tag, Trash2 } from 'lucide-react';
import { GalleryItem, GalleryCategory } from '@/src/types';
import { useToast } from '@/src/hooks/useToast';
import { useConfirm } from '@/src/hooks/useConfirm';
import PageHeader from './PageHeader';
import ListContainer from './ListContainer';
import SearchFilterBar from './SearchFilterBar';
import EmptyState from './EmptyState';
import ActionButtons from './ActionButtons';
import Drawer from './Drawer';
import ImageUploader from '../ImageUploader';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';

interface GalleryManagerProps {
  gallery: GalleryItem[];
  setGallery: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
}

const emptyForm: Omit<GalleryItem, 'id'> = {
  title: '',
  description: '',
  category: '',
  date: '',
  imageUrl: '',
  photographer: '',
  images: [],
};

const COLOR_OPTIONS = [
  { value: 'blue',    label: 'Biru' },
  { value: 'amber',   label: 'Kuning' },
  { value: 'emerald', label: 'Hijau' },
  { value: 'pink',    label: 'Merah Muda' },
  { value: 'purple',  label: 'Ungu' },
  { value: 'slate',   label: 'Abu-Abu' },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  pink: 'bg-pink-50 text-pink-700 border-pink-100',
  purple: 'bg-purple-50 text-purple-700 border-purple-100',
  slate: 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function GalleryManager({ gallery, setGallery }: GalleryManagerProps) {
  const { toasts, triggerToast, removeToast } = useToast();
  const { confirm, state: confirmState, handleConfirm, handleCancel } = useConfirm();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [newCategory, setNewCategory] = useState({ name: '', color: 'blue' });
  const [addingCategory, setAddingCategory] = useState(false);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await fetch('/api/gallery-categories');
      const result = await res.json();
      if (result.success) {
        setCategories(result.data || []);
      }
    } catch {
      triggerToast('Gagal memuat daftar kategori.', 'error');
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState<Omit<GalleryItem, 'id'>>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!form.category && categories.length > 0) {
      const first = categories.find(c => c.isActive) ?? categories[0];
      setForm(prev => ({ ...prev, category: first.name }));
    }
  }, [categories, form.category]);

  const filteredGallery = useMemo(() => {
    return gallery.filter(item => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        (item.photographer || '').toLowerCase().includes(term)
      );
    });
  }, [gallery, search, categoryFilter]);

  const imagesText = (form.images || []).join('\n');
  const setImagesText = (text: string) => {
    setForm(prev => ({ ...prev, images: text.split('\n').map(line => line.trim()).filter(Boolean) }));
  };

  const handleOpenAdd = () => {
    const firstCat = categories.find(c => c.isActive) ?? categories[0];
    setEditingItem(null);
    setForm({ ...emptyForm, category: firstCat?.name ?? '' });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      description: item.description,
      category: item.category || '',
      date: item.date,
      imageUrl: item.imageUrl || '',
      photographer: item.photographer || '',
      images: item.images || [],
    });
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  };

  const handleUploadMultiple = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    triggerToast(`Sedang mengunggah ${files.length} foto...`, 'info');
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('image', files[i]);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.url) uploadedUrls.push(data.url);
        }
      } catch (err) { console.error(err); }
    }
    if (uploadedUrls.length > 0) {
      setForm(prev => ({ ...prev, images: [...(prev.images || []), ...uploadedUrls] }));
      triggerToast(`${uploadedUrls.length} foto berhasil diunggah!`);
    } else {
      triggerToast('Gagal mengunggah foto tambahan.', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { ...form };
    try {
      if (editingItem) {
        const res = await fetch(`/api/galleries/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (result.success) {
          setGallery(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...payload } : item));
          triggerToast('Item galeri berhasil diperbarui!');
          handleCloseDrawer();
        } else {
          triggerToast(`Gagal memperbarui: ${result.message}`, 'error');
        }
      } else {
        const res = await fetch('/api/galleries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (result.success) {
          const listRes = await fetch('/api/galleries');
          const listResult = await listRes.json();
          if (listResult.success) {
            const mapped = (Array.isArray(listResult.data) ? listResult.data : [listResult.data]).map((g: any) => ({
              ...g,
              images: typeof g.images === 'string' ? JSON.parse(g.images) : g.images || [],
            }));
            setGallery(mapped);
          }
          triggerToast('Foto galeri baru berhasil ditambahkan!');
          handleCloseDrawer();
        } else {
          triggerToast(`Gagal menambahkan: ${result.message}`, 'error');
        }
      }
    } catch {
      triggerToast('Terjadi kesalahan saat menyimpan galeri.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    const confirmed = await confirm({
      title: 'Hapus Foto Galeri',
      message: `Apakah Anda yakin ingin menghapus foto galeri "${item.title}"?`,
      confirmText: 'Hapus',
      variant: 'danger',
    });
    if (!confirmed) return;
    const res = await fetch(`/api/galleries/${item.id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      setGallery(prev => prev.filter(g => g.id !== item.id));
      triggerToast('Foto galeri berhasil dihapus.');
    } else {
      triggerToast(`Gagal menghapus: ${result.message}`, 'error');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      triggerToast('Nama kategori wajib diisi.', 'error');
      return;
    }
    setAddingCategory(true);
    try {
      const res = await fetch('/api/gallery-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory.name.trim(),
          color: newCategory.color,
          sortOrder: categories.length + 1,
        }),
      });
      const result = await res.json();
      if (result.success) {
        triggerToast(`Kategori "${result.data.name}" berhasil ditambahkan!`);
        setNewCategory({ name: '', color: 'blue' });
        await fetchCategories();
        setForm(prev => ({ ...prev, category: result.data.name }));
      } else {
        triggerToast(`Gagal: ${result.message}`, 'error');
      }
    } catch {
      triggerToast('Terjadi kesalahan saat menambah kategori.', 'error');
    } finally {
      setAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (cat: GalleryCategory) => {
    const confirmed = await confirm({
      title: 'Hapus Kategori',
      message: `Hapus kategori "${cat.name}"? Foto yang sudah ada di kategori ini tidak akan terhapus.`,
      confirmText: 'Hapus',
      variant: 'danger',
    });
    if (!confirmed) return;
    const res = await fetch(`/api/gallery-categories/${cat.id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      triggerToast('Kategori berhasil dihapus.');
      await fetchCategories();
    } else {
      triggerToast(`Gagal: ${result.message}`, 'error');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Arsip Dokumentasi Galeri"
        description="Unggah foto-foto beresolusi tinggi dokumentasi kesuksesan IAI Muda DKI."
      />

      <ListContainer
        title="Foto Terunggah"
        subtitle={`Total ${gallery.length} foto dokumentasi`}
        addLabel="Tambah Foto Galeri"
        onAdd={handleOpenAdd}
        filter={
          <SearchFilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari judul dokumentasi, deskripsi, atau fotografer..."
            filters={[
              {
                key: 'category',
                label: 'Kategori',
                value: categoryFilter,
                onChange: setCategoryFilter,
                options: [
                  { value: 'all', label: 'Semua Kategori' },
                  ...categories.map(c => ({ value: c.name, label: c.name })),
                ],
              },
            ]}
          />
        }
      >
        {filteredGallery.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="Tidak ada foto ditemukan"
            description={gallery.length === 0 ? "Belum ada foto galeri. Tambahkan dokumentasi pertama sekarang." : "Coba sesuaikan kata kunci atau filter kategori."}
          />
        ) : (
          filteredGallery.map(item => (
            <div key={item.id} className="pt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-14 w-14 rounded-xl object-cover bg-slate-100 shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {item.category} • <span className="font-mono text-[11px] text-slate-400">{item.date}</span>
                    {item.images && item.images.length > 0 && (
                      <span className="ml-2 inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-100">
                        +{item.images.length} Slide
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                </div>
              </div>
              <ActionButtons
                onEdit={() => handleOpenEdit(item)}
                onDelete={() => handleDelete(item)}
                editTitle="Ubah Foto"
                deleteTitle="Hapus Foto"
              />
            </div>
          ))
        )}
      </ListContainer>

      {/* Panel manajemen kategori */}
      <ListContainer
        title="Manajemen Kategori Galeri"
        subtitle={`Total ${categories.length} kategori • Tambah atau hapus kategori dari sini`}
        addLabel=""
        onAdd={() => {}}
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-700">Tambah Kategori Baru</h4>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Contoh: Workshop & Training"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <select
                value={newCategory.color}
                onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                className="rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={addingCategory || !newCategory.name.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-bold transition-all shadow-md shadow-blue-500/10 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                {addingCategory ? 'Menambah…' : 'Tambah'}
              </button>
            </div>
          </div>

          {loadingCategories ? (
            <p className="text-xs text-slate-500 text-center py-4">Memuat kategori…</p>
          ) : categories.length === 0 ? (
            <EmptyState
              icon={Tag}
              title="Belum ada kategori"
              description="Tambahkan kategori pertama Anda di atas."
            />
          ) : (
            <div className="space-y-2">
              {categories.map(cat => {
                const pillColor = colorMap[cat.color] || colorMap.blue;
                const usage = gallery.filter(g => g.category === cat.name).length;
                return (
                  <div key={cat.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${pillColor}`}>
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {usage} foto
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                      title="Hapus kategori"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ListContainer>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={
          <>
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>{editingItem ? 'Ubah Informasi Galeri' : 'Tambah Foto Galeri Baru'}</span>
          </>
        }
        subtitle="Lengkapi informasi dokumentasi foto."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Judul Dokumentasi</label>
            <input
              type="text"
              required
              placeholder="Contoh: Rakerda IAI DKI Jakarta 2025"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Deskripsi Singkat</label>
            <textarea
              rows={3}
              placeholder="Ceritakan singkat mengenai dokumentasi foto..."
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Kategori Galeri</label>
              <select
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900"
              >
                <option value="">— Pilih Kategori —</option>
                {categories.filter(c => c.isActive).map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tanggal Dokumentasi</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Fotografer / Kredit</label>
            <input
              type="text"
              placeholder="Kredit foto..."
              value={form.photographer}
              onChange={(e) => setForm(prev => ({ ...prev, photographer: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900"
            />
          </div>

          <ImageUploader
            label="Foto Sampul Galeri"
            value={form.imageUrl || ''}
            onChange={(url) => setForm(prev => ({ ...prev, imageUrl: url }))}
            placeholder="https://images.unsplash.com/photo-..."
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Foto Tambahan (Slide Gallery)</label>
              <label className="flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 text-[9px] font-bold transition-all cursor-pointer border border-slate-200 shadow-sm">
                <Upload className="h-3 w-3" /> Unggah Banyak Foto
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUploadMultiple(e.target.files)}
                />
              </label>
            </div>
            <textarea
              rows={4}
              placeholder="URL foto tambahan (satu per baris)..."
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-mono text-[11px]"
            />
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
              disabled={submitting}
              className={`flex-[2] rounded-xl font-bold py-3 text-xs text-white shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 ${
                editingItem ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/10'
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
                  {editingItem ? 'Simpan Perubahan' : 'Unggah Foto'}
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