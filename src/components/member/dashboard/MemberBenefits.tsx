'use client';

import { BadgeCheck, GraduationCap, Users, Sparkles } from 'lucide-react';

const benefits = [
  { id: 'discount', label: 'Diskon Seminar', icon: GraduationCap },
  { id: 'networking', label: 'Networking', icon: Users },
  { id: 'directory', label: 'Direktori Anggota', icon: BadgeCheck },
  { id: 'programs', label: 'Program Eksklusif', icon: Sparkles },
];

export default function MemberBenefits() {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md h-full flex flex-col justify-between">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <BadgeCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Keuntungan Anggota</h2>
          <p className="text-xs text-slate-300">Manfaat keanggotaan Anda</p>
        </div>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {benefits.map((benefit) => (
          <li
            key={benefit.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <benefit.icon className="w-4 h-4 text-blue-300 shrink-0" />
            <span className="text-sm font-medium">{benefit.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
