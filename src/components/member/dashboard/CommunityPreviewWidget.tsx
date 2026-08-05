'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, ArrowRight, Sparkles, Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import MentionInput from '../community/MentionInput';

interface PostPreview {
  id: number;
  content: string;
  authorName: string | null;
  authorAvatar: string | null;
  createdAt: string;
  commentsCount: number;
  reactionsTotal: number;
}

export default function CommunityPreviewWidget() {
  const [posts, setPosts] = useState<PostPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickPostText, setQuickPostText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLatestPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/member/community/posts?limit=3');
      if (!res.ok) return;
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setPosts(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestPosts();
  }, []);

  const handleQuickPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPostText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/member/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: quickPostText }),
      });

      if (res.ok) {
        setQuickPostText('');
        fetchLatestPosts();
      }
    } catch (err: any) {
      alert('Gagal mengirim postingan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm space-y-5">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>Ruang Komunitas & Feed Pengurus</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </h3>
            <p className="text-[11px] text-slate-500">Berbagi informasi, kabar kegiatan, & diskusi sesama anggota.</p>
          </div>
        </div>

        <Link
          href="/portal/feed"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Quick Composer Box */}
      <form onSubmit={handleQuickPostSubmit} className="space-y-2">
        <MentionInput
          value={quickPostText}
          onChange={setQuickPostText}
          placeholder="Tulis pesan cepat atau ajukan pertanyaan... (ketik @ nama anggota)"
          rows={2}
        />
        {quickPostText.trim() && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Posting</span>
            </button>
          </div>
        )}
      </form>

      {/* Latest Posts Preview List */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        {isLoading ? (
          <div className="py-6 text-center text-xs text-slate-400">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin mx-auto mb-2" />
            <span>Memuat diskusi terbaru...</span>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <Link
              key={post.id}
              href={`/portal/feed?post=${post.id}`}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 transition-all block group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {post.authorName?.[0] || 'M'}
                  </div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700">{post.authorName}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed pl-8">{post.content}</p>
              <div className="mt-2 pl-8 flex items-center gap-4 text-[10px] text-slate-400">
                <span>💬 {post.commentsCount} Komentar</span>
                <span>👍 {post.reactionsTotal} Reaksi</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-6 text-center text-xs text-slate-500">Belum ada diskusi. Mulai buat postingan pertama Anda!</div>
        )}
      </div>
    </div>
  );
}
