'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Pin, Trash2, Shield, Search, RefreshCw, AlertCircle, Loader2,
  Tag, Plus, Edit2, CheckCircle2, XCircle, X, Eye, ArrowUpDown
} from 'lucide-react';
import PostCard, { PostItem } from '@/src/components/member/community/PostCard';

interface CategoryItem {
  id: number;
  slug: string;
  hashtag: string;
  label: string;
  description: string | null;
  badgeClass: string;
  activeTabClass: string;
  sortOrder: number;
  isActive: boolean;
}

const PRESET_COLOR_THEMES = [
  {
    name: 'Slate (Umum)',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
    activeTabClass: 'bg-slate-800 text-white shadow-sm',
  },
  {
    name: 'Blue (Resmi / Pengumuman)',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    activeTabClass: 'bg-blue-600 text-white shadow-sm',
  },
  {
    name: 'Indigo (Karir & CA)',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    activeTabClass: 'bg-indigo-600 text-white shadow-sm',
  },
  {
    name: 'Emerald (Pajak & Keuangan)',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    activeTabClass: 'bg-emerald-600 text-white shadow-sm',
  },
  {
    name: 'Amber (Lowongan & Prospek)',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
    activeTabClass: 'bg-amber-600 text-white shadow-sm',
  },
  {
    name: 'Purple (Event & Workshop)',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    activeTabClass: 'bg-purple-600 text-white shadow-sm',
  },
  {
    name: 'Rose (Sosial & Kolaborasi)',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
    activeTabClass: 'bg-rose-600 text-white shadow-sm',
  },
];

