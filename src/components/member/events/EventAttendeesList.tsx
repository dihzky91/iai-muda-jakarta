'use client';

import { useEffect, useState } from 'react';
import { Users, Check, X, HelpCircle, Loader2 } from 'lucide-react';
import type { RsvpStats } from '@/src/types';

interface Attendee {
  id: number;
  eventId: number;
  memberId: number;
  status: 'attending' | 'not_attending' | 'maybe';
  respondedAt: string;
  member: {
    id: number;
    name: string;
    email: string | null;
    imageUrl: string | null;
    division: string | null;
    isAlumni: boolean | null;
  };
}

interface EventAttendeesListProps {
  eventId: number;
}

const STATUS_OPTIONS = [
  { value: 'attending', label: 'Hadir', icon: Check, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { value: 'maybe', label: 'Mungkin', icon: HelpCircle, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { value: 'not_attending', label: 'Tidak Hadir', icon: X, color: 'text-rose-700 bg-rose-50 border-rose-200' },
];

export default function EventAttendeesList({ eventId }: EventAttendeesListProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [stats, setStats] = useState<RsvpStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendees();
  }, [eventId]);

  const fetchAttendees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/member/events/${eventId}/attendees`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memuat daftar peserta');
      }

      setAttendees(data.attendees || []);
      setStats(data.stats || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-xs font-medium">Memuat daftar peserta...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <p className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
          ⚠️ {error}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="h-4 w-4 text-emerald-600" />
          Daftar Kehadiran
        </h2>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          {attendees.length} respon
        </span>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-2">
          {STATUS_OPTIONS.map(opt => {
            const count = opt.value === 'attending' ? stats.totalAttending :
                         opt.value === 'maybe' ? stats.totalMaybe : stats.totalNotAttending;
            return (
              <div key={opt.value} className={`text-center p-2 rounded-xl border ${opt.color}`}>
                <div className="text-lg font-extrabold">{count}</div>
                <div className="text-[9px] font-bold">{opt.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {attendees.length === 0 ? (
        <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Belum ada konfirmasi kehadiran</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {attendees.map(attendee => (
            <AttendeeItem key={attendee.id} attendee={attendee} />
          ))}
        </div>
      )}
    </div>
  );
}

function AttendeeItem({ attendee }: { attendee: Attendee }) {
  const member = attendee.member;
  const statusOption = STATUS_OPTIONS.find(s => s.value === attendee.status) || STATUS_OPTIONS[0];
  const StatusIcon = statusOption.icon;
  const initials = member?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {member?.imageUrl ? (
          <img
            src={member.imageUrl}
            alt={member.name}
            className="w-9 h-9 rounded-xl object-cover border border-slate-200"
          />
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-800 truncate">{member?.name || 'Unknown'}</p>
          <p className="text-[10px] text-slate-500 truncate">{member?.division || 'Anggota'}</p>
        </div>
      </div>

      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold ${statusOption.color}`}>
        <StatusIcon className="h-3 w-3" />
        {statusOption.label}
      </div>
    </div>
  );
}
