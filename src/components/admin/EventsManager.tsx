'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Sparkles, Check, LayoutGrid, List } from 'lucide-react';
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
import { CalendarGrid, type CalendarEvent, type CalendarColor, CALENDAR_COLORS, COLOR_CLASSES } from '@/src/components/calendar';

interface EventsManagerProps {
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
}

type ViewMode = 'list' | 'calendar';

const emptyForm: Omit<Event, 'id'> = {
  title: '',
  description: '',
  date: '',
  endDate: '',
  time: '',
  location: '',
  imageUrl: '',
  registrationUrl: '',
  status: 'upcoming',
  eventType: 'public',
  visibleToAlumni: false,
  allDay: false,
  color: 'blue',
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
  const [viewMode, setViewMode] = useState<ViewMode>('list');

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
        (evt.location || '').toLowerCase().includes(term) ||
        evt.description.toLowerCase().includes(term)
      );
    });
  }, [events, search, statusFilter]);

  // Map ke CalendarEvent untuk CalendarGrid
  const calendarEvents = useMemo<CalendarEvent[]>(
    () =>
      filteredEvents.map((evt) => ({
        id: evt.id,
        title: evt.title,
        description: evt.description,
        startDate: evt.date,
        endDate: evt.endDate || null,
        allDay: Boolean(evt.allDay),
        time: evt.time || null,
        location: evt.location || null,
        imageUrl: evt.imageUrl || null,
        registrationUrl: evt.registrationUrl || null,
        status: evt.status,
        eventType: (evt.eventType as 'public' | 'internal') || 'public',
        color: evt.color || 'blue',
        generationId: (evt as any).generationId || null,
      })),
    [filteredEvents],
  );

  const handleOpenAdd = (prefillDate?: string) => {
    setEditingEvent(null);
    setForm({ ...emptyForm, date: prefillDate || '' });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (evt: Event) => {
    setEditingEvent(evt);
    setForm({
      title: evt.title,
      description: evt.description,
      date: evt.date,
      endDate: evt.endDate || '',
      time: evt.time,
      location: evt.location,
      imageUrl: evt.imageUrl || '',
      registrationUrl: evt.registrationUrl || '',
      status: evt.status,
      eventType: (evt.eventType as 'public' | 'internal') || 'public',
      allDay: Boolean(evt.allDay),
      color: (evt.color as CalendarColor) || 'blue',
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
      const payload = {
        ...form,
        // pastikan endDate empty string jadi null saat dikirim
        endDate: form.endDate || null,
      };

      if (editingEvent) {
        const res = await fetch(`/api/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (result.success) {
          setEvents(prev => prev.map(evt => evt.id === editingEvent.id ? { ...evt, ...form } as Event : evt));
          triggerToast('Acara berhasil diperbarui!');
          handleCloseDrawer();
        } else {
          triggerToast(`Gagal memperbarui: ${result.message}`, 'error');
        }
      } else {
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
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

  const handleCalendarEventClick = (evt: CalendarEvent) => {
    const real = events.find((e) => e.id === evt.id);
    if (real) handleOpenEdit(real);
  };

  const handleAddFromCalendar = (ymd: string) => {
    handleOpenAdd(ymd);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Manajemen Agenda & Webinar"
        description="Terbitkan webinar, kelola status pelaksanaan, dan pantau daftar hadir peserta."
      />

      {/* View Mode Toggle + Filter bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Daftar
              </button>
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Kalender
              </button>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {filteredEvents.length} acara
            </span>
          </div>
        </div>

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
      </div>

      {/* Body: List mode atau Calendar mode */}
      {viewMode === 'list' ? (
        <ListContainer
          title="Daftar Agenda Aktif"
          subtitle={`Total ${events.length} agenda/webinar terdaftar`}
          onAdd={handleOpenAdd}
          addLabel="Tambah Agenda"
        >
          {filteredEvents.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Tidak ada acara ditemukan"
              description={
                events.length === 0
                  ? "Belum ada acara terdaftar. Klik tombol Tambah Agenda untuk membuat yang pertama."
                  : "Coba sesuaikan kata kunci pencarian atau filter status."
              }
            />
          ) : (
            filteredEvents.map(evt => (
              <div key={evt.id} className="pt-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={evt.status} options={statusOptions} />
                    {evt.eventType === 'internal' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                        Internal
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 font-semibold font-mono">
                      {evt.date}{evt.endDate && evt.endDate !== evt.date ? ` → ${evt.endDate}` : ''}
                    </span>
                    {evt.allDay && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        All Day
                      </span>
                    )}
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
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm">
          <CalendarGrid
            events={calendarEvents}
            variant="admin"
            onEventClick={handleCalendarEventClick}
            onAddEvent={handleAddFromCalendar}
          />
        </div>
      )}

      {/* Drawer Form */}
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
              rows={5}
              placeholder="Deskripsikan garis besar materi, sasaran peserta, dan benefit..."
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Tipe + Status (2 kolom) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tipe Acara</label>
              <select
                value={form.eventType}
                onChange={(e) => setForm(prev => ({ ...prev, eventType: e.target.value as 'public' | 'internal' }))}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              >
                <option value="public">Publik (Terbuka)</option>
                <option value="internal">Internal (Pengurus)</option>
              </select>
            </div>
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
          </div>

          {/* Visible to Alumni checkbox - hanya muncul jika event internal */}
          {form.eventType === 'internal' && (
            <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-xl">
              <input
                type="checkbox"
                id="visibleToAlumni"
                checked={form.visibleToAlumni || false}
                onChange={(e) => setForm(prev => ({ ...prev, visibleToAlumni: e.target.checked }))}
                className="w-4 h-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="visibleToAlumni" className="text-xs font-bold text-purple-900">
                Visible untuk Alumni
                <span className="block text-[10px] font-normal text-purple-700 mt-0.5">
                  Centang jika event internal ini bisa dilihat oleh alumni
                </span>
              </label>
            </div>
          )}

          {/* Tanggal mulai + selesai */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tanggal Mulai</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tanggal Selesai</label>
              <input
                type="date"
                value={form.endDate || ''}
                onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* All Day checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={form.allDay}
              onChange={(e) => setForm(prev => ({ ...prev, allDay: e.target.checked, time: e.target.checked ? '' : prev.time }))}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="allDay" className="text-xs font-bold text-slate-700">Sepanjang Hari (All Day)</label>
          </div>

          {/* Waktu + Lokasi (2 kolom) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Waktu</label>
              <input
                type="time"
                value={form.time || ''}
                disabled={form.allDay}
                onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Lokasi</label>
              <input
                type="text"
                placeholder="Gedung IAI, Menteng / Zoom Meeting"
                value={form.location || ''}
                onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Image Uploader */}
          <ImageUploader
            label="Gambar Acara"
            value={form.imageUrl || ''}
            onChange={(url) => setForm(prev => ({ ...prev, imageUrl: url }))}
            placeholder="https://images.unsplash.com/photo-..."
          />

          {/* Link Pendaftaran */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Link Pendaftaran (Google Form)</label>
            <input
              type="url"
              placeholder="https://docs.google.com/forms/..."
              value={form.registrationUrl || ''}
              onChange={(e) => setForm(prev => ({ ...prev, registrationUrl: e.target.value }))}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-mono text-[11px]"
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Warna Chip Kalender</label>
            <div className="flex items-center gap-2 flex-wrap">
              {CALENDAR_COLORS.map((c) => {
                const cls = COLOR_CLASSES[c];
                const active = form.color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, color: c }))}
                    className={`w-8 h-8 rounded-full ${cls.bg} transition-all ${
                      active ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c}
                  />
                );
              })}
            </div>
          </div>

          {/* Submit buttons */}
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
                  {editingEvent ? 'Simpan Perubahan' : 'Tambah Acara'}
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