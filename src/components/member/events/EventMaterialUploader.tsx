'use client';

import { useState } from 'react';
import { FileText, Upload, X, ExternalLink, Loader2, Trash2, FileSpreadsheet, FileImage, File } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { EventMaterial, ManagedEvent } from '@/src/types';

interface EventMaterialUploaderProps {
  event: ManagedEvent;
  onEventUpdate?: (updatedEvent: ManagedEvent) => void;
}

const FILE_TYPE_OPTIONS = [
  { value: 'slide', label: 'Slide Presentasi', icon: FileText },
  { value: 'notulensi', label: 'Notulensi / Minutes', icon: FileSpreadsheet },
  { value: 'sertifikat', label: 'Sertifikat', icon: FileText },
  { value: 'foto', label: 'Foto Dokumentasi', icon: FileImage },
  { value: 'lainnya', label: 'Lainnya', icon: File },
];

const FILE_TYPE_LABELS: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  slide: { label: 'Slide', icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  notulensi: { label: 'Notulensi', icon: FileSpreadsheet, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  sertifikat: { label: 'Sertifikat', icon: FileText, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  foto: { label: 'Foto', icon: FileImage, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  lainnya: { label: 'File', icon: File, color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

export default function EventMaterialUploader({ event, onEventUpdate }: EventMaterialUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('slide');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const materials = event.materials || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/member/events/${event.id}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), fileUrl: fileUrl.trim(), fileType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengunggah materi');
      }

      // Update local event data
      const updatedMaterials = [...materials, data.material];
      onEventUpdate?.({ ...event, materials: updatedMaterials });

      // Reset form
      setTitle('');
      setFileUrl('');
      setFileType('slide');
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (materialId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus materi ini?')) return;

    setDeletingId(materialId);
    try {
      const res = await fetch(`/api/member/events/${event.id}/materials/${materialId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus materi');

      const updatedMaterials = materials.filter(m => m.id !== materialId);
      onEventUpdate?.({ ...event, materials: updatedMaterials });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-blue-600" />
          Materi Kegiatan
        </h2>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          {materials.length} file
        </span>
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Belum ada materi diunggah</p>
        </div>
      ) : (
        <div className="space-y-2">
          {materials.map(material => (
            <MaterialItem
              key={material.id}
              material={material}
              onDelete={handleDelete}
              deleting={deletingId === material.id}
            />
          ))}
        </div>
      )}

      {event.isCommittee && (
        <div className="pt-2">
          {!isOpen ? (
            <button
              onClick={() => setIsOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <Upload className="h-4 w-4" />
              Unggah Materi Baru
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800">Unggah Materi</h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Judul materi (contoh: Slide Presentasi)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="url"
                  placeholder="URL file (Google Drive, Dropbox, dll)"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {FILE_TYPE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
                  ⚠️ {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !title.trim() || !fileUrl.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Simpan Materi
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function MaterialItem({ material, onDelete, deleting }: { material: EventMaterial; onDelete: (id: number) => void; deleting: boolean }) {
  const meta = FILE_TYPE_LABELS[material.fileType || 'lainnya'] || FILE_TYPE_LABELS.lainnya;
  const Icon = meta.icon;

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors group">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-800 truncate">{material.title}</p>
          <p className="text-[10px] text-slate-500">
            {meta.label} · {material.uploader?.name || 'Panitia'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <a
          href={material.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Buka file"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
        <button
          onClick={() => onDelete(material.id)}
          disabled={deleting}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-60"
          title="Hapus materi"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
