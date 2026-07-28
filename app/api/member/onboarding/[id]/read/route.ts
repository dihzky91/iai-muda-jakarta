import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resources, resourceReads, members } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { memberRoute } from '@/lib/api';

type Params = { id: string };

/**
 * POST /api/member/onboarding/[id]/read
 * Mark onboarding document as read for current member and increment download count
 */
export const POST = memberRoute<Params>(async (_request, context, memberPayload) => {
  const { id } = await context.params;
  const resourceId = parseInt(id);

  if (isNaN(resourceId)) {
    return NextResponse.json(
      { success: false, message: 'Invalid resource ID' },
      { status: 400 }
    );
  }

  // 1. Verify resource exists
  const [targetResource] = await db
    .select()
    .from(resources)
    .where(eq(resources.id, resourceId))
    .limit(1);

  if (!targetResource) {
    return NextResponse.json(
      { success: false, message: 'Resource not found' },
      { status: 404 }
    );
  }

  // 2. Check if member profile is active
  const [currentMember] = await db
    .select({ id: members.id, isActive: members.isActive })
    .from(members)
    .where(eq(members.id, memberPayload.memberId))
    .limit(1);

  if (!currentMember || !currentMember.isActive) {
    return NextResponse.json(
      { success: false, message: 'Member profile is not active' },
      { status: 403 }
    );
  }

  // 3. Check if already marked read
  const [existingRead] = await db
    .select()
    .from(resourceReads)
    .where(
      and(
        eq(resourceReads.resourceId, resourceId),
        eq(resourceReads.memberId, currentMember.id)
      )
    )
    .limit(1);

  let newlyRead = false;

  if (!existingRead) {
    try {
      await db.insert(resourceReads).values({
        resourceId,
        memberId: currentMember.id,
      });
      newlyRead = true;
    } catch {
      // Ignore unique constraint race condition
    }
  }

  // 4. Increment download count in resources
  await db
    .update(resources)
    .set({
      downloadCount: sql`${resources.downloadCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(resources.id, resourceId));

  return NextResponse.json({
    success: true,
    message: 'Resource marked as read',
    isRead: true,
    newlyRead,
  });
}, 'Failed to record document read status');
