'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Clock, Users, Globe, ExternalLink, FileText, Check, X, HelpCircle, Sparkles, CalendarDays } from 'lucide-react';
import { MemberLayout } from '@/src/components/member';
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
      <MemberLayout>
        <div className="text-center py-16">
          <div className="inline-block h-8 w-8 border-3 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 mt-3">Memuat detail agenda acara...</p>
        </div>
      </MemberLayout>
    );
  }

  if (!event) return null;

  const isInternal = event.eventType === 'internal';
  const eventDate = new Date(event.date + 'T00:00:00');
  const isCompleted = event.status === 'completed';

  return (
    <MemberLayout>
      <div className="space-y-6 pb-12">
        {/* Back Button */}
        <div className="flex items-center justify-between">
          <Link
            href="/portal/events"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-slate-600 hover:text-blue-600 hover:border-blue-300 shadow-sm transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Agenda Acara</span>
          </Link>

          <span className="text-xs text-slate-400 font-medium">ID Acara: #{event.id}</span>
        </div>

        {/* Hero Banner Container */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
          {event.imageUrl ? (
            <div className="relative h-56 sm:h-72 md:h-80 w-full bg-slate-900 overflow-hidden">
              <img
                src={event.imageUrl}
                alt={event.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white space-y-2">
                <div className="flex items-center gap-2">
                  <TypeBadge type={isInternal ? 'internal' : 'public'} />
                  <StatusBadge status={event.status || 'upcoming'} />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
                  {event.title}
                </h1>
              </div>
            </div>
          ) : (
            <div className={`relative h-52 sm:h-64 flex flex-col justify-end p-6 sm:p-8 text-white overflow-hidden ${
              isInternal
                ? 'bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900'
                : 'bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900'
            }`}>
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-2">
                  <TypeBadge type={isInternal ? 'internal' : 'public'} light />
                  <StatusBadge status={event.status || 'upcoming'} light />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
                  {event.title}
                </h1>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content (Left Column) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Metadata Cards Grid */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetaItem
                icon={Calendar}
                iconColor="text-blue-500 bg-blue-50"
                label="Tanggal"
                value={eventDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              />
              {event.time && (
                <MetaItem
                  icon={Clock}
                  iconColor="text-amber-500 bg-amber-50"
                  label="Waktu"
                  value={`${event.time} WIB`}
                />
              )}
              {event.location && (
                <MetaItem
                  icon={MapPin}
                  iconColor="text-rose-500 bg-rose-50"
                  label="Lokasi"
                  value={event.location}
                />
              )}
              <MetaItem
                icon={isInternal ? Users : Globe}
                iconColor={isInternal ? 'text-purple-500 bg-purple-50' : 'text-emerald-500 bg-emerald-50'}
                label="Tipe Acara"
                value={isInternal ? 'Internal Pengurus' : 'Terbuka Untuk Publik'}
              />
            </div>

            {/* Description Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <FileText className="h-4 w-4 text-blue-600" />
                Deskripsi & Detail Kegiatan
              </h2>
              <div className="h-px bg-slate-100" />
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                {event.description}
              </p>
            </div>

            {/* Public Registration Callout Card */}
            {!isInternal && event.registrationUrl && (
              <div className="bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-200 rounded-2xl p-5 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-blue-900">
                  <ExternalLink className="h-5 w-5 text-blue-600" />
                  <h2 className="text-sm font-extrabold uppercase tracking-wider">Pendaftaran Peserta Publik</h2>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Acara ini diselenggarakan secara publik. Anda dapat mendaftar melalui form pendaftaran resmi berikut.
                </p>
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Buka Form Pendaftaran Google</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}

            {/* Materials Section Notice */}
            <div className="bg-amber-50/70 border border-dashed border-amber-300/80 rounded-2xl p-4 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">
                  Materi Kegiatan
                </span>
                <h2 className="text-xs font-bold text-slate-800">Sertifikat & Slide Presentasi</h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Materi seminar dan notulensi acara dibagikan langsung oleh panitia pelaksana melalui grup internal atau tautan Drive resmi.
              </p>
            </div>
          </div>

          {/* Sidebar Controls (Right Column) */}
          <div className="space-y-5">
            {/* RSVP Card (Internal events only) */}
            {isInternal && !isCompleted && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    Konfirmasi RSVP
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Internal
                  </span>
                </div>
                <RsvpButton
                  eventId={event.id}
                  currentStatus={rsvpStatus}
                  onUpdate={(newStatus) => setRsvpStatus(newStatus)}
                />
              </div>
            )}

            {/* RSVP Stats Widget */}
            {isInternal && event.stats && event.stats.totalResponded > 0 && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Statistik RSVP Pengurus
                </h2>
                <p className="text-xs text-slate-500">{event.stats.totalResponded} pengurus telah mengisi partisipasi</p>
                <div className="space-y-2 pt-1">
                  <StatBar icon={Check} label="Akan Hadir" count={event.stats.totalAttending} color="emerald" />
                  <StatBar icon={HelpCircle} label="Mungkin Hadir" count={event.stats.totalMaybe} color="amber" />
                  <StatBar icon={X} label="Halangan / Absent" count={event.stats.totalNotAttending} color="rose" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}

function MetaItem({ icon: Icon, iconColor, label, value }: { icon: any; iconColor: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
          {label}
        </div>
        <p className="text-xs font-extrabold text-slate-800 line-clamp-2 leading-snug">{value}</p>
      </div>
    </div>
  );
}

function StatBar({ icon: Icon, label, count, color }: { icon: any; label: string; count: number; color: 'emerald' | 'amber' | 'rose' }) {
  const colorClass = {
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    amber: 'text-amber-700 bg-amber-50 border-amber-200',
    rose: 'text-rose-700 bg-rose-50 border-rose-200',
  }[color];

  return (
    <div className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold ${colorClass}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <span className="text-sm font-extrabold">{count}</span>
    </div>
  );
}

function TypeBadge({ type, light = false }: { type: 'public' | 'internal'; light?: boolean }) {
  if (type === 'internal') {
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full backdrop-blur-md shadow-sm ${
        light ? 'bg-white/20 text-white border border-white/30' : 'bg-purple-600 text-white'
      }`}>
        <Users className="h-3.5 w-3.5 text-purple-200" /> Acara Internal
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full backdrop-blur-md shadow-sm ${
      light ? 'bg-white/20 text-white border border-white/30' : 'bg-emerald-600 text-white'
    }`}>
      <Globe className="h-3.5 w-3.5 text-emerald-200" /> Acara Publik
    </span>
  );
}

function StatusBadge({ status, light = false }: { status: string; light?: boolean }) {
  const styles: Record<string, { label: string; cls: string }> = {
    ongoing: { label: 'Berlangsung', cls: light ? 'bg-emerald-500/30 text-emerald-100 border border-emerald-400/40' : 'bg-emerald-500 text-white' },
    upcoming: { label: 'Mendatang', cls: light ? 'bg-amber-500/30 text-amber-100 border border-amber-400/40' : 'bg-amber-500 text-white' },
    completed: { label: 'Selesai', cls: light ? 'bg-slate-800/50 text-slate-200 border border-slate-700/50' : 'bg-slate-700 text-slate-200' },
  };
  const s = styles[status] || styles.upcoming;
  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full backdrop-blur-md shadow-sm ${s.cls}`}>
      {s.label}
    </span>
  );
}
