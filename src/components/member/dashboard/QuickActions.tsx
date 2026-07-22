'use client';

import Link from 'next/link';
import {
  User,
  Users,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';

const actions = [
  {
    id: 'profile',
    title: 'Edit Profil',
    description: 'Perbarui data dan foto Anda',
    icon: User,
    href: '/portal/profile',
    color: 'bg-blue-50 text-blue-700 border-blue-100 hover:border-blue-300 hover:bg-blue-100/50',
  },
  {
    id: 'directory',
    title: 'Direktori Anggota',
    description: 'Jaringan sesama anggota',
    icon: Users,
    href: '/portal/directory',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-100/50',
  },
  {
    id: 'events',
    title: 'Acara',
    description: 'Jadwal dan kegiatan',
    icon: Calendar,
    href: '/portal/events',
    color: 'bg-amber-50 text-amber-700 border-amber-100 hover:border-amber-300 hover:bg-amber-100/50',
  },
];

export default function QuickActions() {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Aksi Cepat</h2>
        <p className="text-sm text-slate-500 mt-0.5">Shortcut ke fitur utama</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className={`group relative p-4 rounded-2xl border-2 bg-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${action.color}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color.split(' ')[0]}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-current transition-colors" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">{action.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{action.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