export default function CommunityModerationManager() {
  const [activeSubTab, setActiveSubTab] = useState<'feed' | 'categories'>('feed');

  // Posts State
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Categories State
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Category Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [formSlug, setFormSlug] = useState('');
  const [formHashtag, setFormHashtag] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formThemeIndex, setFormThemeIndex] = useState(0);
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const res = await fetch('/api/member/community/posts?limit=30');
      if (!res.ok) return;
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setPosts(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch posts for moderation:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const res = await fetch('/api/admin/community/categories');
      if (!res.ok) return;
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const handlePostDeleted = (id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormSlug('');
    setFormHashtag('');
    setFormLabel('');
    setFormDescription('');
    setFormThemeIndex(0);
    setFormSortOrder(categories.length + 1);
    setFormIsActive(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormSlug(cat.slug);
    setFormHashtag(cat.hashtag);
    setFormLabel(cat.label);
    setFormDescription(cat.description || '');
    setFormSortOrder(cat.sortOrder);
    setFormIsActive(cat.isActive);

    const themeIdx = PRESET_COLOR_THEMES.findIndex((t) => t.badgeClass === cat.badgeClass);
    setFormThemeIndex(themeIdx >= 0 ? themeIdx : 0);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLabel.trim()) {
      setModalError('Nama label kategori wajib diisi');
      return;
    }

    const computedSlug = formSlug.trim()
      ? formSlug.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
      : formLabel.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');

    const computedHashtag = formHashtag.trim()
      ? (formHashtag.trim().startsWith('#') ? formHashtag.trim() : `#${formHashtag.trim()}`)
      : `#${formLabel.trim().replace(/\s+/g, '')}`;

    const selectedTheme = PRESET_COLOR_THEMES[formThemeIndex] || PRESET_COLOR_THEMES[0];

    setIsSubmittingCat(true);
    setModalError(null);

    try {
      const url = editingCategory
        ? `/api/admin/community/categories/${editingCategory.id}`
        : '/api/admin/community/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: computedSlug,
          hashtag: computedHashtag,
          label: formLabel.trim(),
          description: formDescription.trim(),
          badgeClass: selectedTheme.badgeClass,
          activeTabClass: selectedTheme.activeTabClass,
          sortOrder: formSortOrder,
          isActive: formIsActive,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Gagal menyimpan kategori');

      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setModalError(err.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleDeleteCategory = async (id: number, label: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${label}"?`)) return;

    try {
      const res = await fetch(`/api/admin/community/categories/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCategories();
      } else {
        alert('Gagal menghapus kategori');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (cat: CategoryItem) => {
    try {
      const res = await fetch(`/api/admin/community/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      if (res.ok) {
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.authorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Moderation Header Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-bold text-indigo-300">
            <Shield className="w-3.5 h-3.5" /> Admin CMS Ruang Komunitas
          </div>
          <h2 className="text-xl font-bold tracking-tight">Kelola Feed & Kategori Komunitas</h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Sematkan postingan (*Pin Post*), moderasi isi feed, dan atur daftar **Hashtag/Kategori Topik** resmi untuk anggota IAI Muda.
          </p>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex items-center bg-white/10 p-1 rounded-2xl backdrop-blur-md border border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveSubTab('feed')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'feed'
                ? 'bg-white text-slate-950 shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 inline mr-1.5" /> Feed Postingan ({posts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('categories')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'categories'
                ? 'bg-white text-slate-950 shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5 inline mr-1.5" /> Kategori & Hashtag ({categories.length})
          </button>
        </div>
      </div>

      {/* TAB 1: FEED POSTINGAN MODERATION */}
      {activeSubTab === 'feed' && (
        <div className="space-y-6">
          {/* Search Filter & Refresh */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kata kunci postingan atau nama penulis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>

            <button
              type="button"
              onClick={fetchPosts}
              disabled={isLoadingPosts}
              className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPosts ? 'animate-spin' : ''}`} />
              <span>Refresh Feed</span>
            </button>
          </div>

          {/* Posts List */}
          {isLoadingPosts ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
              <span>Memuat data postingan...</span>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isAdmin={true}
                  onPostDeleted={handlePostDeleted}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-12 text-center border border-slate-200 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">Tidak ada postingan ditemukan</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KATEGORI & HASHTAG MANAGER */}
      {activeSubTab === 'categories' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" /> Daftar Kategori Topik Komunitas
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kategori ini yang akan muncul sebagai tag pilihan saat anggota membuat postingan feed.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kategori Baru</span>
            </button>
          </div>

          {/* Categories Grid List */}
          {isLoadingCategories ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
              <span>Memuat daftar kategori...</span>
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`rounded-3xl p-5 bg-white border shadow-sm space-y-3 relative transition-all ${
                    cat.isActive ? 'border-slate-200 hover:border-indigo-300' : 'border-slate-200 opacity-60 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${cat.badgeClass}`}>
                      {cat.hashtag}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 transition-all cursor-pointer ${
                        cat.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                      title={cat.isActive ? 'Klik untuk Nonaktifkan' : 'Klik untuk Aktifkan'}
                    >
                      {cat.isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3" />}
                      <span>{cat.isActive ? 'Aktif' : 'Nonaktif'}</span>
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{cat.label}</h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">slug: {cat.slug}</p>
                    {cat.description && (
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">{cat.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[10px] font-semibold text-slate-400">Urutan: #{cat.sortOrder}</span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="Edit Kategori"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id, cat.label)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-12 text-center border border-slate-200 space-y-3">
              <Tag className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Belum Ada Kategori</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Klik tombol "+ Tambah Kategori Baru" untuk membuat hashtag topik resmi pertama.
              </p>
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-3xl bg-white border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                <span>{editingCategory ? 'Edit Kategori Topik' : 'Tambah Kategori Topik Baru'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama / Label Kategori *</label>
                <input
                  type="text"
                  placeholder="misal: Diskusi Karir & Sertifikasi"
                  value={formLabel}
                  onChange={(e) => {
                    setFormLabel(e.target.value);
                    if (!editingCategory) {
                      const autoSlug = e.target.value.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
                      const autoHashtag = `#${e.target.value.replace(/\s+/g, '')}`;
                      setFormSlug(autoSlug);
                      setFormHashtag(autoHashtag);
                    }
                  }}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Hashtag *</label>
                  <input
                    type="text"
                    placeholder="misal: #DiskusiKarir"
                    value={formHashtag}
                    onChange={(e) => setFormHashtag(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Slug Identifier *</label>
                  <input
                    type="text"
                    placeholder="misal: diskusi_karir"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Deskripsi Singkat</label>
                <textarea
                  placeholder="Jelaskan jenis konten atau topik yang cocok untuk kategori ini..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              {/* Theme Selector with Live Preview */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Pilih Warna Badge Hashtag</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_COLOR_THEMES.map((theme, idx) => (
                    <button
                      key={theme.name}
                      type="button"
                      onClick={() => setFormThemeIndex(idx)}
                      className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        formThemeIndex === idx
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 font-bold'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`inline-block px-2 py-0.5 rounded-md border text-[10px] font-bold ${theme.badgeClass}`}>
                        {formHashtag.trim() || '#Tag'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Urutan Tampil (Sort Order)</label>
                  <input
                    type="number"
                    min={0}
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="inline-flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Status Kategori Aktif</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingCat}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmittingCat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
