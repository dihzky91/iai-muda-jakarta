'use client';

import Link from 'next/link';
import { Megaphone, ArrowRight, Newspaper, ShieldAlert, Calendar, Globe } from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  excerpt?: string | null;
  date: string;
  author: string;
  imageUrl?: string | null;
  category?: string | null;
}

interface AnnouncementsProps {
  announcements: Announcement[];
}

function formatDate(dateString: string) {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-6 px-4">
      <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-2">
        <Newspaper className="w-6 h-6 text-red-700" />
      </div>
      <h3 className="text-xs font-semibold text-slate-900">Belum Ada Pengumuman</h3>
      <p className="text-[11px] text-slate-500 mt-1 max-w-[220px]">
        Pantau terus informasi terbaru dari pengurus IAI Muda Jakarta.
      </p>
    </div>
  );
}

function getCategoryBadge(category?: string | null) {
  if (category === 'internal') {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 uppercase">
        <ShieldAlert className="w-2.5 h-2.5" /> INTERNAL
      </span>
    );
  }
  if (category === 'agenda') {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 uppercase">
        <Calendar className="w-2.5 h-2.5" /> AGENDA
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase">
      <Globe className="w-2.5 h-2.5" /> PUBLIK
    </span>
  );
}

export default function Announcements({ announcements }: AnnouncementsProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5 text-red-800" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Pengumuman & Edaran</h2>
              <p className="text-xs text-slate-500">Informasi resmi kepengurusan</p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
            OFFICIAL
          </span>
        </div>

        {announcements.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-2.5">
            {announcements.slice(0, 2).map((item) => (
              <li key={item.id}>
                <Link
                  href={`/portal/announcements/${item.id}`}
                  className="group block p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    {getCategoryBadge(item.category)}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatDate(item.date)}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-semibold text-slate-900 group-hover:text-red-800 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-800 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                  </div>
                  {item.excerpt && (
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {item.excerpt}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100">
        <Link
          href="/portal/announcements"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-red-800 hover:text-red-900 transition-colors"
        >
          Semua Pengumuman <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
