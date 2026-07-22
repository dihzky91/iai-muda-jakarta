'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Users } from 'lucide-react';
import { useMemberAuth } from '@/src/context/MemberAuthContext';
import { MemberLayout, MemberDirectory } from '@/src/components/member';

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

export default function DirectoryPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated, token } = useMemberAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/portal/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <MemberLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            <p className="mt-4 text-slate-500">Memuat direktori...</p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
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
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-red-900 flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-900">
                Direktori Anggota
              </h1>
              <p className="text-slate-500 mt-1">
                Jaringan pengurus & alumni IAI Muda Jakarta
              </p>
            </div>
          </div>
        </motion.div>

        {/* Directory Component */}
        <motion.div variants={itemVariants}>
          <MemberDirectory token={token} />
        </motion.div>

        {/* Footer Note */}
        <motion.section variants={itemVariants} className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Informasi ini hanya untuk akses internal anggota IAI Muda Jakarta.
          </p>
        </motion.section>
      </motion.div>
    </MemberLayout>
  );
}