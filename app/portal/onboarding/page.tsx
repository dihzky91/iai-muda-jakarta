'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useMemberAuth } from '@/src/context/MemberAuthContext';
import { MemberLayout } from '@/src/components/member';
import { Resource, OnboardingProgress } from '@/src/types';
import {
  BookOpenCheck,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  ShieldAlert,
  Sparkles,
  Lock,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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

function formatBytes(bytes: number, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function MemberOnboardingPage() {
  const router = useRouter();
  const { member, loading: authLoading, isAuthenticated } = useMemberAuth();

  const [resources, setResources] = useState<Resource[]>([]);
  const [progress, setProgress] = useState<OnboardingProgress>({
    total: 0,
    readCount: 0,
    percentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAlumniBlocked, setIsAlumniBlocked] = useState(false);
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const fetchOnboardingData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/member/onboarding', {
        credentials: 'include',
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.isAlumni) {
          setIsAlumniBlocked(true);
        } else {
          setError(json.message || 'Gagal memuat dokumen onboarding.');
        }
        return;
      }

      setResources(json.data.resources || []);
      setProgress(json.data.progress || { total: 0, readCount: 0, percentage: 0 });
    } catch {
      setError('Terjadi kesalahan koneksi saat memuat data onboarding.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/portal/login');
      return;
    }

    if (isAuthenticated) {
      if (member?.isAlumni) {
        setIsAlumniBlocked(true);
        setLoading(false);
      } else {
        fetchOnboardingData();
      }
    }
  }, [authLoading, isAuthenticated, member, router, fetchOnboardingData]);

  // Group resources by subcategory
  const groupedResources = useMemo(() => {
    const map = new Map<string, Resource[]>();

    const filtered = resources.filter((item) => {
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.subcategory && item.subcategory.toLowerCase().includes(term)) ||
        (item.fileName && item.fileName.toLowerCase().includes(term))
      );
    });

    for (const item of filtered) {
      const cat = item.subcategory || 'Panduan Umum';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(item);
    }

    return Array.from(map.entries());
  }, [resources, search]);

  const handleDownload = async (item: Resource) => {
    setDownloadingId(item.id);

    try {
      // 1. Trigger mark as read API
      await fetch(`/api/member/onboarding/${item.id}/read`, {
        method: 'POST',
        credentials: 'include',
      });

      // 2. Real-time update local state if not already read
      setResources((prev) =>
        prev.map((r) =>
          r.id === item.id
            ? { ...r, isRead: true, readAt: new Date().toISOString() }
            : r
        )
      );

      // Re-calculate progress
      setProgress((prev) => {
        const newlyRead = !item.isRead;
        const newReadCount = newlyRead ? prev.readCount + 1 : prev.readCount;
        const newPercentage =
          prev.total > 0 ? Math.round((newReadCount / prev.total) * 100) : 0;
        return {
          total: prev.total,
          readCount: newReadCount,
          percentage: newPercentage,
        };
      });

      // 3. Open file URL in new tab
      window.open(item.fileUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <MemberLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
          <RefreshCw className="h-10 w-10 animate-spin text-blue-700 mb-3" />
          <p className="text-sm font-medium text-slate-600">Memuat Onboarding Library...</p>
        </div>
      </MemberLayout>
    );
  }

  // Alumni access block screen
  if (isAlumniBlocked || member?.isAlumni) {
    return (
      <MemberLayout>
        <div className="max-w-2xl mx-auto py-12 px-4 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-amber-50/80 to-orange-50/40 border border-amber-200/80 shadow-xl shadow-amber-900/5 space-y-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">
                Akses Terbatas untuk Pengurus Aktif
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Halaman Onboarding Library ini khusus dirancang untuk pembekalan dan panduan pengurus aktif IAI Muda Wilayah DKI Jakarta.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-amber-200 text-xs font-semibold text-amber-800 flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Status akun Anda terdaftar sebagai Alumni IAI Muda.</span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push('/portal/dashboard')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-700/20 transition-all cursor-pointer"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </MemberLayout>
    );
  }

  if (error) {
    return (
      <MemberLayout>
        <div className="max-w-md mx-auto py-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800">{error}</p>
          <button
            type="button"
            onClick={fetchOnboardingData}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all"
          >
            Coba Lagi
          </button>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 lg:space-y-8"
      >
        {/* Page Header */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-xl shadow-blue-900/10"
        >
          <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold tracking-wider text-blue-200 uppercase border border-white/10">
                <BookOpenCheck className="w-3.5 h-3.5" />
                <span>Pengurus Onboarding</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                Onboarding Library
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                Panduan resmi, template kerja, dan berkas penting kepengurusan IAI Muda Wilayah DKI Jakarta. Silakan baca dan pelajari setiap dokumen di bawah ini.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress Tracker Section */}
        <motion.div
          variants={itemVariants}
          className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 font-bold shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Progress Onboarding Anda
                </h3>
                <p className="text-xs text-slate-500">
                  Progress Onboarding: <span className="font-bold text-slate-800">{progress.readCount}</span> dari <span className="font-bold text-slate-800">{progress.total}</span> dokumen sudah dibaca
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold ${
                  progress.percentage === 100
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {progress.percentage === 100 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>100% Selesai!</span>
                  </>
                ) : (
                  <span>{progress.percentage}% Dibaca</span>
                )}
              </span>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/60">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full transition-all ${
                  progress.percentage === 100
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                }`}
              />
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={itemVariants} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari dokumen onboarding berdasarkan judul, deskripsi, atau subkategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
          />
        </motion.div>

        {/* Documents List Grouped by Subcategory */}
        {resources.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3"
          >
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Belum Ada Dokumen Onboarding</h3>
            <p className="text-xs text-slate-500">
              Admin belum menambahkan dokumen onboarding untuk pengurus aktif.
            </p>
          </motion.div>
        ) : groupedResources.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3"
          >
            <Search className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Dokumen Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500">
              Tidak ada dokumen yang cocok dengan kata kunci pencarian Anda.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {groupedResources.map(([subcategory, items]) => (
              <motion.div key={subcategory} variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <div className="w-2 h-5 rounded-full bg-blue-700" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {subcategory}
                  </h2>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {items.length} file
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                      className={`p-5 rounded-2xl bg-white border transition-all shadow-sm flex flex-col justify-between space-y-4 ${
                        item.isRead
                          ? 'border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/20'
                          : 'border-slate-200/90 hover:border-blue-300'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>

                          {/* Read Status Badge */}
                          {item.isRead ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Sudah Dibaca</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0 animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Belum Dibaca</span>
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-900 leading-snug">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div className="text-[11px] text-slate-500 font-medium truncate">
                          <span className="font-semibold text-slate-700 uppercase">
                            {item.fileType || 'FILE'}
                          </span>
                          {item.fileSize ? ` • ${formatBytes(item.fileSize)}` : ''}
                        </div>

                        <button
                          type="button"
                          disabled={downloadingId === item.id}
                          onClick={() => handleDownload(item)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer ${
                            item.isRead
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : 'bg-blue-700 hover:bg-blue-800 text-white shadow-blue-700/20'
                          } disabled:opacity-50`}
                        >
                          {downloadingId === item.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Mengunduh...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </MemberLayout>
  );
}
