'use client';

import React, { useState, useMemo } from 'react';
import { BookOpen, Sparkles, Check } from 'lucide-react';
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
  date: '',
  author: '',
  imageUrl: '',
};

export default function ArticlesManager({ articles, setArticles }: ArticlesManagerProps) {
  const { toasts, triggerToast, removeToast } = useToast();
  const { confirm, state: confirmState, handleConfirm, handleCancel } = useConfirm();

  const [search, setSearch] = useState('');
  const [authorFilter, setAuthorFilter] = useState('all');

  const authors = useMemo(() => {
    const set = new Set(articles.map(a => a.author).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      if (authorFilter !== 'all' && art.author !== authorFilter) return false;
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        art.title.toLowerCase().includes(term) ||
        art.excerpt.toLowerCase().includes(term) ||
        art.author.toLowerCase().includes(term)
      );
    });
  }, [articles, search, authorFilter]);

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
      excerpt: art.excerpt,
      content: art.content,
      date: art.date,
      author: art.author,
      imageUrl: art.imageUrl || '',
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
          triggerToast('Artikel berhasil diperbarui!');
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
          triggerToast('Artikel baru berhasil diterbitkan!');
          handleCloseDrawer();
        } else {
          triggerToast(`Gagal menambahkan: ${result.message}`, 'error');
        }
      }
    } catch (err) {
      triggerToast('Terjadi kesalahan saat menyimpan artikel.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (art: Article) => {
    const confirmed = await confirm({
      title: 'Hapus Artikel',
      message: `Apakah Anda yakin ingin menghapus artikel "${art.title}"?`,
      confirmText: 'Hapus',
      variant: 'danger',
    });
    if (!confirmed) return;

    const res = await fetch(`/api/articles/${art.id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      setArticles(prev => prev.filter(item => item.id !== art.id));
      triggerToast('Artikel berhasil dihapus.');
    } else {
      triggerToast(`Gagal menghapus: ${result.message}`, 'error');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Artikel & Berita"
        description="Kelola artikel dan opini akuntansi terkini untuk dipublikasikan ke halaman beranda."
      />

      <ListContainer
        title="Artikel Terbit"
        subtitle={`Total ${articles.length} artikel terpublikasi`}
        addLabel="Tulis Artikel"
        onAdd={handleOpenAdd}
        filter={
          <SearchFilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari judul artikel, penulis, atau ringkasan..."
            filters={[
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
            title="Tidak ada artikel ditemukan"
            description={articles.length === 0 ? "Belum ada artikel terbit. Mulai tulis artikel pertama sekarang." : "Coba sesuaikan kata kunci atau filter penulis."}
          />
        ) : (
          filteredArticles.map(art => (
            <div key={art.id} className="pt-4 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-semibold font-mono">{art.date}</span>
                  <span className="text-[10px] text-blue-600 font-bold">Oleh: {art.author}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 leading-tight">{art.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{art.excerpt}</p>
              </div>

              <ActionButtons
                onEdit={() => handleOpenEdit(art)}
                onDelete={() => handleDelete(art)}
                editTitle="Ubah Artikel"
                deleteTitle="Hapus Artikel"
              />
            </div>
          ))
        )}
      </ListContainer>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={
          <>
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>{editingArticle ? 'Ubah Informasi Artikel' : 'Tulis Artikel Baru'}</span>
          </>
        }
        subtitle="Lengkapi informasi artikel sebelum diterbitkan."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Judul Artikel</label>
            <input
              type="text"
              required
              placeholder="Contoh: Menjawab Tantangan AI..."
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Penulis</label>
            <input
              type="text"
              required
              placeholder="Nama penulis..."
              value={form.author}
              onChange={(e) => setForm(prev => ({ ...prev, author: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Ringkasan (Excerpt)</label>
            <textarea
              rows={2}
              placeholder="Ringkasan singkat artikel..."
              value={form.excerpt}
              onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Konten Artikel</label>
            <RichTextEditor
              value={form.content}
              onChange={(html) => setForm(prev => ({ ...prev, content: html }))}
              placeholder="Tulis konten artikel di sini..."
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
            label="Gambar Sampul Artikel"
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
              className={`flex-[2] rounded-xl font-bold py-3 text-xs text-white shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 ${
                editingArticle ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/10'
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
                  {editingArticle ? 'Simpan Perubahan' : 'Terbitkan Artikel'}
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
