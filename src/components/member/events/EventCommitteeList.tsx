'use client';

import { Users, Briefcase } from 'lucide-react';
import type { EventCommittee } from '@/src/types';

interface EventCommitteeListProps {
  committees: EventCommittee[];
}

export default function EventCommitteeList({ committees }: EventCommitteeListProps) {
  if (!committees || committees.length === 0) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="h-4 w-4 text-purple-600" />
            Panitia Pelaksana
          </h2>
        </div>
        <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Belum ada panitia ditugaskan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="h-4 w-4 text-purple-600" />
          Panitia Pelaksana
        </h2>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
          {committees.length} orang
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {committees.map(committee => (
          <CommitteeItem key={committee.id} committee={committee} />
        ))}
      </div>
    </div>
  );
}

function CommitteeItem({ committee }: { committee: EventCommittee }) {
  const member = committee.member;
  const initials = member?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
      {member?.imageUrl ? (
        <img
          src={member.imageUrl}
          alt={member.name}
          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
        />
      ) : (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold">
          {initials}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-slate-800 truncate">{member?.name || 'Unknown'}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Briefcase className="h-3 w-3 text-purple-500" />
          <span className="text-[10px] text-purple-700 font-medium">{formatRole(committee.role)}</span>
        </div>
      </div>
    </div>
  );
}

function formatRole(role: string): string {
  return role
    .replace(/_/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
