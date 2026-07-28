import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { adminRoute, done, fail } from '@/lib/api';

/**
 * PATCH /api/hr/leave/[id]
 * Approve or reject a leave request
 */
export const PATCH = adminRoute(
  ['superadmin', 'admin'],
  async (request, context, user) => {
    const { id } = await context.params;
    const leaveId = parseInt(id, 10);

    if (isNaN(leaveId)) {
      return fail('Invalid leave request ID', 400);
    }

    const body = await request.json();
    const { status, reviewNotes } = body;

    // Validate status
    if (!status || !['approved', 'rejected'].includes(status)) {
      return fail('Invalid status. Must be either "approved" or "rejected"', 400);
    }

    // Check if leave request exists
    const existing = await db
      .select()
      .from(schema.leaveRequests)
      .where(eq(schema.leaveRequests.id, leaveId))
      .limit(1);

    if (existing.length === 0) {
      return fail('Leave request not found', 404);
    }

    if (existing[0].status !== 'pending') {
      return fail('Leave request has already been reviewed', 400);
    }

    // Update leave request
    await db
      .update(schema.leaveRequests)
      .set({
        status,
        reviewedBy: user.userId,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || null,
        updatedAt: new Date(),
      })
      .where(eq(schema.leaveRequests.id, leaveId));

    return done(`Leave request ${status}`);
  },
  'Failed to update leave request'
);
