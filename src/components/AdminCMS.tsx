'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard, Calendar, Users, History, BookOpen, Image as ImageIcon,
  ShieldCheck, Settings as SettingsIcon, LogOut, UserCog, Globe,
  PanelLeftClose, PanelLeft, Menu, X, FileText, ClipboardList, MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Generation, Member, Event, Article, GalleryItem, Settings, Pillar } from '../types';
import { useAuth } from '../context/AuthContext';
import EventsManager from './admin/EventsManager';
import MembersManager from './admin/MembersManager';
import ArticlesManager from './admin/ArticlesManager';
import GalleryManager from './admin/GalleryManager';
import PillarsManager from './admin/PillarsManager';
import GenerationsManager from './admin/GenerationsManager';
import SettingsManager from './admin/SettingsManager';
import OnboardingManager from './admin/OnboardingManager';
import UserManagement from './UserManagement';
import DashboardOverview from './admin/DashboardOverview';
import HRManager from './admin/hr/HRManager';
import CommunityModerationManager from './admin/CommunityModerationManager';

export type CmsTab = 'dashboard' | 'events' | 'members' | 'hr' | 'community' | 'articles' | 'gallery' | 'generations' | 'users' | 'settings' | 'pillars' | 'onboarding';

interface AdminCMSProps {
  generations: Generation[];
  setGenerations: React.Dispatch<React.SetStateAction<Generation[]>>;
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  gallery?: GalleryItem[];
  setGallery?: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
  pillars: Pillar[];
  setPillars: React.Dispatch<React.SetStateAction<Pillar[]>>;
  settings: Settings;
  onSettingsUpdate: (updated: Settings) => void;
}

interface NavCountProps {
  events: Event[];
  members: Member[];
  articles: Article[];
  gallery: GalleryItem[];
  generations: Generation[];
  pillars: Pillar[];
}

const NAV_ITEMS: Array<{ key: CmsTab; label: string; icon: React.ElementType; count?: (props: NavCountProps) => number }> = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'events', label: 'Agenda Acara', icon: Calendar, count: p => p.events.length },
  { key: 'members', label: 'Kepengurusan', icon: Users, count: p => p.members.length },
  { key: 'hr', label: 'HR Command Center', icon: ClipboardList },
  { key: 'community', label: 'Moderasi Feed', icon: MessageSquare },
  { key: 'onboarding', label: 'Onboarding Library', icon: FileText },
  { key: 'articles', label: 'Artikel & Berita', icon: BookOpen, count: p => p.articles.length },
  { key: 'gallery', label: 'Galeri Kegiatan', icon: ImageIcon, count: p => p.gallery?.length || 0 },
  { key: 'generations', label: 'Masa Transisi', icon: History, count: p => p.generations.length },
  { key: 'pillars', label: 'Pilar Organisasi', icon: ShieldCheck, count: p => p.pillars.length },
  { key: 'settings', label: 'Pengaturan', icon: SettingsIcon },
];


