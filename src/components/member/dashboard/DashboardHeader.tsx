'use client';

import Link from 'next/link';

interface DashboardHeaderProps {
  name: string;
  role?: string | null;
  generation?: string | null;
  imageUrl?: string | null;
  isAlumni?: boolean;
}

export default function DashboardHeader({
  name,
  role,
  generation,
  imageUrl,
  isAlumni,
}: DashboardHeaderProps) {
  const firstName = name?.split(' ')[0] || name;

  const hour = new Date().getHours();
  let greeting = 'Selamat Malam';
  if (hour < 12) greeting = 'Selamat Pagi';
  else if (hour < 17) greeting = 'Selamat Siang';

  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  const badgeLabel = isAlumni ? 'Anggota Alumni' : 'Pengurus Aktif';

  return (
    <section className="flex items-center justify-between gap-4 min-h-[90px] lg:min-h-[100px]">
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-slate-500">{greeting}</p>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-900">
          Halo, {firstName} 👋
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          {role && <span>{role}</span>}
          {role && generation && <span className="text-slate-300">·</span>}
          {generation && <span>{generation}</span>}
          <span
            className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
              isAlumni
                ? 'bg-slate-100 text-slate-600'
                : 'bg-blue-50 text-blue-700'
            }`}
          >
            {badgeLabel}
          </span>
        </div>
      </div>

      <Link
        href="/portal/profile"
        className="relative group flex-shrink-0"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-14 h-14 lg:w-16 lg:h-16 rounded-full object-cover border-2 border-white shadow-md group-hover:shadow-lg transition-shadow"
          />
        ) : (
          <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-blue-600 to-red-900 flex items-center justify-center text-white text-lg font-bold border-2 border-white shadow-md group-hover:shadow-lg transition-shadow">
            {initials}
          </div>
        )}
        <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
      </Link>
    </section>
  );
}
