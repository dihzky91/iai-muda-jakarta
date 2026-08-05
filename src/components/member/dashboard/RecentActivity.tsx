'use client';

import { Clock, LogIn, UserCheck, FileEdit, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Activity {
  id: string;
  icon: React.ElementType;
  text: string;
  subtext?: string;
  time: string;
}

interface RecentActivityProps {
  lastLoginAt?: string | null;
  profileCompletionPercentage?: number;
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export default function RecentActivity({
  lastLoginAt,
  profileCompletionPercentage = 0,
}: RecentActivityProps) {
  const activities: Activity[] = [];

  if (lastLoginAt) {
    activities.push({
      id: 'login',
      icon: LogIn,
      text: 'Masuk ke portal pengurus',
      subtext: 'Sesi aktif di browser',
      time: formatRelativeTime(lastLoginAt),
    });
  }

  activities.push({
    id: 'hr_status',
    icon: ShieldCheck,
    text: 'Status Keanggotaan Verifikasi',
    subtext: 'Status HR: Hijau (Aktif)',
    time: 'Terverifikasi',
  });

  if (profileCompletionPercentage >= 50) {
    activities.push({
      id: 'profile',
      icon: UserCheck,
      text: 'Profil sudah terisi lebih dari 50%',
      subtext: 'Siap untuk direktori publik',
      time: 'Baru-baru ini',
    });
  }

  if (profileCompletionPercentage >= 80) {
    activities.push({
      id: 'complete',
      icon: FileEdit,
      text: 'Profil hampir lengkap',
      subtext: 'Kelengkapan akun optimal',
      time: 'Baru-baru ini',
    });
  }

  if (activities.length < 3) {
    activities.push({
      id: 'welcome',
      icon: Clock,
      text: 'Selamat datang di portal',
      subtext: 'IAI Muda Wilayah DKI Jakarta',
      time: 'Baru saja',
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Aktivitas Terbaru</h2>
            <p className="text-xs text-slate-500">Log & riwayat aktivitas akun</p>
          </div>
        </div>

        <ul className="space-y-3">
          {activities.slice(0, 3).map((activity, index) => (
            <li
              key={activity.id}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-white shadow-xs border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                <activity.icon className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{activity.text}</p>
                {activity.subtext && (
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{activity.subtext}</p>
                )}
                <p className="text-[10px] text-slate-500 mt-1 font-mono">{activity.time}</p>
              </div>
              {index === 0 && (
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0 animate-pulse" />
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100">
        <Link
          href="/portal/profile"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors"
        >
          Lihat Profil & Sesi <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
