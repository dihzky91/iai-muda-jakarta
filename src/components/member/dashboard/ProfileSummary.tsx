'use client';

import { useState } from 'react';
import { Eye, Briefcase, GraduationCap, Shield, Sparkles } from 'lucide-react';
import MemberJourneyModal from '@/src/components/member/MemberJourneyModal';

interface ProfileSummaryProps {
  member: {
    showPublic?: boolean;
    division?: string | null;
    position?: { name?: string | null } | null;
    university?: string | null;
  };
}

export default function ProfileSummary({ member }: ProfileSummaryProps) {
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);

  const items = [
    {
      label: 'Status Profil',
      value: member.showPublic ? 'Publik' : 'Privat',
      subtext: member.showPublic ? 'Tampil di website' : 'Hanya Anda yang lihat',
      icon: Eye,
      color: member.showPublic ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-100',
    },
    {
      label: 'Divisi',
      value: member.division || 'Belum ada divisi',
      subtext: member.position?.name || 'Anggota',
      icon: Briefcase,
      color: 'text-blue-700 bg-blue-50',
    },
    {
      label: 'Universitas',
      value: member.university || 'Belum diisi',
      subtext: 'Kampus asal',
      icon: GraduationCap,
      color: 'text-red-800 bg-red-50',
    },
  ];

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Ringkasan Profil</h2>
              <p className="text-xs text-slate-500">Informasi dasar keanggotaan</p>
            </div>
          </div>

          <button
            onClick={() => setIsJourneyOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            My Journey
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">{item.label}</p>
                <p className="text-sm font-semibold text-slate-900 truncate">{item.value}</p>
                <p className="text-xs text-slate-500">{item.subtext}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MemberJourneyModal isOpen={isJourneyOpen} onClose={() => setIsJourneyOpen(false)} />
    </>
  );
}
