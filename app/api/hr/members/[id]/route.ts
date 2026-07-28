import { db, schema } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { adminRoute, ok, fail } from '@/lib/api';

/**
 * GET /api/hr/members/[id]
 * Get member detail with full HR history:
 * - Basic info
 * - Status history
 * - Academic loads
 * - Leave requests
 * - Intervention logs
 * - Monthly evaluations
 */
export const GET = adminRoute(
  ['superadmin', 'admin'],
  async (_request, context, _user) => {
    const { id } = await context.params;
    const memberId = parseInt(id, 10);

    if (isNaN(memberId)) {
      return fail('Invalid member ID', 400);
    }

    // Get member basic info
    const member = await db
      .select({
        id: schema.members.id,
        name: schema.members.name,
        email: schema.members.email,
        division: schema.members.division,
        university: schema.members.university,
        phone: schema.members.phone,
        whatsapp: schema.members.whatsapp,
        imageUrl: schema.members.imageUrl,
        linkedinUrl: schema.members.linkedinUrl,
        bio: schema.members.bio,
        generationName: schema.generations.name,
        positionName: schema.positions.name,
        isActive: schema.members.isActive,
        isAlumni: schema.members.isAlumni,
      })
      .from(schema.members)
      .leftJoin(schema.generations, eq(schema.members.generationId, schema.generations.id))
      .leftJoin(schema.positions, eq(schema.members.positionId, schema.positions.id))
      .where(eq(schema.members.id, memberId))
      .limit(1);

    if (member.length === 0) {
      return fail('Member not found', 404);
    }

    // Get status history
    const statusHistory = await db
      .select({
        id: schema.memberStatuses.id,
        status: schema.memberStatuses.status,
        reason: schema.memberStatuses.reason,
        createdAt: schema.memberStatuses.createdAt,
        changedByUsername: schema.users.username,
      })
      .from(schema.memberStatuses)
      .leftJoin(schema.users, eq(schema.memberStatuses.changedBy, schema.users.id))
      .where(eq(schema.memberStatuses.memberId, memberId))
      .orderBy(desc(schema.memberStatuses.createdAt));

    // Get academic loads
    const academicLoads = await db
      .select()
      .from(schema.memberAcademicLoads)
      .where(eq(schema.memberAcademicLoads.memberId, memberId))
      .orderBy(desc(schema.memberAcademicLoads.weekStart));

    // Get leave requests
    const leaveRequests = await db
      .select({
        id: schema.leaveRequests.id,
        startDate: schema.leaveRequests.startDate,
        endDate: schema.leaveRequests.endDate,
        reason: schema.leaveRequests.reason,
        leaveType: schema.leaveRequests.leaveType,
        status: schema.leaveRequests.status,
        reviewedBy: schema.users.username,
        reviewedAt: schema.leaveRequests.reviewedAt,
        reviewNotes: schema.leaveRequests.reviewNotes,
        submittedAt: schema.leaveRequests.submittedAt,
      })
      .from(schema.leaveRequests)
      .leftJoin(schema.users, eq(schema.leaveRequests.reviewedBy, schema.users.id))
      .where(eq(schema.leaveRequests.memberId, memberId))
      .orderBy(desc(schema.leaveRequests.submittedAt));

    // Get intervention logs
    const interventionLogs = await db
      .select({
        id: schema.interventionLogs.id,
        stage: schema.interventionLogs.stage,
        notes: schema.interventionLogs.notes,
        actionTaken: schema.interventionLogs.actionTaken,
        scheduledDate: schema.interventionLogs.scheduledDate,
        completedDate: schema.interventionLogs.completedDate,
        createdAt: schema.interventionLogs.createdAt,
        performedBy: schema.users.username,
      })
      .from(schema.interventionLogs)
      .leftJoin(schema.users, eq(schema.interventionLogs.performedBy, schema.users.id))
      .where(eq(schema.interventionLogs.memberId, memberId))
      .orderBy(desc(schema.interventionLogs.createdAt));

    // Get monthly evaluations
    const evaluations = await db
      .select({
        id: schema.monthlyEvaluations.id,
        month: schema.monthlyEvaluations.month,
        evaluationNotes: schema.monthlyEvaluations.evaluationNotes,
        actionItems: schema.monthlyEvaluations.actionItems,
        rating: schema.monthlyEvaluations.rating,
        evaluatedBy: schema.users.username,
        createdAt: schema.monthlyEvaluations.createdAt,
      })
      .from(schema.monthlyEvaluations)
      .leftJoin(schema.users, eq(schema.monthlyEvaluations.evaluatedBy, schema.users.id))
      .where(eq(schema.monthlyEvaluations.memberId, memberId))
      .orderBy(desc(schema.monthlyEvaluations.month));

    return ok({
      member: member[0],
      statusHistory,
      academicLoads,
      leaveRequests,
      interventionLogs,
      evaluations,
    });
  },
  'Failed to fetch member HR data'
);
