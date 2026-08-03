'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Landmark, Calendar, Users, FileText, ShieldAlert, Camera, Menu, X, Home, Handshake, Search } from 'lucide-react';

interface PublicHeaderProps {
  currentGenName: string;
  logoUrl?: string | null;
}

/**
 * Header untuk halaman publik dengan navigasi menggunakan Next.js Link.
 * Client component karena menggunakan usePathname dan mobile menu state.
 */
export default function PublicHeader({ 
  currentGenName,
  logoUrl
}: PublicHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Jangan tampilkan header publik di area admin, portal, atau login
  if (pathname.startsWith('/admin') || pathname.startsWith('/portal') || pathname === '/login') {
    return null;
  }
  const navItems = [
    { path: '/', label: 'Beranda', icon: <Home className="h-4 w-4" /> },
    { path: '/struktur', label: 'Kepengurusan', icon: <Users className="h-4 w-4" /> },
    { path: '/jejaring', label: 'Jejaring HIMA', icon: <Handshake className="h-4 w-4" /> },
    { path: '/acara', label: 'Acara', icon: <Calendar className="h-4 w-4" /> },
    { path: '/galeri', label: 'Galeri', icon: <Camera className="h-4 w-4" /> },
    { path: '/artikel', label: 'Artikel', icon: <FileText className="h-4 w-4" /> },
  ];


  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl h-18 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        
        {/* Brand Logo & Name */}
        <Link 
          href="/"
          className="flex items-center gap-3 group shrink-0"
          id="brand-logo-container"
        >
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Logo IAI Muda DKI" 
              className="h-10 w-10 rounded-xl object-contain group-hover:scale-105 transition-transform shrink-0" 
            />
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
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 shrink-0" id="desktop-navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button & Action Triggers */}
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

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center rounded-xl p-2 text-slate-600 hover:bg-slate-100 transition-all"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Admin CMS Link */}
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all shadow-md shrink-0 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Akses CMS Admin</span>
          </Link>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <nav className="px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
