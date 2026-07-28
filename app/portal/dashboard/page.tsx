'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useMemberAuth } from '@/src/context/MemberAuthContext';
import { MemberLayout } from '@/src/components/member';
import {
  DashboardHeader,
  ProfileCompletionCard,
  UpcomingEvents,
  Announcements,
  MemberBenefits,
  QuickActions,
  RecentActivity,
  ProfileSummary,
} from '@/src/components/member/dashboard';
import { HRCards } from '@/src/components/member/dashboard/HRCards';
import CommunityPreviewWidget from '@/src/components/member/dashboard/CommunityPreviewWidget';

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

interface DashboardData {
  events: Array<{
    id: number;
    title: string;
    description: string;
    date: string;
    time?: string | null;
    location?: string | null;
    imageUrl?: string | null;
    registrationUrl?: string | null;
    status?: string | null;
  }>;
  announcements: Array<{
    id: number;
    title: string;
    excerpt?: string | null;
    date: string;
    author: string;
    imageUrl?: string | null;
    category?: string | null;
  }>;
  lastLoginAt: string | null;
}

export default function MemberDashboard() {
  const router = useRouter();
  const { member, loading: authLoading, isAuthenticated } = useMemberAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/portal/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/member/dashboard', {
          credentials: 'include',
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setDashboardData(result.data);
          }
        }
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  if (authLoading || dataLoading) {
    return (
      <MemberLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-600">Memuat dashboard Anda...</p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  if (!member) return null;

  const events = dashboardData?.events || [];
  const announcements = dashboardData?.announcements || [];
  const lastLoginAt = dashboardData?.lastLoginAt || null;

  const checks = [
    !!member.imageUrl,
    !!member.university,
    !!member.phone,
    !!member.whatsapp,
    !!member.linkedinUrl,
    !!member.bio,
  ];
  const profileCompletionPercentage = Math.round(
    (checks.filter(Boolean).length / checks.length) * 100
  );

  return (
    <MemberLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 lg:space-y-8"
      >
        {/* Executive Welcome Hero Header */}
        <motion.div variants={itemVariants}>
          <DashboardHeader
            name={member.name}
            role={member.position?.name}
            generation={member.generation?.name}
            division={member.division}
            university={member.university}
            imageUrl={member.imageUrl}
            isAlumni={member.isAlumni}
          />
        </motion.div>

        {/* Quick Actions Shortcuts (3 Cards) */}
        <motion.div variants={itemVariants}>
          <QuickActions />
        </motion.div>

        {/* Section 1: Events (8 cols) & Profile Summary/Completion (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Main Events Area (8 cols) */}
          <motion.div variants={itemVariants} className="lg:col-span-8 h-full">
            <UpcomingEvents events={events} />
          </motion.div>

          {/* Profile Summary & Completion Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div variants={itemVariants}>
              <ProfileSummary
                member={{
                  showPublic: member.showPublic,
                  division: member.division,
                  position: member.position,
                  university: member.university,
                }}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <ProfileCompletionCard member={member} />
            </motion.div>
          </div>
        </div>

        {/* Section 2: HR Command Center (3 Horizontal Cards) */}
        <motion.div variants={itemVariants}>
          <HRCards />
        </motion.div>

        {/* Section 2.5: Ruang Komunitas & Feed Preview */}
        <motion.div variants={itemVariants}>
          <CommunityPreviewWidget />
        </motion.div>

        {/* Section 3: 3-Column Equal Grid (Keuntungan, Pengumuman, Aktivitas) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* Column 1: Member Benefits */}
          <motion.div variants={itemVariants} className="h-full">
            <MemberBenefits />
          </motion.div>

          {/* Column 2: Announcements & Notices */}
          <motion.div variants={itemVariants} className="h-full">
            <Announcements announcements={announcements} />
          </motion.div>

          {/* Column 3: Recent Activity Log */}
          <motion.div variants={itemVariants} className="h-full">
            <RecentActivity
              lastLoginAt={lastLoginAt}
              profileCompletionPercentage={profileCompletionPercentage}
            />
          </motion.div>
        </div>

        {/* Footer Note */}
        <motion.section variants={itemVariants} className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Butuh bantuan? Hubungi admin IAI Muda Jakarta.
          </p>
        </motion.section>
      </motion.div>
    </MemberLayout>
  );
}
