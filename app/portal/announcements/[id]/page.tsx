'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMemberAuth } from '@/src/context/MemberAuthContext';
import { MemberLayout } from '@/src/components/member';
import { ArrowLeft, Calendar, User, Megaphone, Share2 } from 'lucide-react';

interface AnnouncementDetail {
  id: number;
  title: string;
  excerpt: string | null;
  content: string;
  date: string;
  author: string;
  imageUrl: string | null;
}

export default function MemberAnnouncementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { member, loading: authLoading, isAuthenticated } = useMemberAuth();

  const [article, setArticle] = useState<AnnouncementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/portal/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!id || !isAuthenticated) return;

    fetch(`/api/articles/${id}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setArticle(result.data);
        } else {
          setError(result.error || 'Pengumuman tidak ditemukan');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch article detail:', err);
        setError('Terjadi kesalahan saat memuat pengumuman');
      })
      .finally(() => setLoading(false));
  }, [id, isAuthenticated]);

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

  if (error || !article) {
    return (
      <MemberLayout>
        <div className="max-w-2xl mx-auto my-12 bg-white p-8 rounded-2xl border border-slate-200 text-center">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 mb-2">Pengumuman Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'Pengumuman tidak ditemukan.'}</p>
          <button
            onClick={() => router.push('/portal/announcements')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Pengumuman
          </button>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Back Navigation */}
        <div>
          <button
            onClick={() => router.push('/portal/announcements')}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Semua Pengumuman
          </button>
        </div>

        {/* Article Container */}
        <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {article.imageUrl && (
            <div className="w-full h-64 md:h-80 bg-slate-100 overflow-hidden">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-10 space-y-6">
            {/* Meta & Title */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <User className="w-4 h-4 text-blue-600" />
                  {article.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {new Date(article.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="text-base text-slate-600 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {article.excerpt}
                </p>
              )}
            </div>

            {/* Article Content */}
            <div className="border-t border-slate-100 pt-6 text-slate-800 leading-relaxed text-sm md:text-base space-y-4 whitespace-pre-line">
              {article.content}
            </div>
          </div>
        </article>
      </div>
    </MemberLayout>
  );
}
