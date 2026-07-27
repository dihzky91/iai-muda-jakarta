'use client';

import { Clock, LogIn, UserCheck, FileEdit } from 'lucide-react';

interface Activity {
  id: string;
  icon: React.ElementType;
  text: string;
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
      text: 'Masuk ke portal anggota',
      time: formatRelativeTime(lastLoginAt),
    });
  }

  if (profileCompletionPercentage >= 50) {
    activities.push({
      id: 'profile',
      icon: UserCheck,
      text: 'Profil sudah terisi lebih dari 50%',
      time: 'Baru-baru ini',
    });
  }

  if (profileCompletionPercentage >= 80) {
    activities.push({
      id: 'complete',
      icon: FileEdit,
      text: 'Profil hampir lengkap',
      time: 'Baru-baru ini',
    });
  }

  if (activities.length === 0) {
    activities.push({
      id: 'welcome',
      icon: Clock,
      text: 'Selamat datang di portal anggota IAI Muda Jakarta',
      time: 'Baru saja',
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <Clock className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Aktivitas Terbaru</h2>
          <p className="text-xs text-slate-500">Ringkasan aktivitas Anda</p>
        </div>
      </div>

      <ul className="space-y-3">
        {activities.map((activity, index) => (
          <li key={activity.id} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
              <activity.icon className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">{activity.text}</p>
              <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
            </div>
            {index === 0 && (
              <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
