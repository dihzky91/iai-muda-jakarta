import { db, schema } from '@/lib/db';
import { eq, desc, sql, and, isNull, gte } from 'drizzle-orm';
import { adminRoute, ok } from '@/lib/api';

/**
 * GET /api/hr/dashboard
 * HR Command Center dashboard data:
 * - Status distribution (Hijau, Kuning, Merah, Biru counts)
 * - Members needing attention (Merah/Kuning)
 * - Pending leave requests
 * - Ongoing interventions
 * - Members who haven't updated academic load this week
 */
export const GET = adminRoute(
  ['superadmin', 'admin'],
  async (_request, _context, _user) => {
    // Get current week start (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Move to Monday
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diff);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    // Get latest status for each member
    const latestStatuses = await db
      .select({
        memberId: schema.memberStatuses.memberId,
        status: schema.memberStatuses.status,
        reason: schema.memberStatuses.reason,
        createdAt: schema.memberStatuses.createdAt,
        memberName: schema.members.name,
        memberDivision: schema.members.division,
      })
      .from(schema.memberStatuses)
      .innerJoin(schema.members, eq(schema.memberStatuses.memberId, schema.members.id))
      .orderBy(desc(schema.memberStatuses.createdAt));

    // Group by member to get latest status only
    const memberStatusMap = new Map();
    for (const row of latestStatuses) {
      if (!memberStatusMap.has(row.memberId)) {
        memberStatusMap.set(row.memberId, row);
      }
    }

    const latestStatusesList = Array.from(memberStatusMap.values());

    // Count by status
    const statusCounts = {
      hijau: latestStatusesList.filter(s => s.status === 'hijau').length,
      kuning: latestStatusesList.filter(s => s.status === 'kuning').length,
      merah: latestStatusesList.filter(s => s.status === 'merah').length,
      biru: latestStatusesList.filter(s => s.status === 'biru').length,
    };

    // Members needing attention (Merah and Kuning)
    const needsAttention = latestStatusesList
      .filter(s => s.status === 'merah' || s.status === 'kuning')
      .map(s => ({
        memberId: s.memberId,
        name: s.memberName,
        division: s.memberDivision,
        status: s.status,
        reason: s.reason,
        lastUpdated: s.createdAt,
      }));

    // Pending leave requests
    const pendingLeaves = await db
      .select({
        id: schema.leaveRequests.id,
        memberId: schema.leaveRequests.memberId,
        memberName: schema.members.name,
        startDate: schema.leaveRequests.startDate,
        endDate: schema.leaveRequests.endDate,
        reason: schema.leaveRequests.reason,
        leaveType: schema.leaveRequests.leaveType,
        submittedAt: schema.leaveRequests.submittedAt,
      })
      .from(schema.leaveRequests)
      .innerJoin(schema.members, eq(schema.leaveRequests.memberId, schema.members.id))
      .where(eq(schema.leaveRequests.status, 'pending'))
      .orderBy(desc(schema.leaveRequests.submittedAt))
      .limit(10);

    // Ongoing interventions (scheduled but not completed)
    const ongoingInterventions = await db
      .select({
        id: schema.interventionLogs.id,
        memberId: schema.interventionLogs.memberId,
        memberName: schema.members.name,
        stage: schema.interventionLogs.stage,
        scheduledDate: schema.interventionLogs.scheduledDate,
        notes: schema.interventionLogs.notes,
      })
      .from(schema.interventionLogs)
      .innerJoin(schema.members, eq(schema.interventionLogs.memberId, schema.members.id))
      .where(isNull(schema.interventionLogs.completedDate))
      .orderBy(schema.interventionLogs.scheduledDate)
      .limit(10);

    // Members who haven't updated academic load this week
    const membersWithLoad = await db
      .select({ memberId: schema.memberAcademicLoads.memberId })
      .from(schema.memberAcademicLoads)
      .where(eq(schema.memberAcademicLoads.weekStart, weekStartStr));

    const memberIdsWithLoad = new Set(membersWithLoad.map(m => m.memberId));

    const allActiveMembers = await db
      .select({
        id: schema.members.id,
        name: schema.members.name,
        division: schema.members.division,
      })
      .from(schema.members)
      .where(
        and(
          eq(schema.members.isActive, true),
          eq(schema.members.isAlumni, false)
        )
      );

    const noAcademicLoadUpdate = allActiveMembers
      .filter(m => !memberIdsWithLoad.has(m.id))
      .map(m => ({
        memberId: m.id,
        name: m.name,
        division: m.division,
      }));

    return ok({
      statusCounts,
      needsAttention,
      pendingLeaves,
      ongoingInterventions,
      noAcademicLoadUpdate: noAcademicLoadUpdate.slice(0, 20), // Limit to 20
    });
  },
  'Failed to fetch HR dashboard data'
);
