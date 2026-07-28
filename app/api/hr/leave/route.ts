import { db, schema } from '@/lib/db';
import { eq, and, gte } from 'drizzle-orm';
import { adminRoute, ok } from '@/lib/api';

/**
 * GET /api/hr/leave
 * List all leave requests with optional status filter
 */
export const GET = adminRoute(
  ['superadmin', 'admin'],
  async (request, _context, _user) => {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status'); // pending, approved, rejected, or null (all)

    // Build query based on filter
    let leaveRequests;
    
    if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
      leaveRequests = await db
        .select({
          id: schema.leaveRequests.id,
          memberId: schema.leaveRequests.memberId,
          memberName: schema.members.name,
          memberDivision: schema.members.division,
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
        .innerJoin(schema.members, eq(schema.leaveRequests.memberId, schema.members.id))
        .leftJoin(schema.users, eq(schema.leaveRequests.reviewedBy, schema.users.id))
        .where(eq(schema.leaveRequests.status, statusFilter as any))
        .orderBy(schema.leaveRequests.submittedAt);
    } else {
      leaveRequests = await db
        .select({
          id: schema.leaveRequests.id,
          memberId: schema.leaveRequests.memberId,
          memberName: schema.members.name,
          memberDivision: schema.members.division,
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
        .innerJoin(schema.members, eq(schema.leaveRequests.memberId, schema.members.id))
        .leftJoin(schema.users, eq(schema.leaveRequests.reviewedBy, schema.users.id))
        .orderBy(schema.leaveRequests.submittedAt);
    }

    return ok(leaveRequests);
  },
  'Failed to fetch leave requests'
);
