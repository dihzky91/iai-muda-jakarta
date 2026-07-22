'use client';

import Link from 'next/link';
import { ArrowRight, Circle, CheckCircle2 } from 'lucide-react';

interface ThingsToDoProps {
  member: {
    imageUrl?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    bio?: string | null;
    linkedinUrl?: string | null;
    university?: string | null;
  };
}

interface Task {
  id: string;
  label: string;
  done: boolean;
  href: string;
}

export default function ThingsToDo({ member }: ThingsToDoProps) {
  const tasks: Task[] = [
    { id: 'phone', label: 'Lengkapi nomor telepon', done: !!member.phone, href: '/portal/profile' },
    { id: 'whatsapp', label: 'Tambahkan WhatsApp', done: !!member.whatsapp, href: '/portal/profile' },
    { id: 'linkedin', label: 'Tambahkan LinkedIn', done: !!member.linkedinUrl, href: '/portal/profile' },
    { id: 'photo', label: 'Unggah foto profil', done: !!member.imageUrl, href: '/portal/profile' },
    { id: 'university', label: 'Isi universitas', done: !!member.university, href: '/portal/profile' },
    { id: 'bio', label: 'Tulis bio singkat', done: !!member.bio, href: '/portal/profile' },
  ];

  const pendingTasks = tasks.filter((t) => !t.done);

  if (pendingTasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Tugas Selesai</h2>
            <p className="text-sm text-slate-500 mt-1">
              Semua tugas utama sudah selesai. Terus perbarui profil Anda untuk tetap aktif.
            </p>
            <Link
              href="/portal/profile"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              Lihat Profil <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Yang Perlu Dikerjakan</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {pendingTasks.length} tugas menunggu untuk diselesaikan
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        {pendingTasks.slice(0, 4).map((task) => (
          <li key={task.id}>
            <Link
              href={task.href}
              className="group flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
            >
              <Circle className="w-5 h-5 text-slate-300 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
              <span className="flex-1 text-sm font-medium text-slate-700 group-hover:text-slate-900">
                {task.label}
              </span>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
