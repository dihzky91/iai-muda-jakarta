'use client';

import React, { useState, useMemo } from 'react';
import { BookOpen, Sparkles, Check, Globe, ShieldAlert, Calendar, Megaphone } from 'lucide-react';
import { Article } from '@/src/types';
import { useToast } from '@/src/hooks/useToast';
import { useConfirm } from '@/src/hooks/useConfirm';
import PageHeader from './PageHeader';
import ListContainer from './ListContainer';
import SearchFilterBar from './SearchFilterBar';
import EmptyState from './EmptyState';
import ActionButtons from './ActionButtons';
import Drawer from './Drawer';
import ImageUploader from '../ImageUploader';
import RichTextEditor from './RichTextEditor';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';

interface ArticlesManagerProps {
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
}

const emptyForm: Omit<Article, 'id'> = {
  title: '',
  excerpt: '',
  content: '',
  date: new Date().toISOString().split('T')[0],
  author: '',
  imageUrl: '',
  category: 'public',
};

export default function ArticlesManager({ articles, setArticles }: ArticlesManagerProps) {
  const { toasts, triggerToast, removeToast } = useToast();
  const { confirm, state: confirmState, handleConfirm, handleCancel } = useConfirm();

  const [search, setSearch] = useState('');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const authors = useMemo(() => {
    const set = new Set(articles.map(a => a.author).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      if (authorFilter !== 'all' && art.author !== authorFilter) return false;
      if (categoryFilter !== 'all' && (art.category || 'public') !== categoryFilter) return false;
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        art.title.toLowerCase().includes(term) ||
        (art.excerpt && art.excerpt.toLowerCase().includes(term)) ||
        art.author.toLowerCase().includes(term)
      );
    });
  }, [articles, search, authorFilter, categoryFilter]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [form, setForm] = useState<Omit<Article, 'id'>>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingArticle(null);
    setForm(emptyForm);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (art: Article) => {
    setEditingArticle(art);
    setForm({
      title: art.title,
      excerpt: art.excerpt || '',
      content: art.content,
      date: art.date,
      author: art.author,
      imageUrl: art.imageUrl || '',
      category: art.category || 'public',
    });
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingArticle(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingArticle) {
        const res = await fetch(`/api/articles/${editingArticle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const result = await res.json();
        if (result.success) {
          setArticles(prev => prev.map(art => art.id === editingArticle.id ? { ...art, ...form } : art));
          triggerToast('Publikasi berhasil diperbarui!');
          handleCloseDrawer();
        } else {
          triggerToast(`Gagal memperbarui: ${result.message}`, 'error');
        }
      } else {
        const res = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const result = await res.json();
        if (result.success) {
          const listRes = await fetch('/api/articles');
          const listResult = await listRes.json();
          if (listResult.success) {
            setArticles(Array.isArray(listResult.data) ? listResult.data : [listResult.data]);
          }
          triggerToast('Publikasi baru berhasil diterbitkan!');
          handleCloseDrawer();
        } else {
          triggerToast(`Gagal menambahkan: ${result.message}`, 'error');
        }
      }
    } catch (err) {
      triggerToast('Terjadi kesalahan saat menyimpan publikasi.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (art: Article) => {
    const confirmed = await confirm({
      title: 'Hapus Publikasi',
      message: `Apakah Anda yakin ingin menghapus publikasi "${art.title}"?`,
      confirmText: 'Hapus',
      variant: 'danger',
    });
    if (!confirmed) return;

    const res = await fetch(`/api/articles/${art.id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      setArticles(prev => prev.filter(item => item.id !== art.id));
      triggerToast('Publikasi berhasil dihapus.');
    } else {
      triggerToast(`Gagal menghapus: ${result.message}`, 'error');
    }
  };

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'internal':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
            <ShieldAlert className="w-3 h-3 text-blue-600" />
            PENGUMUMAN INTERNAL
          </span>
        );
      case 'agenda':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
            <Calendar className="w-3 h-3 text-purple-600" />
            AGENDA / EDARAN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <Globe className="w-3 h-3 text-emerald-600" />
            BERITA PUBLIK
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Artikel & Pengumuman"
        description="Kelola artikel berita publik serta edaran pengumuman internal untuk seluruh anggota pengurus."
      />

      <ListContainer
        title="Daftar Publikasi & Pengumuman"
        subtitle={`Total ${articles.length} postingan diterbitkan`}
        addLabel="Tulis Publikasi Baru"
        onAdd={handleOpenAdd}
        filter={
          <SearchFilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari judul, penulis, atau kata kunci..."
            filters={[
              {
                key: 'category',
                label: 'Tipe Publikasi',
                value: categoryFilter,
                onChange: setCategoryFilter,
                options: [
                  { value: 'all', label: 'Semua Tipe' },
                  { value: 'public', label: '🌐 Berita Publik' },
                  { value: 'internal', label: '📢 Pengumuman Internal' },
                  { value: 'agenda', label: '📅 Agenda / Edaran' },
                ],
              },
              {
                key: 'author',
                label: 'Penulis',
                value: authorFilter,
                onChange: setAuthorFilter,
                options: authors.map(a => ({ value: a, label: a === 'all' ? 'Semua Penulis' : a })),
              },
            ]}
          />
        }
      >
        {filteredArticles.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Tidak ada postingan ditemukan"
            description={articles.length === 0 ? "Belum ada artikel atau pengumuman. Buat publikasi pertama sekarang." : "Coba sesuaikan kata kunci atau filter pencarian."}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredArticles.map(art => (
              <div key={art.id} className="py-4 flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getCategoryBadge(art.category)}
                    <span className="text-[10px] text-slate-400 font-mono">{art.date}</span>
                    <span className="text-[10px] text-slate-600 font-medium">• Oleh: {art.author}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 leading-tight">{art.title}</h4>
                  {art.excerpt && <p className="text-xs text-slate-500 line-clamp-2">{art.excerpt}</p>}
                </div>

                <ActionButtons
                  onEdit={() => handleOpenEdit(art)}
                  onDelete={() => handleDelete(art)}
                  editTitle="Ubah Publikasi"
                  deleteTitle="Hapus Publikasi"
                />
              </div>
            ))}
          </div>
        )}
      </ListContainer>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={
          <>
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>{editingArticle ? 'Ubah Informasi Publikasi' : 'Tulis Publikasi Baru'}</span>
          </>
        }
        subtitle="Pilih target publikasi dan lengkapi detail informasi."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Audience / Visibilitas Selector */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Megaphone className="w-4 h-4 text-blue-600" />
              Tipe Publikasi & Target Sasaran
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, category: 'public' }))}
                className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${form.category === 'public' || !form.category
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
              >
                <div>
                  <Globe className="w-4 h-4 text-emerald-600 mb-1" />
                  <div className="text-xs font-bold text-slate-900">Berita Publik</div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                  Tampil di Web Utama & Portal
                </div>
              </button>

              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, category: 'internal' }))}
                className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${form.category === 'internal'
                    ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
              >
                <div>
                  <ShieldAlert className="w-4 h-4 text-blue-600 mb-1" />
                  <div className="text-xs font-bold text-slate-900">Pengumuman Internal</div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                  Khusus Anggota / Pengurus
                </div>
              </button>

              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, category: 'agenda' }))}
                className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${form.category === 'agenda'
                    ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
              >
                <div>
                  <Calendar className="w-4 h-4 text-purple-600 mb-1" />
                  <div className="text-xs font-bold text-slate-900">Agenda / Rapat</div>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                  Edaran Rapat & Kepengurusan
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Judul Artikel / Pengumuman</label>
            <input
              type="text"
              required
              placeholder="Contoh: Pengumuman Rapat Pleno Semester II..."
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Penulis / Pembuat Edaran</label>
            <input
              type="text"
              required
              placeholder="Contoh: BPH / Sekretariat / Nama Penulis..."
              value={form.author}
              onChange={(e) => setForm(prev => ({ ...prev, author: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Ringkasan Singkat (Excerpt)</label>
            <textarea
              rows={2}
              placeholder="Ringkasan singkat pengumuman..."
              value={form.excerpt}
              onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Isi Pesan / Konten Lengkap</label>
            <RichTextEditor
              value={form.content}
              onChange={(html) => setForm(prev => ({ ...prev, content: html }))}
              placeholder="Tulis instruksi atau isi pengumuman lengkap di sini..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Tanggal Publikasi</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <ImageUploader
            label="Gambar / Lampiran Visual (Opsional)"
            value={form.imageUrl || ''}
            onChange={(url) => setForm(prev => ({ ...prev, imageUrl: url }))}
            placeholder="https://images.unsplash.com/photo-..."
          />

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
              className={`flex-[2] rounded-xl font-bold py-3 text-xs text-white shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 ${editingArticle ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/10'
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
                  {editingArticle ? 'Simpan Perubahan' : 'Terbitkan Publikasi'}
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
