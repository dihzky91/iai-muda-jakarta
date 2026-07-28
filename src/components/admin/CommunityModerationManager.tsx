'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Pin, Trash2, Shield, Search, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import PostCard, { PostItem } from '@/src/components/member/community/PostCard';

export default function CommunityModerationManager() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/member/community/posts?limit=30');
      if (!res.ok) return;
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setPosts(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch posts for moderation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostDeleted = (id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.authorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Moderation Header Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-bold text-indigo-300">
            <Shield className="w-3.5 h-3.5" /> Admin Moderasi CMS
          </div>
          <h2 className="text-xl font-bold tracking-tight">Kelola & Moderasi Feed Komunitas</h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Sematkan pengumuman resmi (*Pin Post*), tinjau postingan anggota, dan hapus konten yang melanggar etika organisasi.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPosts}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari kata kunci postingan atau nama penulis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Posts List for Moderation */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
          <span>Memuat data postingan untuk moderasi...</span>
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isAdmin={true}
              onPostDeleted={handlePostDeleted}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-12 text-center border border-slate-200 space-y-2">
          <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">Tidak ada postingan ditemukan</p>
        </div>
      )}
    </div>
  );
}
