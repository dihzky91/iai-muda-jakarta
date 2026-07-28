import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';
import { ok, fail } from '@/lib/api';

/**
 * DELETE /api/member/community/posts/[id]
 */
export async function DELETE(
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

    const [post] = await db
      .select({ memberId: schema.communityPosts.memberId })
      .from(schema.communityPosts)
      .where(eq(schema.communityPosts.id, postId))
      .limit(1);

    if (!post) {
      return fail('Postingan tidak ditemukan', 404);
    }

    // Check authorization: author or admin
    if (user.type === 'member' && post.memberId !== user.memberId) {
      return fail('Anda tidak memiliki akses untuk menghapus postingan ini', 403);
    }

    // Delete post & related data
    await Promise.all([
      db.delete(schema.communityPosts).where(eq(schema.communityPosts.id, postId)),
      db.delete(schema.communityComments).where(eq(schema.communityComments.postId, postId)),
      db.delete(schema.communityReactions).where(eq(schema.communityReactions.postId, postId)),
      db.delete(schema.communityMentions).where(eq(schema.communityMentions.postId, postId)),
      db.delete(schema.portalNotifications).where(eq(schema.portalNotifications.targetPostId, postId)),
    ]);

    return ok({ success: true, message: 'Postingan berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting community post:', error);
    return fail('Gagal menghapus postingan', 500);
  }
}
