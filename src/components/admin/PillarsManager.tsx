'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ShieldCheck, Sparkles, Check, GripVertical } from 'lucide-react';
import { Pillar } from '@/src/types';
import { useToast } from '@/src/hooks/useToast';
import { useConfirm } from '@/src/hooks/useConfirm';
import PageHeader from './PageHeader';
import ListContainer from './ListContainer';
import SearchFilterBar from './SearchFilterBar';
import EmptyState from './EmptyState';
import ActionButtons from './ActionButtons';
import Drawer from './Drawer';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';

interface PillarsManagerProps {
  pillars: Pillar[];
  setPillars: React.Dispatch<React.SetStateAction<Pillar[]>>;
}

const emptyForm: Omit<Pillar, 'id'> = {
  title: '',
  description: '',
  iconName: 'Shield',
  sortOrder: 0,
};

export default function PillarsManager({ pillars, setPillars }: PillarsManagerProps) {
  const { toasts, triggerToast, removeToast } = useToast();
  const { confirm, state: confirmState, handleConfirm, handleCancel } = useConfirm();

  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPillar, setEditingPillar] = useState<Pillar | null>(null);
  const [form, setForm] = useState<Omit<Pillar, 'id'>>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [orderedPillars, setOrderedPillars] = useState<Pillar[]>([]);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [sorting, setSorting] = useState(false);

  useEffect(() => {
    setOrderedPillars([...pillars].sort((a, b) => a.sortOrder - b.sortOrder));
  }, [pillars]);

  const filteredPillars = useMemo(() => {
    if (!search.trim()) return orderedPillars;
    const term = search.toLowerCase();
    return orderedPillars.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term)
    );
  }, [orderedPillars, search]);

  const handleOpenAdd = () => {
    setEditingPillar(null);
    setForm({ ...emptyForm, sortOrder: orderedPillars.length + 1 });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (p: Pillar) => {
    setEditingPillar(p);
    setForm({ title: p.title, description: p.description, iconName: p.iconName, sortOrder: p.sortOrder });
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingPillar(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingPillar) {
        const res = await fetch(`/api/pillars/${editingPillar.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const result = await res.json();
        if (result.success) {
          setPillars(prev => prev.map(p => p.id === editingPillar.id ? { ...p, ...form } : p));
          triggerToast('Pilar berhasil diperbarui!');
          handleCloseDrawer();
        } else {
          triggerToast(`Gagal memperbarui: ${result.message}`, 'error');
        }
      } else {
        const res = await fetch('/api/pillars', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, sortOrder: orderedPillars.length + 1 }),
        });
        const result = await res.json();
        if (result.success) {
          const listRes = await fetch('/api/pillars');
          const listResult = await listRes.json();
          if (listResult.success) {
            setPillars(Array.isArray(listResult.data) ? listResult.data : [listResult.data]);
          }
          triggerToast('Pilar baru berhasil ditambahkan!');
          handleCloseDrawer();
        } else {
          triggerToast(`Gagal menambahkan: ${result.message}`, 'error');
        }
      }
    } catch (err) {
      triggerToast('Terjadi kesalahan saat menyimpan pilar.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p: Pillar) => {
    const confirmed = await confirm({
      title: 'Hapus Pilar',
      message: `Apakah Anda yakin ingin menghapus pilar "${p.title}"?`,
      confirmText: 'Hapus',
      variant: 'danger',
    });
    if (!confirmed) return;

    const res = await fetch(`/api/pillars/${p.id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      setPillars(prev => prev.filter(item => item.id !== p.id));
      triggerToast('Pilar berhasil dihapus.');
    } else {
      triggerToast(`Gagal menghapus: ${result.message}`, 'error');
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: number) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Set a transparent drag image fallback
    try {
      const img = new Image();
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      e.dataTransfer.setDragImage(img, 0, 0);
    } catch { /* noop */ }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, id: number) => {
    e.preventDefault();
    if (id !== draggedId) setDragOverId(id);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetId: number) => {
    e.preventDefault();
    if (draggedId === null || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const fromIndex = orderedPillars.findIndex(p => p.id === draggedId);
    const toIndex = orderedPillars.findIndex(p => p.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = [...orderedPillars];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    const updated = reordered.map((p, idx) => ({ ...p, sortOrder: idx + 1 }));
    setOrderedPillars(updated);
    setDraggedId(null);
    setDragOverId(null);

    // Sync to server
    setSorting(true);
    try {
      await Promise.all(
        updated.map(p =>
          fetch(`/api/pillars/${p.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sortOrder: p.sortOrder }),
          })
        )
      );
      setPillars(updated);
      triggerToast('Urutan pilar berhasil diperbarui!');
    } catch (err) {
      triggerToast('Gagal menyimpan urutan pilar.', 'error');
      setOrderedPillars([...pillars].sort((a, b) => a.sortOrder - b.sortOrder));
    } finally {
      setSorting(false);
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Pilar Organisasi"
        description="Kelola pilar utama organisasi yang ditampilkan di halaman beranda. Seret item untuk mengubah urutan."
      />

      <ListContainer
        title="Daftar Pilar Visi & Misi"
        subtitle={`Total ${orderedPillars.length} pilar utama terdaftar`}
        addLabel="Tambah Pilar"
        onAdd={handleOpenAdd}
        filter={
          <SearchFilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari judul atau deskripsi pilar..."
          />
        }
      >
        {filteredPillars.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Tidak ada pilar ditemukan"
            description={pillars.length === 0 ? "Belum ada pilar terdaftar. Tambahkan pilar pertama sekarang." : "Coba sesuaikan kata kunci pencarian."}
          />
        ) : (
          <div className="space-y-2">
            {sorting && (
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                <span className="h-3.5 w-3.5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                Menyimpan urutan...
              </div>
            )}
            {filteredPillars.map((p, i) => {
              const isDragged = draggedId === p.id;
              const isDragOver = dragOverId === p.id;
              return (
                <div
                  key={p.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, p.id)}
                  onDragOver={(e) => handleDragOver(e, p.id)}
                  onDrop={(e) => handleDrop(e, p.id)}
                  onDragEnd={handleDragEnd}
                  className={`pt-4 flex items-start justify-between gap-4 rounded-xl border transition-all cursor-move ${
                    isDragged ? 'opacity-40 bg-slate-50 border-slate-200' :
                    isDragOver ? 'bg-blue-50 border-blue-300 shadow-sm' :
                    'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0 pl-3 pb-3">
                    <div
                      className="mt-0.5 p-1 rounded-md text-slate-300 hover:text-slate-500 hover:bg-slate-100 cursor-grab active:cursor-grabbing"
                      title="Seret untuk mengubah urutan"
                    >
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded font-mono">#{i + 1}</span>
                        <span className="text-[10px] text-blue-700 font-semibold">{p.iconName}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900">{p.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                    </div>
                  </div>
                  <ActionButtons
                    onEdit={() => handleOpenEdit(p)}
                    onDelete={() => handleDelete(p)}
                    editTitle="Ubah Pilar"
                    deleteTitle="Hapus Pilar"
                  />
                </div>
              );
            })}
          </div>
        )}
      </ListContainer>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={
          <>
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>{editingPillar ? 'Ubah Pilar' : 'Tambah Pilar Baru'}</span>
          </>
        }
        subtitle="Lengkapi informasi pilar organisasi."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Judul Pilar</label>
            <input
              type="text"
              required
              placeholder="Contoh: Integritas Standar Tinggi"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Deskripsi</label>
            <textarea
              required
              rows={5}
              placeholder="Deskripsi pilar organisasi..."
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Ikon</label>
            <select
              value={form.iconName}
              onChange={(e) => setForm(prev => ({ ...prev, iconName: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-850 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            >
              <option value="Shield">Shield — Integritas</option>
              <option value="Landmark">Landmark — Literasi</option>
              <option value="Award">Award — Sinergi</option>
            </select>
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
                editingPillar ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/10'
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
                  {editingPillar ? 'Simpan Perubahan' : 'Tambah Pilar'}
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
