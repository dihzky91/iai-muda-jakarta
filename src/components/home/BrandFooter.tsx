/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Link from 'next/link';
import { Landmark, Instagram, Linkedin, Youtube } from 'lucide-react';
import type { Settings } from '@/src/types';

interface BrandFooterProps {
  settings: Settings;
}

/**
 * Server Component: Footer dengan navigasi menggunakan Next.js Link.
 * Tidak memerlukan JavaScript di sisi klien.
 */
export default function BrandFooter({ settings }: BrandFooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 py-12" id="application-footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">

        <div className="space-y-4 col-span-1 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-md shadow-blue-500/10">
              <Landmark className="h-4.5 w-4.5" />
            </div>
            <span className="font-display font-bold text-slate-900 text-base">
              IAI Muda Wilayah DKI Jakarta
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
            {settings.footerDescription || 'IAI Muda Wilayah DKI Jakarta merupakan badan kelengkapan Ikatan Akuntan Indonesia (IAI) Wilayah DKI Jakarta yang menjadi wadah pengembangan kompetensi, kolaborasi, dan jejaring profesional bagi generasi akuntan muda.'}
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tautan Cepat</h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <Link href="/" className="hover:text-blue-600 transition-colors font-medium">
                Beranda Utama
              </Link>
            </li>
            <li>
              <Link href="/struktur" className="hover:text-blue-600 transition-colors font-medium">
                Kepengurusan
              </Link>
            </li>
            <li>
              <Link href="/acara" className="hover:text-blue-600 transition-colors font-medium">
                Agenda Webinar
              </Link>
            </li>
            <li>
              <Link href="/kalender" className="hover:text-blue-600 transition-colors font-medium">
                Kalender Acara
              </Link>
            </li>
            <li>
              <Link href="/galeri" className="hover:text-blue-600 transition-colors font-medium">
                Galeri Kegiatan
              </Link>
            </li>
            <li>
              <Link href="/artikel" className="hover:text-blue-600 transition-colors font-medium">
                Artikel & Opini
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ikuti Kami (Sosial Media)</h4>
          <div className="flex items-center gap-3">
            <a href={settings.instagramUrl || 'https://instagram.com'} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-pink-600 rounded-xl transition-all shadow-sm" title="Instagram">
              <Instagram className="h-4.5 w-4.5" />
            </a>
            <a href={settings.linkedinUrl || 'https://linkedin.com'} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-xl transition-all shadow-sm" title="LinkedIn">
              <Linkedin className="h-4.5 w-4.5" />
            </a>
            <a href={settings.youtubeUrl || 'https://youtube.com'} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-red-600 rounded-xl transition-all shadow-sm" title="YouTube">
              <Youtube className="h-4.5 w-4.5" />
            </a>
          </div>
          <p className="text-[10px] text-slate-400 pt-2 font-mono">
            © {new Date().getFullYear()} IAI Muda DKI Jakarta. <br />All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
