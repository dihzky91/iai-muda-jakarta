'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemberAuth } from '@/src/context/MemberAuthContext';
import { MemberLayout } from '@/src/components/member';
import { Megaphone, Calendar, User, ArrowLeft, ChevronRight, Search } from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  excerpt: string | null;
  content: string;
  date: string;
  author: string;
  imageUrl: string | null;
}

export default function MemberAnnouncementsPage() {
  const router = useRouter();
  const { member, loading: authLoading, isAuthenticated } = useMemberAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/portal/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetch('/api/articles')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          // Sort latest date first
          const sorted = (result.data || []).sort(
            (a: Announcement, b: Announcement) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setAnnouncements(sorted);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const filtered = announcements.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    (item.excerpt && item.excerpt.toLowerCase().includes(search.toLowerCase())) ||
    item.author.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <MemberLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
            <p className="mt-4 text-slate-500 text-sm">Memuat pengumuman...</p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/portal/dashboard')}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-blue-600" />
                Pengumuman & Informasi Internal
              </h1>
              <p className="text-sm text-slate-500">
                Pemberitahuan, artikel, dan edaran resmi dari pengurus IAI Muda Jakarta.
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pengumuman..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Announcements Feed */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700 mb-1">Belum Ada Pengumuman</h3>
            <p className="text-sm text-slate-500">
              {search ? 'Tidak ada pengumuman yang sesuai dengan pencarian Anda.' : 'Belum ada pengumuman resmi terbaru saat ini.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  {item.imageUrl && (
                    <div className="h-44 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {item.author}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2 mb-2">
                      {item.title}
                    </h2>

                    {item.excerpt && (
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {item.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href={`/portal/announcements/${item.id}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Baca Selengkapnya
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
