'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Sparkles, Check } from 'lucide-react';
import { Event } from '@/src/types';
import { useToast } from '@/src/hooks/useToast';
import { useConfirm } from '@/src/hooks/useConfirm';
import PageHeader from './PageHeader';
import ListContainer from './ListContainer';
import SearchFilterBar from './SearchFilterBar';
import EmptyState from './EmptyState';
import ActionButtons from './ActionButtons';
import Drawer from './Drawer';
import ImageUploader from '../ImageUploader';
import StatusBadge from './StatusBadge';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';

interface EventsManagerProps {
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
}

const emptyForm: Omit<Event, 'id'> = {
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  imageUrl: '',
  status: 'upcoming',
};

const statusOptions: Record<string, { label: string; className: string }> = {
  ongoing: { label: 'Berlangsung', className: 'bg-emerald-50 text-emerald-700' },
  upcoming: { label: 'Akan Datang', className: 'bg-amber-50 text-amber-700' },
  completed: { label: 'Selesai', className: 'bg-slate-100 text-slate-600' },
};

export default function EventsManager({ events, setEvents }: EventsManagerProps) {
  const { toasts, triggerToast, removeToast } = useToast();
  const { confirm, state: confirmState, handleConfirm, handleCancel } = useConfirm();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Event['status']>('all');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<Omit<Event, 'id'>>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      if (statusFilter !== 'all' && evt.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        evt.title.toLowerCase().includes(term) ||
        evt.location.toLowerCase().includes(term) ||
        evt.description.toLowerCase().includes(term)
      );
    });
  }, [events, search, statusFilter]);

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setForm(emptyForm);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (evt: Event) => {
    setEditingEvent(evt);
    setForm({
      title: evt.title,
      description: evt.description,
      date: evt.date,
      time: evt.time,
      location: evt.location,
      imageUrl: evt.imageUrl || '',
      status: evt.status,
    });
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingEvent(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingEvent) {
        const res = await fetch(`/api/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const result = await res.json();
        if (result.success) {
          setEvents(prev => prev.map(evt => evt.id === editingEvent.id ? { ...evt, ...form } : evt));
          triggerToast('Acara berhasil diperbarui!');
          handleCloseDrawer();
        } else {
          triggerToast(`Gagal memperbarui: ${result.message}`, 'error');
        }
      } else {
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const result = await res.json();
        if (result.success) {
          const listRes = await fetch('/api/events');
          const listResult = await listRes.json();
          if (listResult.success) {
            setEvents(Array.isArray(listResult.data) ? listResult.data : [listResult.data]);
          }
          triggerToast('Acara baru berhasil ditambahkan!');
          handleCloseDrawer();
        } else {
          triggerToast(`Gagal menambahkan: ${result.message}`, 'error');
        }
      }
    } catch (err) {
      triggerToast('Terjadi kesalahan saat menyimpan data.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (evt: Event) => {
    const confirmed = await confirm({
      title: 'Hapus Acara',
      message: `Apakah Anda yakin ingin menghapus acara "${evt.title}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Hapus',
      cancelText: 'Batal',
      variant: 'danger',
    });
    if (!confirmed) return;

    const res = await fetch(`/api/events/${evt.id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      setEvents(prev => prev.filter(item => item.id !== evt.id));
      triggerToast('Acara berhasil dihapus.');
    } else {
      triggerToast(`Gagal menghapus: ${result.message}`, 'error');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Manajemen Agenda & Webinar"
        description="Terbitkan webinar, kelola status pelaksanaan, dan pantau daftar hadir peserta."
      />

      <ListContainer
        title="Daftar Agenda Aktif"
        subtitle={`Total ${events.length} agenda/webinar terdaftar`}
        addLabel="Tambah Agenda"
        onAdd={handleOpenAdd}
        filter={
          <SearchFilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari judul acara, lokasi, atau deskripsi..."
            filters={[
              {
                key: 'status',
                label: 'Status',
                value: statusFilter,
                onChange: (val) => setStatusFilter(val as 'all' | Event['status']),
                options: [
                  { value: 'all', label: 'Semua Status' },
                  { value: 'upcoming', label: 'Akan Datang' },
                  { value: 'ongoing', label: 'Berlangsung' },
                  { value: 'completed', label: 'Selesai' },
                ],
              },
            ]}
          />
        }
      >
        {filteredEvents.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Tidak ada acara ditemukan"
            description={events.length === 0 ? "Belum ada acara terdaftar. Klik tombol Tambah Agenda untuk membuat yang pertama." : "Coba sesuaikan kata kunci pencarian atau filter status."}
          />
        ) : (
          filteredEvents.map(evt => (
            <div key={evt.id} className="pt-4 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={evt.status} options={statusOptions} />
                  <span className="text-[10px] text-slate-500 font-semibold font-mono">{evt.date}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 leading-tight">{evt.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-1">{evt.description}</p>
                <p className="text-[10px] text-slate-400 font-medium">📍 {evt.location}</p>
              </div>

              <ActionButtons
                onEdit={() => handleOpenEdit(evt)}
                onDelete={() => handleDelete(evt)}
                editTitle="Ubah Acara"
                deleteTitle="Hapus Acara"
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
            <span>{editingEvent ? 'Ubah Informasi Acara' : 'Buat Agenda Acara Baru'}</span>
          </>
        }
        subtitle="Silakan isi dan lengkapi data formulir di bawah ini."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Judul Kegiatan / Tema Webinar</label>
            <input
              type="text"
              required
              placeholder="Contoh: Webinar Pelaporan Keuangan ESG..."
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Deskripsi Lengkap</label>
            <textarea
              required
              rows={6}
              placeholder="Deskripsikan garis besar materi, sasaran peserta, dan benefit..."
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tanggal Pelaksanaan</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Waktu Mulai</label>
              <input
                type="time"
                required
                value={form.time}
                onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Lokasi / Media Pertemuan</label>
            <input
              type="text"
              required
              placeholder="Contoh: Media Zoom / Aula Grha Akuntan"
              value={form.location}
              onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <ImageUploader
            label="Gambar Sampul Acara"
            value={form.imageUrl || ''}
            onChange={(url) => setForm(prev => ({ ...prev, imageUrl: url }))}
            placeholder="https://images.unsplash.com/photo-..."
            helperText="Unggah gambar poster atau pamflet webinar, atau tempel link gambar."
          />

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Status Publikasi</label>
            <select
              value={form.status}
              onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as Event['status'] }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            >
              <option value="upcoming">Akan Datang (Upcoming)</option>
              <option value="ongoing">Berlangsung (Ongoing)</option>
              <option value="completed">Telah Selesai (Completed)</option>
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
                editingEvent ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/10'
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
                  {editingEvent ? 'Simpan Perubahan' : 'Terbitkan Agenda'}
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
