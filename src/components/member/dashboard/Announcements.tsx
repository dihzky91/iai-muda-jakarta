'use client';

import Link from 'next/link';
import { Megaphone, ArrowRight, Newspaper } from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  excerpt?: string | null;
  date: string;
  author: string;
  imageUrl?: string | null;
}

interface AnnouncementsProps {
  announcements: Announcement[];
}

function formatDate(dateString: string) {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-8 px-4">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
        <Newspaper className="w-7 h-7 text-red-700" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">Belum Ada Pengumuman</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
        Pantau terus informasi terbaru dari pengurus IAI Muda Jakarta.
      </p>
    </div>
  );
}

export default function Announcements({ announcements }: AnnouncementsProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Pengumuman</h2>
          <p className="text-sm text-slate-500 mt-0.5">Informasi terbaru organisasi</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
          <Megaphone className="w-5 h-5 text-red-800" />
        </div>
      </div>

      <div className="p-2">
        {announcements.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-slate-100">
            {announcements.slice(0, 3).map((item) => (
              <li key={item.id}>
                <Link
                  href={`/portal/announcements/${item.id}`}
                  className="group block p-4 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-red-800 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-red-800 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {item.excerpt || 'Baca selengkapnya untuk informasi detail.'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    {formatDate(item.date)} · {item.author}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-6 py-3 border-t border-slate-100">
        <Link
          href="/portal/announcements"
          className="inline-flex items-center gap-1 text-sm font-medium text-red-800 hover:text-red-900"
        >
          Semua Pengumuman <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