export default function AdminCMS({
  generations,
  setGenerations,
  members,
  setMembers,
  events,
  setEvents,
  articles,
  setArticles,
  gallery = [],
  setGallery,
  pillars,
  setPillars,
  settings,
  onSettingsUpdate,
}: AdminCMSProps) {
  const [cmsTab, setCmsTab] = useState<CmsTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user: currentUser, logout, hasRole } = useAuth();

  const activeGen = useMemo(() => generations.find(g => g.isActive), [generations]);

  const divisionList = useMemo(() => {
    try {
      const parsed = JSON.parse(settings?.divisions || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch { /* noop */ }
    return ['Badan Pengurus Harian (BPH)', 'Bidang Edukasi & Sertifikasi', 'Bidang Hubungan Masyarakat', 'Bidang Kewirausahaan & Kemitraan', 'Bidang Media & Desain Kreatif'];
  }, [settings?.divisions]);

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    if (mobileOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = original; };
    }
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const handleViewFrontend = () => {
    window.location.href = '/';
  };

  const handleNav = (key: CmsTab) => {
    setCmsTab(key);
    setMobileOpen(false);
  };

  const navLabelMap: Record<CmsTab, string> = {
    dashboard: 'Dashboard',
    events: 'Agenda Acara',
    members: 'Kepengurusan',
    hr: 'HR Command Center',
    community: 'Moderasi Feed',
    onboarding: 'Onboarding Library',
    articles: 'Artikel & Berita',
    gallery: 'Galeri Kegiatan',
    generations: 'Masa Transisi',
    pillars: 'Pilar Organisasi',
    settings: 'Pengaturan',
    users: 'Manajemen User',
  };

  const renderContent = () => {
    switch (cmsTab) {
      case 'dashboard':
        return (
          <DashboardOverview
            events={events}
            members={members}
            articles={articles}
            gallery={gallery}
            generations={generations}
            pillars={pillars}
          />
        );
      case 'events':
        return <EventsManager events={events} setEvents={setEvents} />;
      case 'members':
        return (
          <MembersManager
            members={members}
            setMembers={setMembers}
            generations={generations}
            divisionList={divisionList}
            activeGen={activeGen}
          />
        );
      case 'hr':
        return <HRManager />;
      case 'community':
        return <CommunityModerationManager />;
      case 'onboarding':
        return <OnboardingManager />;
      case 'articles':
        return <ArticlesManager articles={articles} setArticles={setArticles} />;

      case 'gallery':
        return setGallery ? <GalleryManager gallery={gallery} setGallery={setGallery} /> : null;
      case 'generations':
        return (
          <GenerationsManager
            generations={generations}
            setGenerations={setGenerations}
            members={members}
          />
        );
      case 'pillars':
        return <PillarsManager pillars={pillars} setPillars={setPillars} />;
      case 'settings':
        return <SettingsManager settings={settings} onSettingsUpdate={onSettingsUpdate} />;
      case 'users':
        return hasRole('superadmin') ? <UserManagement /> : null;
      default:
        return null;
    }
  };

  const SidebarContent = () => (
    <div className={`p-4 md:p-6 space-y-6 ${sidebarCollapsed ? 'md:px-3' : ''}`}>
      {/* Brand */}
      <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'md:justify-center' : ''}`}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold shadow-lg shadow-blue-500/20 shrink-0">
          <ShieldCheck className="h-5.5 w-5.5" />
        </div>
        {!sidebarCollapsed && (
          <div className="transition-opacity duration-300">
            <h1 className="font-display font-extrabold text-sm text-slate-900 tracking-wider uppercase">IAI MUDA DKI</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-500 font-bold tracking-wider font-mono uppercase">Portal Admin</span>
            </div>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <div className={`${sidebarCollapsed ? 'md:flex md:justify-center' : 'hidden md:flex md:justify-end'}`}>
        <button
          type="button"
          onClick={() => setSidebarCollapsed(v => !v)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          title={sidebarCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          aria-label={sidebarCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
        >
          {sidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Quick Metrics */}
      <div className={`bg-slate-50 rounded-2xl border border-slate-200 space-y-2 ${sidebarCollapsed ? 'md:hidden' : 'p-4'}`}>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Kondisi Kepengurusan</span>
        <div className="text-xs font-semibold text-slate-700">
          {activeGen ? (
            <div className="flex items-center justify-between">
              <span>Aktif:</span>
              <span className="text-blue-700 font-bold">{activeGen.name}</span>
            </div>
          ) : (
            <span className="text-amber-700">Generasi Belum Aktif</span>
          )}
        </div>
        {currentUser && (
          <div className="pt-1 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[10px] text-slate-600 font-semibold truncate max-w-[60%]">{currentUser.username}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
              currentUser.role === 'superadmin' ? 'bg-indigo-50 text-indigo-800 border-indigo-100' :
              currentUser.role === 'admin' ? 'bg-blue-50 text-blue-800 border-blue-100' :
              'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {currentUser.role === 'superadmin' ? 'Super Admin' : currentUser.role === 'admin' ? 'Admin' : 'Editor'}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {!sidebarCollapsed && (
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-3 pb-2">Navigasi Utama</span>
        )}
        {NAV_ITEMS.map(item => {
          const isActive = cmsTab === item.key;
          return (
            <button
              key={item.key}
              id={`cms-tab-${item.key}-sidebar`}
              onClick={() => handleNav(item.key)}
              title={sidebarCollapsed ? item.label : undefined}
              className={`group relative w-full flex items-center ${sidebarCollapsed ? 'md:justify-center' : 'justify-between'} px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className={`flex items-center ${sidebarCollapsed ? 'md:gap-0' : 'gap-3'}`}>
                <item.icon className="h-4.5 w-4.5" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </div>
              {isActive && sidebarCollapsed && (
                <span className="absolute -right-1 top-1/2 -translate-y-1/2 h-6 w-1 rounded-l-full bg-blue-600" />
              )}
              {!sidebarCollapsed && item.count && (
                <span className={`opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                  isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-700'
                }`}>
                  {item.count({ events, members, articles, gallery, generations, pillars })}
                </span>
              )}
            </button>
          );
        })}

        {hasRole('superadmin') && (
          <button
            id="cms-tab-users-sidebar"
            onClick={() => handleNav('users')}
            title={sidebarCollapsed ? navLabelMap.users : undefined}
            className={`group relative w-full flex items-center ${sidebarCollapsed ? 'md:justify-center' : 'justify-between'} px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
              cmsTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className={`flex items-center ${sidebarCollapsed ? 'md:gap-0' : 'gap-3'}`}>
              <UserCog className="h-4.5 w-4.5" />
              {!sidebarCollapsed && <span>{navLabelMap.users}</span>}
            </div>
            {cmsTab === 'users' && sidebarCollapsed && (
              <span className="absolute -right-1 top-1/2 -translate-y-1/2 h-6 w-1 rounded-l-full bg-indigo-600" />
            )}
          </button>
        )}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row w-full font-sans" id="admin-dashboard-layout">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold shadow-md shadow-blue-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-xs text-slate-900 tracking-wider uppercase">IAI MUDA DKI</h1>
            <p className="text-[9px] text-slate-500 font-bold tracking-wider font-mono uppercase">Portal Admin</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          aria-label="Buka menu navigasi"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? 'md:w-20' : 'md:w-64'
        } hidden md:flex bg-white border-r border-slate-200 flex-col justify-between shrink-0 transition-all duration-300`}
      >
        <SidebarContent />

        {/* Exit Controls */}
        <div className="p-6 border-t border-slate-200 space-y-3 bg-white">
          <button
            id="view-frontend-btn"
            onClick={handleViewFrontend}
            title={sidebarCollapsed ? 'Lihat Halaman Depan' : undefined}
            className={`w-full flex items-center justify-center ${sidebarCollapsed ? 'md:px-2' : 'gap-2'} rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-600/10 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40`}
          >
            <Globe className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>Lihat Halaman Depan</span>}
          </button>
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? 'Keluar Portal Admin' : undefined}
            className={`w-full flex items-center justify-center ${sidebarCollapsed ? 'md:px-2' : 'gap-2'} rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 py-3 text-xs font-bold transition-all border border-slate-200 cursor-pointer shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>Keluar Portal Admin</span>}
          </button>
          <div className={`text-[10px] text-slate-500 text-center font-mono font-medium ${sidebarCollapsed ? 'md:hidden' : ''}`}>
            IKATAN AKUNTAN INDONESIA
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed top-0 left-0 h-full w-[280px] bg-white shadow-2xl z-50 flex flex-col md:hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="font-display font-extrabold text-sm text-slate-900 tracking-wider uppercase">Menu Admin</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                  aria-label="Tutup menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarContent />
              </div>
              <div className="p-4 border-t border-slate-200 space-y-3 bg-white">
                <button
                  onClick={handleViewFrontend}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-600/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                >
                  <Globe className="h-4 w-4" />
                  <span>Lihat Halaman Depan</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 py-3 text-xs font-bold transition-all border border-slate-200 cursor-pointer shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar Portal Admin</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto min-h-screen transition-all duration-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={cmsTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
