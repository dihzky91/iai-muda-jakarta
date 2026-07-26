'use client';

import { useState } from 'react';
import { Check, X, HelpCircle, Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { RsvpStatus } from '@/src/types';

interface RsvpButtonProps {
  eventId: number;
  currentStatus?: RsvpStatus | null;
  stats?: { totalAttending: number; totalMaybe: number; totalNotAttending: number; totalResponded: number };
  onUpdate?: (newStatus: RsvpStatus | null) => void;
}

const STATUS_OPTIONS: { value: RsvpStatus; label: string; icon: LucideIcon; ring: string; active: string; icon_active: string; icon_inactive: string }[] = [
  {
    value: 'attending',
    label: 'Akan Hadir',
    icon: Check,
    ring: 'hover:border-emerald-400 hover:bg-emerald-50/50',
    active: 'border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-200/50',
    icon_active: 'text-emerald-600',
    icon_inactive: 'text-slate-400 group-hover:text-emerald-500',
  },
  {
    value: 'maybe',
    label: 'Mungkin',
    icon: HelpCircle,
    ring: 'hover:border-amber-400 hover:bg-amber-50/50',
    active: 'border-amber-500 bg-amber-50 shadow-sm shadow-amber-200/50',
    icon_active: 'text-amber-600',
    icon_inactive: 'text-slate-400 group-hover:text-amber-500',
  },
  {
    value: 'not_attending',
    label: 'Tidak Hadir',
    icon: X,
    ring: 'hover:border-rose-400 hover:bg-rose-50/50',
    active: 'border-rose-500 bg-rose-50 shadow-sm shadow-rose-200/50',
    icon_active: 'text-rose-600',
    icon_inactive: 'text-slate-400 group-hover:text-rose-500',
  },
];

export default function RsvpButton({ eventId, currentStatus = null, stats, onUpdate }: RsvpButtonProps) {
  const [status, setStatus] = useState<RsvpStatus | null>(currentStatus);
  const [loading, setLoading] = useState<RsvpStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRsvp = async (newStatus: RsvpStatus) => {
    setLoading(newStatus);
    setError(null);
    try {
      const res = await fetch(`/api/member/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menyimpan RSVP');
      }

      setStatus(newStatus);
      onUpdate?.(newStatus);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleCancelRsvp = async () => {
    setLoading('attending');
    setError(null);
    try {
      const res = await fetch(`/api/member/events/${eventId}/rsvp`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setStatus(null);
      onUpdate?.(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-2.5">
      <p className="text-xs font-bold text-slate-700">Konfirmasi Kehadiran Anda:</p>

      <div className="grid grid-cols-3 gap-1.5">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = status === opt.value;
          const isLoading = loading === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => handleRsvp(opt.value)}
              disabled={loading !== null}
              className={`group flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-lg border-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                isActive ? opt.active : `bg-white border-slate-200 ${opt.ring}`
              }`}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              ) : (
                <Icon className={`h-4 w-4 ${isActive ? opt.icon_active : opt.icon_inactive}`} />
              )}
              <span className={`text-[10px] font-bold leading-tight ${isActive ? opt.icon_active : 'text-slate-600'}`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {status && (
        <button
          onClick={handleCancelRsvp}
          disabled={loading !== null}
          className="text-[10px] text-slate-500 hover:text-rose-600 underline transition-colors disabled:opacity-60"
        >
          Batalkan RSVP
        </button>
      )}

      {error && (
        <p className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
