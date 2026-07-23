'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import type { Event } from '@/src/types';

interface EventRegistrationModalProps {
  event: Event;
  onClose: () => void;
}

export default function EventRegistrationModal({ event, onClose }: EventRegistrationModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
      setName('');
      setEmail('');
      setOrg('');
    }, 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
      id="registration-overlay"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 font-mono">
              FORM PENDAFTARAN ACARA
            </span>
            <h3 className="text-base font-bold text-slate-900 font-display mt-1 leading-tight">
              {event.title}
            </h3>
          </div>
          <button
            id="close-registration-modal"
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-4 animate-scale-up" id="registration-success-msg">
            <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto animate-bounce" />
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-900">Pendaftaran Berhasil!</h4>
              <p className="text-xs text-slate-500">
                Tiket dan petunjuk akses kegiatan telah kami kirimkan ke email Anda:
              </p>
              <p className="text-xs font-bold text-blue-600 font-mono mt-1">{email}</p>
            </div>
            <div className="pt-2 text-[10px] text-slate-400 font-medium">
              Kembali ke laman utama dalam beberapa detik...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" id="registration-form">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Nama Lengkap (Sesuai Sertifikat)</label>
              <input
                type="text"
                required
                placeholder="Masukkan nama lengkap Anda..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Email Aktif</label>
              <input
                type="email"
                required
                placeholder="nama@email.com..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Institusi / Universitas / Korporasi</label>
              <input
                type="text"
                required
                placeholder="Contoh: Universitas Indonesia, PwC Indonesia..."
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-xl border border-blue-100 text-blue-800 text-[11px] leading-relaxed">
              <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                E-Sertifikat bernilai SKP IAI akan diterbitkan otomatis bagi peserta yang menghadiri sekurangnya 80% dari durasi kegiatan.
              </span>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-1/2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 text-xs shadow-md shadow-blue-500/10 hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer"
              >
                Konfirmasi Daftar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
