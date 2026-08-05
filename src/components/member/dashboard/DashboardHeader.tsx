'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Users,
  ShieldCheck,
  Building2,
  GraduationCap,
  ArrowRight,
  Megaphone,
  ChevronRight,
} from 'lucide-react';

interface DashboardHeaderProps {
  name: string;
  role?: string | null;
  generation?: string | null;
  division?: string | null;
  university?: string | null;
  imageUrl?: string | null;
  isAlumni?: boolean;
}

interface AnnouncementItem {
  id: number;
  title: string;
  date: string;
  category?: string;
  excerpt?: string;
}

export default function DashboardHeader({
  name,
  role,
  generation,
  division,
  university,
  imageUrl,
  isAlumni,
}: DashboardHeaderProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [heroBannerUrl, setHeroBannerUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/articles')
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          const sorted = result.data.sort(
            (a: AnnouncementItem, b: AnnouncementItem) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setAnnouncements(sorted.slice(0, 3));
        }
      })
      .catch(console.error);

    fetch('/api/settings')
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data?.heroBannerUrl) {
          setHeroBannerUrl(result.data.heroBannerUrl);
        } else {
          setHeroBannerUrl('/images/hero-card-asset-opt.png');
        }
      })
      .catch(() => setHeroBannerUrl('/images/hero-card-asset-opt.png'));
  }, []);

  const hour = new Date().getHours();
  let greeting = 'Selamat Datang';
  let greetingIcon = '✨';

  if (hour >= 5 && hour < 11) {
    greeting = 'Selamat Pagi';
    greetingIcon = '☀️';
  } else if (hour >= 11 && hour < 15) {
    greeting = 'Selamat Siang';
    greetingIcon = '🌤️';
  } else if (hour >= 15 && hour < 18) {
    greeting = 'Selamat Sore';
    greetingIcon = '🌆';
  } else {
    greeting = 'Selamat Malam';
    greetingIcon = '🌙';
  }

  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  const badgeLabel = isAlumni ? 'Anggota Alumni' : 'Pengurus Aktif';
  const latestAnnouncement = announcements[0];

  const activeBanner = heroBannerUrl || '/images/hero-card-asset-opt.png';
  const isCustomImage = activeBanner && activeBanner !== 'gradient';

  return (
    <section
      className="relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-9 text-white shadow-2xl shadow-blue-600/20 border border-blue-300/40 backdrop-blur-[20px] group transition-all"
      style={{
        background: 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 40%, #2563EB 70%, #4F46E5 100%)',
      }}
    >
      {/* Dynamic Background Image Overlay if activeBanner is set */}
      {isCustomImage && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={activeBanner}
            alt="Hero Banner Artwork"
            width={800}
            height={300}
            fetchPriority="high"
            className="w-full h-full object-cover object-right opacity-30 mix-blend-overlay transition-transform duration-700 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/70 to-indigo-900/40" />
        </div>
      )}

      {/* Decorative Ambient Light Glow Spots */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-900/30 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-200/10 rounded-full blur-2xl pointer-events-none z-0" />

      {/* Subtle Background Geometric Mesh Overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Column: Greeting & Info */}
        <div className="space-y-3.5 max-w-2xl">
          {/* Top Badges Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-md shadow-sm">
              <span>{greetingIcon}</span>
              <span>{greeting}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/25 text-emerald-100 border border-emerald-300/40 backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              {badgeLabel}
            </span>

            {division && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/15 text-blue-50 border border-white/25 backdrop-blur-md shadow-sm">
                <Building2 className="w-3.5 h-3.5 text-blue-100" />
                {division}
              </span>
            )}
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
            Halo, {name} 👋
          </h1>

          {/* Latest Announcement Highlight Ticker */}
          {latestAnnouncement && (
            <div className="pt-0.5">
              <Link
                href={`/portal/announcements/${latestAnnouncement.id}`}
                className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md text-xs font-medium text-white transition-all max-w-full truncate shadow-sm"
              >
                <span className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-bold text-[10px] uppercase tracking-wider">
                  <Megaphone className="w-3 h-3" /> INFO TERBARU
                </span>
                <span className="truncate group-hover:underline text-blue-50">
                  {latestAnnouncement.title}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-blue-200 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            </div>
          )}

          {/* Role, Generation & University details */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm font-medium">
            {role && (
              <span className="flex items-center gap-1.5 text-white font-semibold bg-white/20 px-2.5 py-0.5 rounded-lg border border-white/30 backdrop-blur-md shadow-sm">
                <ShieldCheck className="w-4 h-4 text-blue-100" />
                {role}
              </span>
            )}

            {role && generation && <span className="text-blue-200/70">|</span>}

            {generation && (
              <span className="text-blue-50 font-medium">{generation}</span>
            )}

            {university && (
              <>
                <span className="text-blue-200/70">|</span>
                <span className="flex items-center gap-1 text-blue-100 truncate max-w-[200px] sm:max-w-xs">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-200" />
                  {university}
                </span>
              </>
            )}
          </div>

          {/* Quick Action Button Links */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/portal/profile"
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-blue-800 text-xs font-bold shadow-lg shadow-blue-900/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <User className="w-4 h-4 text-blue-700" />
              <span>Edit Profil Saya</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-700 opacity-80" />
            </Link>

            <Link
              href="/portal/directory"
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-semibold backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Users className="w-4 h-4 text-blue-100" />
              <span>Direktori Anggota</span>
            </Link>
          </div>
        </div>

        {/* Right Column: 3D Membership Card & User Avatar Frame */}
        <div className="flex items-center gap-4 shrink-0">
          {activeBanner === '/images/hero-card-asset-opt.png' && (
            <div className="hidden lg:block relative group/card">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 opacity-40 blur-md group-hover/card:opacity-80 transition duration-500" />
              <img
                src="/images/hero-card-asset-opt.png"
                alt="Kartu Anggota IAI"
                width={176}
                height={110}
                fetchPriority="high"
                className="relative w-36 sm:w-44 h-auto object-contain rounded-xl shadow-2xl transition-all duration-500 hover:scale-105 hover:-rotate-2 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] border border-white/20"
              />
            </div>
          )}

          <Link
            href="/portal/profile"
            className="relative group cursor-pointer"
            title="Ke Profil Saya"
          >
            <div className="relative p-1.5 rounded-2xl bg-gradient-to-br from-white/40 via-white/20 to-blue-200/30 backdrop-blur-md shadow-2xl ring-2 ring-white/30 border border-white/40 group-hover:scale-105 transition-transform duration-300">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name}
                  width={112}
                  height={112}
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl object-cover border border-white/40 shadow-inner"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white text-2xl md:text-3xl font-bold border border-white/40 shadow-inner">
                  {initials}
                </div>
              )}
              {/* Online Indicator Badge */}
              <div className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-emerald-400/50 flex items-center gap-1 shadow-lg backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Aktif
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
