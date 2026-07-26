import React from 'react';
import { AlertCircle, History, Plus, Trash2, Sparkles } from 'lucide-react';
import type { Generation } from '@/src/types';
import ImageUploader from '../../ImageUploader';

/**
 * Isi tiap langkah pada form tambah/ubah pengurus.
 *
 * Dipisah dari MembersManager karena bagian ini ~250 baris JSX murni tampilan:
 * tidak melakukan fetch, tidak menyimpan state sendiri, hanya membaca nilai
 * form dan meneruskan perubahan ke atas.
 */

export interface MemberFormValues {
  name: string;
  position: string;
  division: string;
  university: string;
  generationId: number | '';
  email: string;
  imageUrl: string;
  linkedinUrl: string;
}

export interface HistoryEntry {
  generationId: number | '';
  position: string;
  division: string;
}

interface MemberFormFieldsProps {
  step: number;
  form: MemberFormValues;
  setFormValue: (key: keyof MemberFormValues, value: string | number) => void;
  handleBlur: (key: keyof MemberFormValues) => void;
  touched: Record<string, boolean>;
  errors: Record<string, string | null>;
  divisionList: string[];
  generations: Generation[];
  activeGen?: Generation;
  previousHistory: HistoryEntry[];
  setPreviousHistory: React.Dispatch<React.SetStateAction<HistoryEntry[]>>;
}

