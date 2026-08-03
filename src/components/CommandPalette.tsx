'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Calendar,
  FileText,
  Users,
  Handshake,
  Camera,
  Home,
  ShieldAlert,
  UserCheck,
  ArrowRight,
  Sparkles,
  Command,
  X,
  Loader2,
} from 'lucide-react';

interface QuickLink {
  id: string;
  title: string;
  subtitle: string;
  category: 'Navigasi Cepat';
  icon: React.ReactNode;
  url: string;
  keywords?: string[];
}

const QUICK_NAV_ITEMS: QuickLink[] = [
  {
    id: 'nav-home',
    title: 'Beranda Utama',
    subtitle: 'Halaman depan official website IAI Muda DKI Jakarta',
    category: 'Navigasi Cepat',
    icon: <Home className="h-4 w-4 text-blue-600" />,
    url: '/',
    keywords: ['beranda', 'home', 'depan', 'utama', 'landing', 'halaman'],
  },
  {
    id: 'nav-events',
    title: 'Agenda & Webinar',
    subtitle: 'Lihat daftar webinar, workshop, dan event kompetensi',
    category: 'Navigasi Cepat',
    icon: <Calendar className="h-4 w-4 text-emerald-600" />,
    url: '/acara',
    keywords: ['acara', 'webinar', 'event', 'agenda', 'kegiatan', 'workshop', 'seminar', 'jadwal'],
  },
  {
    id: 'nav-structure',
    title: 'Struktur Kepengurusan',
    subtitle: 'Jajaran pengurus harian dan bidang IAI Muda',
    category: 'Navigasi Cepat',
    icon: <Users className="h-4 w-4 text-indigo-600" />,
    url: '/struktur',
    keywords: ['pengurus', 'kepengurusan', 'struktur', 'anggota', 'komite', 'divisi', 'jabatan', 'organisasi'],
  },
  {
    id: 'nav-hima',
    title: 'Jejaring HIMA & Mitra',
    subtitle: 'Jaringan Himpunan Mahasiswa Akuntansi & Universitas',
    category: 'Navigasi Cepat',
    icon: <Handshake className="h-4 w-4 text-amber-600" />,
    url: '/jejaring',
    keywords: ['hima', 'mitra', 'universitas', 'kampus', 'jejaring', 'kerjasama', 'himpunan', 'akuntansi'],
  },
  {
    id: 'nav-gallery',
    title: 'Galeri Dokumentasi',
    subtitle: 'Foto dan rekaman kegiatan IAI Muda',
    category: 'Navigasi Cepat',
    icon: <Camera className="h-4 w-4 text-purple-600" />,
    url: '/galeri',
    keywords: ['galeri', 'foto', 'dokumentasi', 'video', 'kegiatan', 'gambar'],
  },
  {
    id: 'nav-articles',
    title: 'Artikel & Berita',
    subtitle: 'Publikasi, rilis pers, dan wawasan akuntansi',
    category: 'Navigasi Cepat',
    icon: <FileText className="h-4 w-4 text-cyan-600" />,
    url: '/artikel',
    keywords: ['artikel', 'berita', 'opini', 'publikasi', 'rilis', 'tulisan', 'bacaan', 'wawasan'],
  },
  {
    id: 'nav-portal',
    title: 'Portal Pengurus (Ruang Komunitas)',
    subtitle: 'Area pengurus internal untuk berdiskusi & berbagi pengumuman',
    category: 'Navigasi Cepat',
    icon: <UserCheck className="h-4 w-4 text-pink-600" />,
    url: '/portal/feed',
    keywords: ['portal', 'pengurus', 'komunitas', 'internal', 'diskusi', 'feed', 'login', 'member', 'anggota', 'ruang'],
  },
  {
    id: 'nav-admin',
    title: 'Akses CMS Admin',
    subtitle: 'Dasbor manajemen data dan konten website',
    category: 'Navigasi Cepat',
    icon: <ShieldAlert className="h-4 w-4 text-rose-600" />,
    url: '/admin',
    keywords: ['admin', 'cms', 'dasbor', 'dashboard', 'kelola', 'login', 'management', 'sistem'],
  },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [searchResults, setSearchResults] = useState<{
    events: any[];
    articles: any[];
    members: any[];
    partners: any[];
  }>({ events: [], articles: [], members: [], partners: [] });

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Global Event Listener for Keyboard Shortcut (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleCustomOpen);
    };
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSearchResults({ events: [], articles: [], members: [], partners: [] });
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced API Search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSearchResults({ events: [], articles: [], members: [], partners: [] });
      setLoading(false);
      setSelectedIndex(0);
      return;
    }

    setLoading(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setSearchResults({
          events: data.events || [],
          articles: data.articles || [],
          members: data.members || [],
          partners: data.partners || [],
        });
      } catch (err) {
        console.error('Command Palette Search error:', err);
      } finally {
        setLoading(false);
        setSelectedIndex(0);
      }
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Flattened results for keyboard navigation
  const combinedItems = useCallback(() => {
    const q = query.toLowerCase().trim();

    // Filter Quick Nav items by query / keywords
    const quickNavMatches = QUICK_NAV_ITEMS.filter((item) => {
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q) ||
        (item.keywords && item.keywords.some((k) => k.toLowerCase().includes(q)))
      );
    }).map((item) => ({
      type: 'quick' as const,
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      icon: item.icon,
      url: item.url,
      category: item.category,
    }));

    if (!q || q.length < 2) {
      return quickNavMatches;
    }

    const items: Array<{
      type: 'quick' | 'event' | 'article' | 'member' | 'partner';
      id: string;
      title: string;
      subtitle: string;
      icon: React.ReactNode;
      url: string;
      category: string;
    }> = [...quickNavMatches];

    searchResults.events.forEach((evt) => {
      items.push({
        type: 'event',
        id: `evt-${evt.id}`,
        title: evt.title,
        subtitle: `Tanggal: ${evt.date} • ${evt.status}`,
        icon: <Calendar className="h-4 w-4 text-emerald-600" />,
        url: `/acara?id=${evt.id}`,
        category: 'Acara & Webinar',
      });
    });

    searchResults.articles.forEach((art) => {
      items.push({
        type: 'article',
        id: `art-${art.id}`,
        title: art.title,
        subtitle: art.excerpt || 'Artikel IAI Muda',
        icon: <FileText className="h-4 w-4 text-cyan-600" />,
        url: `/artikel`,
        category: 'Artikel & Berita',
      });
    });

    searchResults.members.forEach((mem) => {
      items.push({
        type: 'member',
        id: `mem-${mem.id}`,
        title: mem.name,
        subtitle: `${mem.division || 'Pengurus IAI Muda'}${mem.university ? ` • ${mem.university}` : ''}`,
        icon: <Users className="h-4 w-4 text-indigo-600" />,
        url: `/struktur`,
        category: 'Pengurus & Anggota',
      });
    });

    searchResults.partners.forEach((part) => {
      items.push({
        type: 'partner',
        id: `part-${part.id}`,
        title: part.name,
        subtitle: part.university ? `Universitas: ${part.university}` : 'Mitra HIMA',
        icon: <Handshake className="h-4 w-4 text-amber-600" />,
        url: `/jejaring`,
        category: 'Mitra & HIMA',
      });
    });

    return items;
  }, [query, searchResults]);

  const items = combinedItems();

  const handleSelect = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  const handleKeyDownModal = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < items.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        handleSelect(items[selectedIndex].url);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 transition-all duration-200 animate-in fade-in"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col max-h-[80vh] transition-all transform animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownModal}
      >
        {/* Search Header Input */}
        <div className="relative border-b border-slate-100 flex items-center px-5 py-4 gap-3 bg-white">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ketik untuk mencari webinar, pengurus, artikel, atau navigasi..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none font-medium"
          />
          {loading ? (
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin shrink-0" />
          ) : query ? (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 text-xs bg-slate-100 rounded-lg p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-mono text-slate-500 font-bold border border-slate-200/80">
              ESC
            </kbd>
          )}
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
          {items.length > 0 ? (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                {query.length >= 2 ? 'Hasil Pencarian' : 'Navigasi Cepat & Fitur Utama'}
              </div>

              {items.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item.url)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/90 text-blue-900 border border-blue-100/80 shadow-xs'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`p-2 rounded-xl border shrink-0 ${
                          isSelected
                            ? 'bg-white border-blue-200 text-blue-600 shadow-xs'
                            : 'bg-slate-50 border-slate-100 text-slate-600'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold truncate tracking-tight">{item.title}</p>
                        <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {query.length >= 1 && (
                        <span className="hidden sm:inline-flex items-center text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                          {item.category}
                        </span>
                      )}
                      {isSelected && (
                        <span className="hidden sm:inline-flex items-center text-[10px] font-bold text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded-lg border border-blue-200/50">
                          Buka <ArrowRight className="h-3 w-3 ml-1" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Search className="h-8 w-8 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">Tidak ada hasil ditemukan</p>
              <p className="text-xs text-slate-400">Coba kata kunci lain seperti "webinar", "pengurus", atau "artikel".</p>
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-3 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] shadow-2xs font-mono font-bold">↑</kbd>
              <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] shadow-2xs font-mono font-bold">↓</kbd>
              <span className="ml-1">Pilih</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] shadow-2xs font-mono font-bold">↵</kbd>
              <span className="ml-1">Buka</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] shadow-2xs font-mono font-bold">ESC</kbd>
              <span className="ml-1">Tutup</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 font-semibold">
            <Command className="h-3.5 w-3.5" />
            <span>Command Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
}
