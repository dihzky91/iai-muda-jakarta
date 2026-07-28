import { db, schema } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { memberRoute, ok } from '@/lib/api';

/**
 * GET /api/member/hr/status
 * Get member's own current status
 */
export const GET = memberRoute(
  async (_request, _context, member) => {
    // Get latest status for this member
    const statuses = await db
      .select({
        status: schema.memberStatuses.status,
        reason: schema.memberStatuses.reason,
        createdAt: schema.memberStatuses.createdAt,
      })
      .from(schema.memberStatuses)
      .where(eq(schema.memberStatuses.memberId, member.memberId))
      .orderBy(desc(schema.memberStatuses.createdAt))
      .limit(1);

    const currentStatus = statuses.length > 0 ? statuses[0] : null;

    return ok({ currentStatus });
  },
  'Failed to fetch status'
);
