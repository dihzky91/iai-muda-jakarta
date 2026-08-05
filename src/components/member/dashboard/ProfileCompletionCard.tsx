'use client';

import { motion } from 'motion/react';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ProfileCompletionCardProps {
  member: {
    imageUrl?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    bio?: string | null;
    linkedinUrl?: string | null;
    university?: string | null;
  };
}

export default function ProfileCompletionCard({ member }: ProfileCompletionCardProps) {
  const checks = [
    { label: 'Foto Profil', filled: !!member.imageUrl },
    { label: 'Universitas', filled: !!member.university },
    { label: 'Nomor Telepon', filled: !!member.phone },
    { label: 'WhatsApp', filled: !!member.whatsapp },
    { label: 'LinkedIn', filled: !!member.linkedinUrl },
    { label: 'Bio', filled: !!member.bio },
  ];

  const filledCount = checks.filter((c) => c.filled).length;
  const percentage = Math.round((filledCount / checks.length) * 100);

  let statusColor = 'bg-red-700';
  let statusText = 'Perlu dilengkapi';
  let statusBg = 'bg-red-50 text-red-800';

  if (percentage >= 80) {
    statusColor = 'bg-emerald-500';
    statusText = 'Profil Lengkap';
    statusBg = 'bg-emerald-50 text-emerald-800';
  } else if (percentage >= 50) {
    statusColor = 'bg-amber-500';
    statusText = 'Hampir Lengkap';
    statusBg = 'bg-amber-50 text-amber-800';
  }

  const remaining = checks.filter((c) => !c.filled);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Kelengkapan Profil</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lengkapi data diri Anda
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-slate-900">{percentage}%</span>
          <p className="text-[11px] text-slate-500 font-medium">{filledCount}/{checks.length} selesai</p>
        </div>
      </div>

      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${statusColor}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
            {check.filled ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            )}
            <span className={`text-xs font-medium truncate ${check.filled ? 'text-slate-700' : 'text-slate-500'}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>

      {remaining.length > 0 && (
        <div className="mb-4 p-3 bg-red-50/60 rounded-xl border border-red-100/80">
          <p className="text-[11px] font-semibold text-red-800 uppercase tracking-wider mb-1.5">
            Perlu Diisi ({remaining.length}):
          </p>
          <ul className="space-y-1">
            {remaining.slice(0, 3).map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-xs text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-red-700 shrink-0" />
                Lengkapi {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusBg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
          {statusText}
        </span>

        <Link
          href="/portal/profile"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-red-900 text-white rounded-xl text-xs font-semibold hover:bg-red-950 focus:ring-4 focus:ring-red-900/20 transition-all shadow-sm"
        >
          {percentage === 100 ? 'Edit' : 'Lengkapi'}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
