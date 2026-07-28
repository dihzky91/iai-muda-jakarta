import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';
import { ok, fail } from '@/lib/api';

/**
 * POST /api/member/community/posts/[id]/reactions
 * Body: { reactionType: 'like' | 'insightful' | 'congrats' | 'appreciate' }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request as any);
    if (!user) {
      return fail('Anda harus login terlebih dahulu', 401);
    }

    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      return fail('ID postingan tidak valid', 400);
    }

    const body = await request.json();
    const reactionType = body.reactionType || 'like';

    if (!['like', 'insightful', 'congrats', 'appreciate'].includes(reactionType)) {
      return fail('Tipe reaksi tidak valid', 400);
    }

    let memberId: number;
    if (user.type === 'member') {
      memberId = user.memberId;
    } else if (user.type === 'admin') {
      memberId = 1;
    } else {
      return fail('Unauthorized', 403);
    }

    // Check existing reaction
    const [existing] = await db
      .select({ id: schema.communityReactions.id, reactionType: schema.communityReactions.reactionType })
      .from(schema.communityReactions)
      .where(
        and(
          eq(schema.communityReactions.postId, postId),
          eq(schema.communityReactions.memberId, memberId)
        )
      )
      .limit(1);

    if (existing) {
      if (existing.reactionType === reactionType) {
        // Toggle OFF (remove reaction)
        await db
          .delete(schema.communityReactions)
          .where(eq(schema.communityReactions.id, existing.id));
        return ok({ action: 'removed', reactionType: null });
      } else {
        // Change reaction type
        await db
          .update(schema.communityReactions)
          .set({ reactionType: reactionType as any })
          .where(eq(schema.communityReactions.id, existing.id));
        return ok({ action: 'updated', reactionType });
      }
    } else {
      // Add new reaction
      await db.insert(schema.communityReactions).values({
        postId,
        memberId,
        reactionType: reactionType as any,
      });

      // Fetch post author for notification
      const [post] = await db
        .select({ memberId: schema.communityPosts.memberId })
        .from(schema.communityPosts)
        .where(eq(schema.communityPosts.id, postId))
        .limit(1);

      if (post && post.memberId !== memberId) {
        await db.insert(schema.portalNotifications).values({
          recipientMemberId: post.memberId,
          actorMemberId: memberId,
          type: 'reaction',
          targetPostId: postId,
        });
      }

      return ok({ action: 'added', reactionType });
    }
  } catch (error: any) {
    console.error('Error toggling reaction:', error);
    return fail('Gagal memperbarui reaksi', 500);
  }
}
