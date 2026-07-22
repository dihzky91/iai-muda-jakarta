'use client';

import { motion } from 'motion/react';
import { CheckCircle2, Circle } from 'lucide-react';

interface ProfileCompletenessProps {
  member: {
    imageUrl?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    bio?: string | null;
    linkedinUrl?: string | null;
    university?: string | null;
  };
}

export default function ProfileCompleteness({ member }: ProfileCompletenessProps) {
  const checks = [
    { label: 'Foto Profil', filled: !!member.imageUrl },
    { label: 'Nomor Telepon', filled: !!member.phone },
    { label: 'WhatsApp', filled: !!member.whatsapp },
    { label: 'Bio', filled: !!member.bio },
    { label: 'LinkedIn', filled: !!member.linkedinUrl },
    { label: 'Universitas', filled: !!member.university },
  ];

  const filledCount = checks.filter((c) => c.filled).length;
  const percentage = Math.round((filledCount / checks.length) * 100);

  let statusColor = 'bg-red-500';
  let statusText = 'Perlu dilengkapi';
  if (percentage >= 80) {
    statusColor = 'bg-emerald-500';
    statusText = 'Profil Lengkap';
  } else if (percentage >= 50) {
    statusColor = 'bg-amber-500';
    statusText = 'Hampir Lengkap';
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Kelengkapan Profil</h3>
          <p className="text-sm text-slate-500 mt-0.5">Lengkapi profil Anda untuk memaksimalkan jaringan</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-slate-900">{percentage}%</span>
          <p className="text-xs text-slate-500">{filledCount}/{checks.length}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${statusColor}`}
        />
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2">
            {check.filled ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
            )}
            <span className={`text-xs font-medium ${check.filled ? 'text-slate-700' : 'text-slate-400'}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusColor}`} />
          <span className="text-sm font-medium text-slate-700">{statusText}</span>
        </div>
      </div>
    </div>
  );
}
