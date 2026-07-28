import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, asc } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';
import { ok, fail } from '@/lib/api';

/**
 * GET /api/member/community/posts/[id]/comments
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      return fail('ID postingan tidak valid', 400);
    }

    const comments = await db
      .select({
        id: schema.communityComments.id,
        postId: schema.communityComments.postId,
        parentId: schema.communityComments.parentId,
        memberId: schema.communityComments.memberId,
        content: schema.communityComments.content,
        createdAt: schema.communityComments.createdAt,
        authorName: schema.members.name,
        authorRole: schema.members.division,
        authorDivision: schema.members.division,
        authorAvatar: schema.members.imageUrl,
      })
      .from(schema.communityComments)
      .leftJoin(schema.members, eq(schema.communityComments.memberId, schema.members.id))
      .where(eq(schema.communityComments.postId, postId))
      .orderBy(asc(schema.communityComments.createdAt));

    return ok(comments);
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return fail('Gagal mengambil komentar', 500);
  }
}

/**
 * POST /api/member/community/posts/[id]/comments
 * Body: { content: string, parentId?: number }
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
    const { content, parentId } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return fail('Komentar tidak boleh kosong', 400);
    }

    let authorMemberId: number;
    if (user.type === 'member') {
      authorMemberId = user.memberId;
    } else if (user.type === 'admin') {
      authorMemberId = 1; // Fallback admin member
    } else {
      return fail('Unauthorized', 403);
    }

    // Verify post exists & fetch post author
    const [post] = await db
      .select({ memberId: schema.communityPosts.memberId })
      .from(schema.communityPosts)
      .where(eq(schema.communityPosts.id, postId))
      .limit(1);

    if (!post) {
      return fail('Postingan tidak ditemukan', 404);
    }

    // Insert comment
    const [result] = await db.insert(schema.communityComments).values({
      postId,
      parentId: parentId ? parseInt(parentId, 10) : null,
      memberId: authorMemberId,
      content: content.trim(),
    });

    const newCommentId = (result as any).insertId;

    // Trigger notification to post author if not commenting on own post
    if (post.memberId !== authorMemberId) {
      await db.insert(schema.portalNotifications).values({
        recipientMemberId: post.memberId,
        actorMemberId: authorMemberId,
        type: parentId ? 'reply' : 'comment',
        targetPostId: postId,
      });
    }

    // Parse @mentions (Format: @[Nama Member](memberId))
    const mentionRegex = /@\[([^\]]+)\]\((\d+)\)/g;
    let match;
    const mentionedIds: number[] = [];

    while ((match = mentionRegex.exec(content)) !== null) {
      const mentionedId = parseInt(match[2], 10);
      if (mentionedId && !mentionedIds.includes(mentionedId) && mentionedId !== authorMemberId && mentionedId !== post.memberId) {
        mentionedIds.push(mentionedId);
      }
    }

    if (mentionedIds.length > 0) {
      const mentionValues = mentionedIds.map(mId => ({
        postId,
        commentId: newCommentId,
        mentionedMemberId: mId,
        authorMemberId,
      }));

      const notifValues = mentionedIds.map(mId => ({
        recipientMemberId: mId,
        actorMemberId: authorMemberId,
        type: 'mention' as const,
        targetPostId: postId,
      }));

      await Promise.all([
        db.insert(schema.communityMentions).values(mentionValues),
        db.insert(schema.portalNotifications).values(notifValues),
      ]);
    }

    return ok({ id: newCommentId, message: 'Komentar berhasil dikirim!' });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return fail('Gagal mengirim komentar', 500);
  }
}
