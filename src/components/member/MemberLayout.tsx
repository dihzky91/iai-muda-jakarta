'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  User,
  Settings,
  Globe,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Users,
  Calendar,
  CalendarDays,
  HelpCircle,
  Briefcase,
  BookOpenCheck,
  Megaphone,
  MessageSquare,
} from 'lucide-react';
import { useMemberAuth } from '@/src/context/MemberAuthContext';
import NotificationCenter from './community/NotificationCenter';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  external?: boolean;
  hasBadge?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Menu Utama',
    items: [
      { href: '/portal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/portal/feed', label: 'Ruang Komunitas', icon: MessageSquare },
      { href: '/portal/announcements', label: 'Pengumuman & Edaran', icon: Megaphone, hasBadge: true },
    ],
  },
  {
    title: 'Akun',
    items: [
      { href: '/portal/profile', label: 'Profil Saya', icon: User },
      { href: '/portal/settings', label: 'Pengaturan', icon: Settings },
    ],
  },
  {
    title: 'Organisasi',
    items: [
      { href: '/portal/onboarding', label: 'Onboarding Library', icon: BookOpenCheck },
      { href: '/portal/directory', label: 'Direktori Anggota', icon: Users },
      { href: '/portal/calendar', label: 'Kalender', icon: CalendarDays },
    ],
  },

  {
    title: 'Kegiatan',
    items: [
      { href: '/portal/events', label: 'Semua Acara', icon: Calendar },
      { href: '/portal/events/managed', label: 'Yang Saya Kelola', icon: Briefcase },
      { href: '/portal/events/internal', label: 'Event Internal', icon: Users },
    ],
  },
  {
    title: 'Dukungan',
    items: [
      { href: '/', label: 'Website Utama', icon: Globe, external: true },
      { href: '/portal/help', label: 'Pusat Bantuan', icon: HelpCircle },
    ],
  },
];

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { member, logout } = useMemberAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const avatarUrl = member?.imageUrl;
  const initials = member?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href);
    const baseClasses =
      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200';
    const activeClasses = 'bg-blue-50 text-blue-700 shadow-sm';
    const inactiveClasses = 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';

    const content = (
      <>
        <item.icon className={`w-5 h-5 ${active ? 'text-blue-700' : 'text-slate-400'}`} />
        <span className="flex-1 truncate">{item.label}</span>
        {item.hasBadge && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
          </span>
        )}
        {active && (
          <motion.div
            layoutId="activeIndicator"
            className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-700"
          />
        )}
        {item.external && <ChevronRight className="w-4 h-4 text-slate-400" />}
      </>
    );

    if (item.external) {
      return (
        <Link
          key={item.href}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseClasses} ${inactiveClasses}`}
        >
          {content}
        </Link>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
      >
        {content}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/80">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 flex-col bg-white border-r border-slate-200/80 shadow-sm z-30">
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <Link href="/portal/dashboard" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-white p-1 border border-slate-200/80 shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform shrink-0 flex items-center justify-center">
              <img
                src="/images/iai-muda-logo-badge.png"
                alt="IAI Muda Logo Badge"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-slate-900 leading-tight">
                Portal Pengurus
              </h1>
              <p className="text-xs text-slate-500 font-medium">IAI Muda Jakarta</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-5 px-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map(renderNavItem)}
              </div>
            </div>
          ))}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={member?.name || 'Member'}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-red-900 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{member?.name}</p>
              <p className="text-xs text-slate-500 truncate">
                {member?.position?.name || 'Anggota'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-800 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 z-40 flex items-center justify-between px-4">
        <Link href="/portal/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white p-1 border border-slate-200/80 shadow-md shrink-0 flex items-center justify-center">
            <img
              src="/images/iai-muda-logo-badge.png"
              alt="IAI Muda Logo Badge"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-display font-bold text-sm text-slate-900">Portal Pengurus</h1>
            <p className="text-[10px] text-slate-500">IAI Muda Jakarta</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-slate-700" /> : <Menu className="w-6 h-6 text-slate-700" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-x-0 top-16 bg-white border-b border-slate-200 shadow-xl z-30 px-4 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <nav className="space-y-5">
              {navGroups.map((group) => (
                <div key={group.title}>
                  <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    {group.title}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const active = isActive(item.href);
                      const baseClasses =
                        'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all';
                      const activeClasses = 'bg-blue-50 text-blue-700';
                      const inactiveClasses = 'text-slate-600 hover:bg-slate-100';

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          target={item.external ? '_blank' : undefined}
                          rel={item.external ? 'noopener noreferrer' : undefined}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
                        >
                          <item.icon className={`w-5 h-5 ${active ? 'text-blue-700' : 'text-slate-400'}`} />
                          <span className="flex-1">{item.label}</span>
                          {item.hasBadge && (
                            <span className="w-2 h-2 rounded-full bg-red-600" />
                          )}
                          {item.external && <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-800 hover:bg-red-50 cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                Keluar
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="lg:pl-72 pt-16 lg:pt-0 min-h-screen">
        <div className="hidden lg:flex items-center justify-end px-8 py-3 bg-white/50 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-20">
          <NotificationCenter />
        </div>
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
