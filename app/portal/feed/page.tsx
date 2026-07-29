'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { MessageSquare, Globe, Users, Loader2, Sparkles, RefreshCw, Search, X, Tag } from 'lucide-react';
import Link from 'next/link';
import MemberLayout from '@/src/components/member/MemberLayout';
import PortalPageHeader from '@/src/components/member/PortalPageHeader';
import PostComposer from '@/src/components/member/community/PostComposer';
import PostCard, { PostItem } from '@/src/components/member/community/PostCard';
import { COMMUNITY_CATEGORIES } from '@/src/components/member/community/categories';
import { useMemberAuth } from '@/src/context/MemberAuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function CommunityFeedPage() {
  const router = useRouter();
  const { member, loading: authLoading, isAuthenticated } = useMemberAuth();
  const currentMemberId = member?.id || null;
  const userDivision = member?.division || null;

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [scope, setScope] = useState<'all' | 'division'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categoriesList, setCategoriesList] = useState(COMMUNITY_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/member/community/categories')
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          setCategoriesList(result.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/portal/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('scope', scope);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/member/community/posts?${params.toString()}`);
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
  }, [scope, categoryFilter, searchQuery]);

  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        fetchPosts();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [fetchPosts, isAuthenticated]);

  const handlePostDeleted = (deletedId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  if (authLoading) {
    return (
      <MemberLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-blue-700 animate-spin mx-auto" />
            <p className="mt-4 text-xs font-semibold text-slate-500">Memuat Ruang Komunitas...</p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <MemberLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 lg:space-y-8 pb-12"
      >
        {/* Header Banner */}
        <motion.div variants={itemVariants}>
          <PortalPageHeader
            badgeIcon={Sparkles}
            badgeLabel="Ruang Komunitas & Feed Pengurus"
            badgeColor="text-cyan-300"
            title="Kabar Anggota IAI Muda Jakarta"
            description="Wadah kolaborasi, diskusi profesional, dan kabar kegiatan antar sesama pengurus & alumni IAI Muda DKI Jakarta."
            backHref="/portal/dashboard"
            backTitle="Kembali ke Dashboard"
          />
        </motion.div>

        {/* Post Composer */}
        <motion.div variants={itemVariants}>
          <PostComposer onPostSuccess={fetchPosts} userDivision={userDivision} />
        </motion.div>

        {/* Search & Filter Controls */}
        <motion.div variants={itemVariants} className="space-y-3 pt-2">
          {/* Top Bar: Search Input & Scope Toggle & Refresh */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search Bar Input */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari postingan atau nama anggota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Scope Filter Tabs & Refresh */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-200/70 p-1 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    scope === 'all' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 inline mr-1" /> Semua
                </button>
                {userDivision && (
                  <button
                    type="button"
                    onClick={() => setScope('division')}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      scope === 'division' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 inline mr-1" /> Divisi Saya
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={fetchPosts}
                disabled={isLoading}
                className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Refresh Feed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Category Tag Pills Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                categoryFilter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Semua Topik
            </button>
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                  categoryFilter === cat.id
                    ? cat.activeTabClass + ' font-bold border-transparent'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.hashtag}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Posts Feed Stream */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
            <span>Memuat postingan komunitas...</span>
          </div>
        ) : posts.length > 0 ? (
          <motion.div variants={itemVariants} className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentMemberId={currentMemberId}
                onPostDeleted={handlePostDeleted}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="rounded-3xl bg-white p-12 text-center border border-slate-200 space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">Tidak Ada Postingan Ditemukan</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || categoryFilter !== 'all'
                ? 'Tidak ada postingan yang sesuai dengan pencarian atau filter topik yang dipilih.'
                : 'Jadilah yang pertama membagikan pengumuman, ide, atau kabar kegiatan di Ruang Komunitas!'}
            </p>
            {(searchQuery || categoryFilter !== 'all') && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}
                className="mt-2 text-xs font-bold text-blue-600 hover:underline"
              >
                Reset Filter & Pencarian
              </button>
            )}
          </motion.div>
        )}
      </motion.div>
    </MemberLayout>
  );
}
