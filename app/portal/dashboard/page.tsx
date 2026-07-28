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
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            <p className="mt-4 text-slate-500">Memuat dashboard...</p>
          </div>
        </div>
      </MemberLayout>
    );
  }

  if (!member) {
    return null;
  }

  const events = dashboardData?.events ?? [];
  const announcements = dashboardData?.announcements ?? [];
  const lastLoginAt = dashboardData?.lastLoginAt ?? null;

  // Calculate profile completion percentage for activity feed
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
        {/* Executive Welcome Header */}
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

        {/* 2-Column Responsive Grid System */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Main Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-8">
            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <QuickActions />
            </motion.div>

            {/* Events + Announcements Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants} className="h-full">
                <UpcomingEvents events={events} />
              </motion.div>
              <motion.div variants={itemVariants} className="h-full">
                <Announcements announcements={announcements} />
              </motion.div>
            </div>

            {/* Recent Activity + Member Benefits Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants} className="h-full">
                <RecentActivity
                  lastLoginAt={lastLoginAt}
                  profileCompletionPercentage={profileCompletionPercentage}
                />
              </motion.div>
              <motion.div variants={itemVariants} className="h-full">
                <MemberBenefits />
              </motion.div>
            </div>
          </div>

          {/* Right Sidebar Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6 lg:space-y-8">
            {/* Profile Summary Card */}
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

            {/* Compact Profile Completion Widget */}
            <motion.div variants={itemVariants}>
              <ProfileCompletionCard member={member} />
            </motion.div>

            {/* HR Cards */}
            <motion.div variants={itemVariants}>
              <HRCards />
            </motion.div>
          </div>
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
