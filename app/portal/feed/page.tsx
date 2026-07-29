'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { MessageSquare, Globe, Users, Loader2, Sparkles, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import MemberLayout from '@/src/components/member/MemberLayout';
import PortalPageHeader from '@/src/components/member/PortalPageHeader';
import PostComposer from '@/src/components/member/community/PostComposer';
import PostCard, { PostItem } from '@/src/components/member/community/PostCard';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/portal/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/member/community/posts?scope=${scope}`);
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
    if (isAuthenticated) {
      fetchPosts();
    }
  }, [scope, isAuthenticated]);

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

        {/* Scope Filter Tabs & Refresh */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center bg-slate-200/70 p-1 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                scope === 'all' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 inline mr-1.5" /> Semua Postingan
            </button>
            {userDivision && (
              <button
                type="button"
                onClick={() => setScope('division')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  scope === 'division' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 inline mr-1.5" /> Khusus {userDivision}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={fetchPosts}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
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
            <h3 className="text-sm font-bold text-slate-700">Belum Ada Postingan</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Jadilah yang pertama membagikan pengumuman, ide, atau kabar kegiatan di Ruang Komunitas!
            </p>
          </motion.div>
        )}
      </motion.div>
    </MemberLayout>
  );
}
