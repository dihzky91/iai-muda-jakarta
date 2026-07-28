'use client';

import Link from 'next/link';
import { BadgeCheck, GraduationCap, Users, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

const benefits = [
  { id: 'discount', label: 'Diskon Seminar & Workshop', desc: 'Potongan khusus event IAI', icon: GraduationCap },
  { id: 'networking', label: 'Jaringan Akuntan Muda', desc: 'Koneksi profesional DKI', icon: Users },
  { id: 'directory', label: 'Akses Direktori Anggota', desc: 'Jejaring pengurus aktif', icon: BadgeCheck },
  { id: 'programs', label: 'Program Development', desc: 'Pelatihan & pembekalan', icon: Sparkles },
];

export default function MemberBenefits() {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-slate-800 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <BadgeCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Keuntungan Anggota</h2>
              <p className="text-xs text-slate-300">Manfaat eksklusif keanggotaan Anda</p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
            VIP ACCESS
          </span>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Nikmati akses ke jaringan profesional, pengembangan karir akuntan muda, dan prioritas pendaftaran event IAI Muda DKI.
        </p>

        <ul className="space-y-2">
          {benefits.map((benefit) => (
            <li
              key={benefit.id}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                <benefit.icon className="w-3.5 h-3.5 text-blue-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{benefit.label}</p>
                <p className="text-[10px] text-slate-400 truncate">{benefit.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-4 mt-4 border-t border-white/10">
        <Link
          href="/portal/onboarding"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 hover:text-white transition-colors"
        >
          Lihat Onboarding Library <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
