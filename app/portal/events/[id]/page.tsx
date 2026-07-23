'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Clock, Users, Globe, ExternalLink, FileText, Check, X, HelpCircle, Sparkles, CalendarDays } from 'lucide-react';
import RsvpButton from '@/src/components/member/events/RsvpButton';
import type { MemberEvent, RsvpStatus } from '@/src/types';

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<MemberEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus | null>(null);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/member/events/${id}`);
      const data = await res.json();
      if (data.success) {
        setEvent(data.data);
        setRsvpStatus(data.data.myRsvp?.status || null);
      } else {
        router.push('/portal/events');
      }
    } catch (err) {
      console.error('Failed to fetch event:', err);
      router.push('/portal/events');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-7 w-7 border-2 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-xs text-slate-500 mt-2">Memuat detail acara...</p>
      </div>
    );
  }

  if (!event) return null;

  const isInternal = event.eventType === 'internal';
  const eventDate = new Date(event.date + 'T00:00:00');
  const isCompleted = event.status === 'completed';

  return (
    <div className="space-y-4">
      {/* Compact back button */}
      <Link
        href="/portal/events"
        className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali
      </Link>

      {/* Hero: image OR title block */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {event.imageUrl ? (
          <div className="relative h-44 sm:h-56 bg-slate-100">
            <img src={event.imageUrl} alt={event.title} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TypeBadge type={isInternal ? 'internal' : 'public'} />
                <StatusBadge status={event.status || 'upcoming'} />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold leading-tight line-clamp-2">
                {event.title}
              </h1>
            </div>
          </div>
        ) : (
          <div className={`relative h-32 sm:h-40 flex items-center justify-center ${
            isInternal
              ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600'
              : 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600'
          }`}>
            {isInternal ? (
              <Users className="h-16 w-16 text-white/20" />
            ) : (
              <CalendarDays className="h-16 w-16 text-white/20" />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white text-center">
              <div className="flex items-center gap-1.5 mb-2">
                <TypeBadge type={isInternal ? 'internal' : 'public'} light />
                <StatusBadge status={event.status || 'upcoming'} light />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold leading-tight line-clamp-2">
                {event.title}
              </h1>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-3">
          {/* Meta info (compact grid) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetaItem icon={Calendar} label="Tanggal" value={eventDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} />
            {event.time && <MetaItem icon={Clock} label="Waktu" value={`${event.time} WIB`} />}
            {event.location && <MetaItem icon={MapPin} label="Lokasi" value={event.location} />}
            <MetaItem icon={isInternal ? Users : Globe} label="Tipe" value={isInternal ? 'Internal' : 'Publik'} />
          </div>

          {/* Description */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <FileText className="h-3.5 w-3.5 text-blue-600" />
              Deskripsi
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Public Google Form button */}
          {!isInternal && event.registrationUrl && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 space-y-2">
              <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                Pendaftaran Peserta
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pendaftaran via Google Form resmi yang dikelola panitia.
              </p>
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-sm hover:from-blue-500 hover:to-indigo-500 transition-all"
              >
                Buka Form Pendaftaran
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}

          {/* Coming Soon: Materials */}
          <div className="bg-amber-50/70 border-2 border-dashed border-amber-300 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-200 px-1.5 py-0.5 rounded-full">Coming Soon</span>
              <h2 className="text-xs font-bold text-slate-800">Materi & Dokumen Event</h2>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Fitur upload materi (slide, notulensi, sertifikat) oleh panitia event akan tersedia di iterasi berikutnya. Untuk saat ini, materi dibagikan via Google Drive atau WhatsApp grup panitia.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* RSVP Card (only for internal events) */}
          {isInternal && !isCompleted && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">RSVP Anda</h2>
              <RsvpButton
                eventId={event.id}
                currentStatus={rsvpStatus}
                onUpdate={(newStatus) => setRsvpStatus(newStatus)}
              />
            </div>
          )}

          {/* RSVP Stats (for internal events) */}
          {isInternal && event.stats && event.stats.totalResponded > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Statistik RSVP</h2>
              <p className="text-[10px] text-slate-500">{event.stats.totalResponded} orang sudah konfirmasi</p>
              <div className="space-y-1.5">
                <StatBar icon={Check} label="Akan Hadir" count={event.stats.totalAttending} color="emerald" />
                <StatBar icon={HelpCircle} label="Mungkin" count={event.stats.totalMaybe} color="amber" />
                <StatBar icon={X} label="Tidak Hadir" count={event.stats.totalNotAttending} color="rose" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="text-xs font-semibold text-slate-800 line-clamp-2">{value}</p>
    </div>
  );
}

function StatBar({ icon: Icon, label, count, color }: { icon: any; label: string; count: number; color: 'emerald' | 'amber' | 'rose' }) {
  const total = 0; // Will be replaced if needed
  const colorClass = {
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    rose: 'text-rose-600',
  }[color];

  return (
    <div className="flex items-center gap-2 text-[11px]">
      <Icon className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
      <span className="text-slate-700 flex-1">{label}</span>
      <span className={`font-bold ${colorClass}`}>{count}</span>
    </div>
  );
}

function TypeBadge({ type, light = false }: { type: 'public' | 'internal'; light?: boolean }) {
  if (type === 'internal') {
    return (
      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${light ? 'bg-white/20 text-white border border-white/30' : 'bg-purple-600 text-white'}`}>
        <Users className="h-2.5 w-2.5" /> Internal
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${light ? 'bg-white/20 text-white border border-white/30' : 'bg-emerald-500 text-white'}`}>
      <Globe className="h-2.5 w-2.5" /> Publik
    </span>
  );
}

function StatusBadge({ status, light = false }: { status: string; light?: boolean }) {
  const styles: Record<string, { label: string; cls: string }> = {
    ongoing: { label: 'Berlangsung', cls: light ? 'bg-white/20 text-white border border-white/30' : 'bg-emerald-500 text-white' },
    upcoming: { label: 'Mendatang', cls: light ? 'bg-white/20 text-white border border-white/30' : 'bg-amber-500 text-white' },
    completed: { label: 'Selesai', cls: light ? 'bg-white/20 text-white border border-white/30' : 'bg-slate-700 text-slate-200' },
  };
  const s = styles[status] || styles.upcoming;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold rounded-full ${s.cls}`}>
      {s.label}
    </span>
  );
}
