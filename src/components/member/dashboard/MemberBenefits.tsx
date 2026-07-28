'use client';

import Link from 'next/link';
import { BadgeCheck, GraduationCap, Users, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

const benefits = [
  { id: 'discount', label: 'Prioritas Event & Sertifikasi', desc: 'Akses khusus program & pelatihan IAI', icon: GraduationCap },
  { id: 'networking', label: 'Jaringan Akuntan Muda', desc: 'Koneksi profesional DKI Jakarta', icon: Users },
  { id: 'directory', label: 'Akses Direktori Anggota', desc: 'Jejaring pengurus & alumni aktif', icon: BadgeCheck },
  { id: 'programs', label: 'Program Development', desc: 'Pembekalan & akselerasi karir', icon: Sparkles },
];

export default function MemberBenefits() {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm h-full flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <BadgeCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Keuntungan Anggota</h2>
              <p className="text-[11px] text-slate-500">Manfaat eksklusif keanggotaan Anda</p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
            VIP ACCESS
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Nikmati akses ke jaringan profesional, pengembangan karir akuntan muda, dan prioritas pendaftaran event IAI Muda DKI.
        </p>

        <ul className="space-y-2">
          {benefits.map((benefit) => (
            <li
              key={benefit.id}
              className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-200 transition-all"
            >
              <div className="w-7 h-7 rounded-xl bg-blue-100/70 flex items-center justify-center shrink-0">
                <benefit.icon className="w-3.5 h-3.5 text-blue-700" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{benefit.label}</p>
                <p className="text-[10px] text-slate-500 truncate">{benefit.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-3 border-t border-slate-100">
        <Link
          href="/portal/onboarding"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span>Lihat Onboarding Library</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
