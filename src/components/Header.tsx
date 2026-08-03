'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Landmark, Calendar, Users, FileText, ShieldAlert, Camera, LogOut, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentGenName: string;
  logoUrl?: string | null;
}

const ROLE_LABELS = { superadmin: 'Super Admin', admin: 'Admin', editor: 'Editor' };

export default function Header({ 
  currentTab, 
  setCurrentTab, 
  currentGenName,
  logoUrl
}: HeaderProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl h-18 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4 flex-nowrap">
        
        {/* Brand Logo & Name */}
        <div 
          className="flex items-center gap-3 cursor-pointer group shrink-0"
          onClick={() => { setCurrentTab('beranda'); }}
          id="brand-logo-container"
        >
          {/* Sengaja <img>, bukan next/image: logoUrl adalah URL bebas yang
              diketik admin di Pengaturan, bisa dari host mana pun. next/image
              menolak host di luar remotePatterns dengan HTTP 400 — logonya akan
              hilang sama sekali, bukan sekadar tidak teroptimasi. */}
          {logoUrl ? (
            <img src={logoUrl} alt="Logo IAI Muda DKI" className="h-10 w-10 rounded-xl object-contain group-hover:scale-105 transition-transform shrink-0" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform shrink-0">
              <Landmark className="h-5 w-5" />
            </div>
          )}
          <div className="shrink-0">
            <span className="font-display text-base sm:text-lg font-extrabold tracking-tight text-slate-950 whitespace-nowrap block">
              IAI Muda DKI Jakarta
            </span>
            <p className="text-[10px] sm:text-xs text-slate-500 font-sans font-medium tracking-wide whitespace-nowrap">
              Official Website
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 shrink-0" id="desktop-navigation">
          {['beranda', 'struktur', 'acara', 'galeri', 'artikel'].map((tab) => {
            const icons: Record<string, React.ReactNode> = {
              struktur: <Users className="h-4 w-4" />,
              acara: <Calendar className="h-4 w-4" />,
              galeri: <Camera className="h-4 w-4" />,
              artikel: <FileText className="h-4 w-4" />,
            };
            const labels: Record<string, string> = {
              beranda: 'Beranda', struktur: 'Kepengurusan',
              acara: 'Acara', galeri: 'Galeri', artikel: 'Artikel',
            };
            return (
              <button
                key={tab}
                id={`nav-btn-${tab}`}
                onClick={() => { setCurrentTab(tab); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  currentTab === tab
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                {icons[tab]}
                {labels[tab]}
              </button>
            );
          })}
        </nav>

        {/* Secondary Actions / Admin Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Global Search / Command Palette Trigger Button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
            className="flex items-center gap-2 bg-slate-100/90 hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl border border-slate-200/80 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            title="Cari sesuatu... (Ctrl + K)"
          >
            <Search className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="hidden lg:inline text-slate-600">Cari...</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded bg-white px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-500 border border-slate-300 shadow-2xs">
              Ctrl K
            </kbd>
          </button>

          {/* Show logged-in user badge when authenticated */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shrink-0">
              <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">{user.username}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${
                user.role === 'superadmin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                user.role === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {ROLE_LABELS[user.role]}
              </span>
              <button
                onClick={handleLogout}
                className="ml-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <a
            id="admin-panel-toggle"
            href="/admin"
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all shadow-md cursor-pointer shrink-0 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Akses CMS Admin</span>
          </a>
        </div>

      </div>
    </header>
  );
}