export default function MemberFormFields({
  step,
  form,
  setFormValue,
  handleBlur,
  touched,
  errors,
  divisionList,
  generations,
  activeGen,
  previousHistory,
  setPreviousHistory,
}: MemberFormFieldsProps) {
  if (step === 0) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Nama Lengkap & Gelar</label>
          <input
            type="text"
            placeholder="Contoh: Budi Santoso, S.Ak., CA"
            value={form.name}
            onChange={(e) => setFormValue('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            className={`w-full rounded-xl bg-slate-50 border px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${
              touched.name && errors.name ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
            }`}
          />
          {touched.name && errors.name && (
            <p className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Jabatan Komite</label>
          <input
            type="text"
            placeholder="Contoh: Kepala Bidang Hubungan Masyarakat"
            value={form.position}
            onChange={(e) => setFormValue('position', e.target.value)}
            onBlur={() => handleBlur('position')}
            className={`w-full rounded-xl bg-slate-50 border px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${
              touched.position && errors.position ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
            }`}
          />
          {touched.position && errors.position && (
            <p className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.position}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Asal Universitas</label>
          <input
            type="text"
            placeholder="Contoh: Universitas Indonesia"
            value={form.university}
            onChange={(e) => setFormValue('university', e.target.value)}
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Bidang / Divisi Kerja</label>
          <input
            type="text"
            list="member-division-list"
            placeholder="Ketik atau pilih nama bidang..."
            value={form.division}
            onChange={(e) => setFormValue('division', e.target.value)}
            onBlur={() => handleBlur('division')}
            className={`w-full rounded-xl bg-slate-50 border px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${
              touched.division && errors.division ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
            }`}
          />
          <datalist id="member-division-list">
            {divisionList.map(div => <option key={div} value={div} />)}
          </datalist>
          {touched.division && errors.division && (
            <p className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.division}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Email Resmi</label>
            <input
              type="email"
              placeholder="nama@iai-dki.or.id"
              value={form.email}
              onChange={(e) => setFormValue('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`w-full rounded-xl bg-slate-50 border px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${
                touched.email && errors.email ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
              }`}
            />
            {touched.email && errors.email && (
              <p className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.email}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Tautan LinkedIn</label>
            <input
              type="text"
              placeholder="https://linkedin.com/in/..."
              value={form.linkedinUrl}
              onChange={(e) => setFormValue('linkedinUrl', e.target.value)}
              onBlur={() => handleBlur('linkedinUrl')}
              className={`w-full rounded-xl bg-slate-50 border px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${
                touched.linkedinUrl && errors.linkedinUrl ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
              }`}
            />
            {touched.linkedinUrl && errors.linkedinUrl && (
              <p className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.linkedinUrl}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Periode Generasi</label>
          <select
            value={form.generationId}
            onChange={(e) => setFormValue('generationId', e.target.value ? parseInt(e.target.value) : '')}
            onBlur={() => handleBlur('generationId')}
            className={`w-full rounded-xl bg-slate-50 border px-4 py-2.5 text-xs sm:text-sm text-slate-850 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${
              touched.generationId && errors.generationId ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
            }`}
          >
            <option value="">-- Pilih Generasi --</option>
            {generations.map(g => (
              <option key={g.id} value={g.id}>{g.name} ({g.years}) {g.isActive ? '- Aktif' : ''}</option>
            ))}
          </select>
          {touched.generationId && errors.generationId && (
            <p className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.generationId}
            </p>
          )}
        </div>

        <ImageUploader
          label="Foto Profil"
          value={form.imageUrl || ''}
          onChange={(url) => setFormValue('imageUrl', url)}
          placeholder="https://images.unsplash.com/photo-..."
          helperText="Unggah pasfoto resmi pengurus atau tempel link gambar."
        />

        {/* Large preview */}
        {form.imageUrl && (
          <div className="rounded-2xl border border-slate-100 p-3 bg-slate-50/50 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pratinjau Foto Profil</span>
            <div className="flex justify-center">
              <img
                src={form.imageUrl}
                alt="Pratinjau profil"
                className="h-40 w-40 rounded-2xl object-cover bg-slate-100 border border-slate-200 shadow-sm"
                referrerPolicy="no-referrer"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs font-bold text-slate-700">Riwayat Generasi Sebelumnya</span>
          {previousHistory.length > 0 && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-100 text-amber-700 border border-amber-200">{previousHistory.length} periode</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setPreviousHistory(prev => [...prev, { generationId: '', position: '', division: divisionList[0] || '' }])}
          className="flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer"
        >
          <Plus className="h-3 w-3" /> Tambah Riwayat
        </button>
      </div>

      {previousHistory.length === 0 && (
        <p className="text-[11px] text-slate-400 italic bg-slate-50 border border-dashed border-slate-200 rounded-xl px-3 py-2.5">
          Jika pengurus ini pernah menjabat di generasi sebelumnya, tambahkan riwayatnya di sini.
        </p>
      )}

      {previousHistory.map((hist, idx) => (
        <div key={idx} className="relative bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
              <History className="h-3 w-3" /> Periode #{idx + 1}
            </span>
            <button
              type="button"
              onClick={() => setPreviousHistory(prev => prev.filter((_, i) => i !== idx))}
              className="p-1 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-amber-700">Generasi</label>
            <select
              value={String(hist.generationId)}
              onChange={e => setPreviousHistory(prev => prev.map((h, i) => i === idx ? { ...h, generationId: e.target.value === '' ? '' : Number(e.target.value) } : h))}
              className="w-full rounded-lg bg-white border border-amber-200 px-3 py-2 text-xs text-slate-800 focus:outline-none"
            >
              <option value="">-- Pilih Generasi --</option>
              {generations.filter(g => g.id !== (form.generationId || activeGen?.id)).map(g => (
                <option key={g.id} value={g.id}>{g.name} ({g.years})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-amber-700">Jabatan di Periode Tersebut</label>
            <input
              type="text"
              placeholder="Contoh: Staf Bidang Edukasi"
              value={hist.position}
              onChange={e => setPreviousHistory(prev => prev.map((h, i) => i === idx ? { ...h, position: e.target.value } : h))}
              className="w-full rounded-lg bg-white border border-amber-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-amber-700">Bidang / Divisi</label>
            <select
              value={hist.division}
              onChange={e => setPreviousHistory(prev => prev.map((h, i) => i === idx ? { ...h, division: e.target.value } : h))}
              className="w-full rounded-lg bg-white border border-amber-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-400 transition-all"
            >
              <option value="">-- Pilih Bidang / Divisi --</option>
              {divisionList.map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
