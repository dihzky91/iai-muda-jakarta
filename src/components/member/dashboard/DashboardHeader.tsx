'use client';

import Link from 'next/link';
import { User, Users, ShieldCheck, Building2, GraduationCap, ArrowRight } from 'lucide-react';

interface DashboardHeaderProps {
  name: string;
  role?: string | null;
  generation?: string | null;
  division?: string | null;
  university?: string | null;
  imageUrl?: string | null;
  isAlumni?: boolean;
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

  return (
    <section 
      className="relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-9 text-white shadow-xl shadow-blue-600/25 border border-blue-300/40 backdrop-blur-[20px]"
      style={{
        background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #60A5FA 100%)',
      }}
    >
      {/* Decorative Ambient Light Glow Spots */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-200/10 rounded-full blur-2xl pointer-events-none" />

      {/* Subtle Background Geometric Mesh Overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Column: Greeting & Info */}
        <div className="space-y-3.5 max-w-2xl">
          {/* Status & Greeting Badges */}
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
              <span className="text-blue-50 font-medium">
                {generation}
              </span>
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

        {/* Right Column: User Avatar Frame */}
        <div className="flex sm:flex-col items-center md:items-end justify-between sm:justify-center gap-4 shrink-0">
          <Link
            href="/portal/profile"
            className="relative group cursor-pointer"
            title="Ke Profil Saya"
          >
            <div className="relative p-1 rounded-2xl bg-gradient-to-br from-white/40 via-white/20 to-blue-200/30 backdrop-blur-md shadow-2xl ring-2 ring-white/30 border border-white/40 group-hover:scale-105 transition-transform duration-300">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-white/40 shadow-inner"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white text-2xl font-bold border border-white/40 shadow-inner">
                  {initials}
                </div>
              )}
              {/* Online Indicator Badge */}
              <div className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-emerald-400/50 flex items-center gap-1 shadow-lg backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Aktif</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
