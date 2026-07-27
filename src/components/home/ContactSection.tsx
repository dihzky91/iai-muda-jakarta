'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { MapPin, Mail, Phone, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import type { Settings } from '@/src/types';

interface ContactSectionProps {
  settings: Settings;
}

/**
 * Client Component: Form kontak dengan state management.
 * Harus client component karena menggunakan useState dan form handling.
 */
export default function ContactSection({ settings }: ContactSectionProps) {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;

    setContactLoading(true);
    setContactError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage,
        }),
      });
      const result = await res.json();

      if (result.success) {
        setContactSent(true);
        setContactName('');
        setContactEmail('');
        setContactMessage('');
        setTimeout(() => setContactSent(false), 5000);
      } else {
        setContactError(result.message || 'Gagal mengirim pesan. Coba lagi.');
      }
    } catch {
      setContactError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-slate-200 pt-20" id="homepage-contact">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

        <div className="lg:col-span-5 space-y-6">
          <h2 className="font-display text-3xl font-extrabold text-slate-900">{settings.contactTitle}</h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {settings.contactDescription}
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Alamat Grha Akuntan</h4>
                <p className="text-sm text-slate-600">{settings.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email Resmi</h4>
                <p className="text-sm text-slate-600 font-medium">{settings.email}</p>
              </div>
            </div>

            {settings.showPhone && settings.phone && (
              <div className="flex items-start gap-3 animate-fade-in">
                <Phone className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Hotline Hubungan Publik</h4>
                  <p className="text-sm text-slate-600 font-medium">{settings.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-slate-100 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span>Kirim Pesan Langsung ke Hub Kami</span>
          </h3>

          {contactSent ? (
            <div className="py-12 text-center space-y-4 animate-scale-up" id="contact-success-notification">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
              <div>
                <h4 className="text-base font-bold text-slate-900">Pesan Anda Terkirim!</h4>
                <p className="text-xs text-slate-500">
                  Staf Humas IAI Muda DKI Jakarta akan menghubungi Anda dalam waktu 1x24 jam kerja.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4" id="direct-message-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nama</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Anda..."
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="anda@email.com..."
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Isi Pesan / Pertanyaan</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Bagaimana cara saya bergabung dengan kepengurusan?..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              {contactError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  ⚠️ {contactError}
                </p>
              )}

              <button
                type="submit"
                disabled={contactLoading}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 text-xs shadow-md shadow-blue-500/10 hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {contactLoading ? (
                  <>
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Kirim Pesan Ke Humas
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}
