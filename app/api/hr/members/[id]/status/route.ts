import { db, schema } from '@/lib/db';
import { adminRoute, done, fail } from '@/lib/api';

/**
 * POST /api/hr/members/[id]/status
 * Change member status (Hijau, Kuning, Merah, Biru)
 */
export const POST = adminRoute(
  ['superadmin', 'admin'],
  async (request, context, user) => {
    const { id } = await context.params;
    const memberId = parseInt(id, 10);

    if (isNaN(memberId)) {
      return fail('Invalid member ID', 400);
    }

    const body = await request.json();
    const { status, reason } = body;

    // Validate status
    const validStatuses = ['hijau', 'kuning', 'merah', 'biru'];
    if (!status || !validStatuses.includes(status)) {
      return fail('Invalid status. Must be one of: hijau, kuning, merah, biru', 400);
    }

    // Insert new status record (append-only log)
    await db.insert(schema.memberStatuses).values({
      memberId,
      status,
      reason: reason || null,
      changedBy: user.userId,
    });

    return done(`Member status updated to ${status}`);
  },
  'Failed to update member status'
);
