import { db, schema } from '@/lib/db';
import { eq, and, gte, desc } from 'drizzle-orm';
import { memberRoute, ok, done, fail } from '@/lib/api';

/**
 * GET /api/member/hr/leave
 * Get member's own leave requests
 */
export const GET = memberRoute(
  async (_request, _context, member) => {
    const leaves = await db
      .select({
        id: schema.leaveRequests.id,
        startDate: schema.leaveRequests.startDate,
        endDate: schema.leaveRequests.endDate,
        reason: schema.leaveRequests.reason,
        leaveType: schema.leaveRequests.leaveType,
        status: schema.leaveRequests.status,
        reviewNotes: schema.leaveRequests.reviewNotes,
        submittedAt: schema.leaveRequests.submittedAt,
        reviewedAt: schema.leaveRequests.reviewedAt,
      })
      .from(schema.leaveRequests)
      .where(eq(schema.leaveRequests.memberId, member.memberId))
      .orderBy(desc(schema.leaveRequests.submittedAt));

    return ok(leaves);
  },
  'Failed to fetch leave requests'
);

/**
 * POST /api/member/hr/leave
 * Submit new leave request with validation
 */
export const POST = memberRoute(
  async (request, _context, member) => {
    const body = await request.json();
    const { startDate, endDate, reason, leaveType } = body;

    // Validate required fields
    if (!startDate || !endDate || !reason) {
      return fail('startDate, endDate, and reason are required', 400);
    }

    // Validate leave type
    const validLeaveTypes = ['regular', 'emergency'];
    if (leaveType && !validLeaveTypes.includes(leaveType)) {
      return fail('Invalid leaveType. Must be either "regular" or "emergency"', 400);
    }

    const type = leaveType || 'regular';

    // Calculate duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (durationDays <= 0) {
      return fail('End date must be after start date', 400);
    }

    if (durationDays > 7) {
      return fail('Leave duration cannot exceed 7 days', 400);
    }

    // Validate H-10 rule for regular leave
    if (type === 'regular') {
      const now = new Date();
      const tenDaysFromNow = new Date();
      tenDaysFromNow.setDate(now.getDate() + 10);

      if (start < tenDaysFromNow) {
        return fail('Regular leave must be submitted at least 10 days in advance (H-10)', 400);
      }
    }

    // Check approved leaves in last 2 months
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const twoMonthsAgoStr = twoMonthsAgo.toISOString().split('T')[0];

    const recentApprovedLeaves = await db
      .select()
      .from(schema.leaveRequests)
      .where(
        and(
          eq(schema.leaveRequests.memberId, member.memberId),
          eq(schema.leaveRequests.status, 'approved'),
          gte(schema.leaveRequests.startDate, twoMonthsAgoStr)
        )
      );

    // Calculate total days used in last 2 months
    const totalDaysUsed = recentApprovedLeaves.reduce((sum, leave) => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);
      const days = Math.ceil((leaveEnd.getTime() - leaveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return sum + days;
    }, 0);

    if (totalDaysUsed + durationDays > 7) {
      return fail(
        `You have used ${totalDaysUsed} days in the last 2 months. Maximum is 7 days per 2 months.`,
        400
      );
    }

    // Insert leave request
    await db.insert(schema.leaveRequests).values({
      memberId: member.memberId,
      startDate,
      endDate,
      reason,
      leaveType: type,
      status: 'pending',
    });

    return done('Leave request submitted successfully. Waiting for HR approval.');
  },
  'Failed to submit leave request'
);
