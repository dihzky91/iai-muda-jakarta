import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, desc, and, sql, inArray, like, or } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';
import { ok, fail } from '@/lib/api';

/**
 * GET /api/member/community/posts
 * Query params:
 * - scope: 'all' | 'division' | 'generation'
 * - category: 'all' | 'umum' | 'diskusi_karir' | 'regulasi_pajak' | 'info_lowongan' | 'event_sharing'
 * - search: string (search in content or author name)
 * - page: number (default 1)
 * - limit: number (default 15)
 */
export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request as any);
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'all';
    const category = searchParams.get('category') || 'all';
    const search = searchParams.get('search')?.trim() || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '15', 10), 30);
    const offset = (page - 1) * limit;

    let memberDivision: string | null = null;
    let memberId: number | null = null;

    if (user?.type === 'member') {
      memberId = user.memberId;
      const [currentMember] = await db
        .select({ division: schema.members.division })
        .from(schema.members)
        .where(eq(schema.members.id, user.memberId))
        .limit(1);
      memberDivision = currentMember?.division || null;
    }

    // Build conditions
    const conditions: any[] = [];
    if (scope === 'division' && memberDivision) {
      conditions.push(eq(schema.communityPosts.targetDivision, memberDivision));
    }
    if (category && category !== 'all') {
      conditions.push(eq(schema.communityPosts.category, category));
    }
    if (search) {
      conditions.push(
        or(
          like(schema.communityPosts.content, `%${search}%`),
          like(schema.members.name, `%${search}%`)
        )
      );
    }

    // Fetch posts sorted by isPinned DESC, createdAt DESC
    const postsQuery = db
      .select({
        id: schema.communityPosts.id,
        memberId: schema.communityPosts.memberId,
        category: schema.communityPosts.category,
        content: schema.communityPosts.content,
        imageUrl: schema.communityPosts.imageUrl,
        attachmentUrl: schema.communityPosts.attachmentUrl,
        attachmentName: schema.communityPosts.attachmentName,
        scope: schema.communityPosts.scope,
        targetDivision: schema.communityPosts.targetDivision,
        isPinned: schema.communityPosts.isPinned,
        createdAt: schema.communityPosts.createdAt,
        authorName: schema.members.name,
        authorRole: schema.members.division,
        authorDivision: schema.members.division,
        authorAvatar: schema.members.imageUrl,
      })
      .from(schema.communityPosts)
      .leftJoin(schema.members, eq(schema.communityPosts.memberId, schema.members.id))
      .orderBy(desc(schema.communityPosts.isPinned), desc(schema.communityPosts.createdAt))
      .limit(limit)
      .offset(offset);

    if (conditions.length > 0) {
      postsQuery.where(and(...conditions));
    }

    const posts = await postsQuery;

    if (posts.length === 0) {
      return ok([], { page, limit, hasMore: false });
    }

    const postIds = posts.map(p => p.id);

    // Fetch counts and user reaction
    const [commentsCountRows, reactionsCountRows, myReactionsRows] = await Promise.all([
      db
        .select({
          postId: schema.communityComments.postId,
          count: sql<number>`count(*)`,
        })
        .from(schema.communityComments)
        .where(inArray(schema.communityComments.postId, postIds))
        .groupBy(schema.communityComments.postId),

      db
        .select({
          postId: schema.communityReactions.postId,
          reactionType: schema.communityReactions.reactionType,
          count: sql<number>`count(*)`,
        })
        .from(schema.communityReactions)
        .where(inArray(schema.communityReactions.postId, postIds))
        .groupBy(schema.communityReactions.postId, schema.communityReactions.reactionType),

      memberId
        ? db
            .select({
              postId: schema.communityReactions.postId,
              reactionType: schema.communityReactions.reactionType,
            })
            .from(schema.communityReactions)
            .where(
              and(
                inArray(schema.communityReactions.postId, postIds),
                eq(schema.communityReactions.memberId, memberId)
              )
            )
        : Promise.resolve([] as any[]),
    ]);

    // Map counts
    const commentsMap: Record<number, number> = {};
    commentsCountRows.forEach(r => { commentsMap[r.postId] = Number(r.count); });

    const reactionsMap: Record<number, { total: number; types: Record<string, number> }> = {};
    reactionsCountRows.forEach(r => {
      if (!reactionsMap[r.postId]) reactionsMap[r.postId] = { total: 0, types: {} };
      reactionsMap[r.postId].total += Number(r.count);
      reactionsMap[r.postId].types[r.reactionType] = Number(r.count);
    });

    const myReactionsMap: Record<number, string> = {};
    (myReactionsRows as any[]).forEach(r => { myReactionsMap[r.postId] = r.reactionType; });

    const formattedPosts = posts.map(p => ({
      ...p,
      commentsCount: commentsMap[p.id] || 0,
      reactionsTotal: reactionsMap[p.id]?.total || 0,
      reactionsBreakdown: reactionsMap[p.id]?.types || {},
      myReaction: myReactionsMap[p.id] || null,
    }));

    return ok(formattedPosts, { page, limit, hasMore: posts.length === limit });
  } catch (error: any) {
    console.error('Error fetching community posts:', error);
    return fail('Gagal mengambil data feed komunitas', 500);
  }
}

/**
 * POST /api/member/community/posts
 * Body: { content: string, imageUrl?: string, attachmentUrl?: string, attachmentName?: string, scope?: string }
 */
export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request as any);
    if (!user) {
      return fail('Anda harus login terlebih dahulu', 401);
    }

    const body = await request.json();
    const { content, imageUrl, attachmentUrl, attachmentName, scope = 'all', category = 'umum' } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return fail('Isi postingan tidak boleh kosong', 400);
    }

    let authorMemberId: number;
    let targetDivision: string | null = null;
    let isPinned = false;

    if (user.type === 'member') {
      authorMemberId = user.memberId;
      const [currentMember] = await db
        .select({ division: schema.members.division })
        .from(schema.members)
        .where(eq(schema.members.id, user.memberId))
        .limit(1);
      targetDivision = currentMember?.division || null;

      // Rate limit check: max 2 photo uploads per day for regular members
      if (imageUrl) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [photoCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(schema.communityPosts)
          .where(
            and(
              eq(schema.communityPosts.memberId, authorMemberId),
              sql`${schema.communityPosts.imageUrl} IS NOT NULL`,
              sql`${schema.communityPosts.createdAt} >= ${startOfDay}`
            )
          );

        if (Number(photoCount?.count || 0) >= 2) {
          return fail('Batas upload foto harian tercapai (maks 2 foto/hari). Postingan tanpa foto tetap dapat dikirim!', 400);
        }
      }
    } else if (user.type === 'admin') {
      // If admin posts, find associated member or fallback to first superadmin member ID
      authorMemberId = 1; // Fallback admin member ID
      isPinned = true; // Admin posts can be pinned
    } else {
      return fail('Unauthorized', 403);
    }

    // Insert post
    const [result] = await db.insert(schema.communityPosts).values({
      memberId: authorMemberId,
      category: typeof category === 'string' && category.trim() ? category.trim() : 'umum',
      content: content.trim(),
      imageUrl: imageUrl || null,
      attachmentUrl: attachmentUrl || null,
      attachmentName: attachmentName || null,
      scope: scope === 'division' ? 'division' : 'all',
      targetDivision,
      isPinned,
    });

    const newPostId = (result as any).insertId;

    // Parse @mentions (Format: @[Nama Member](memberId))
    const mentionRegex = /@\[([^\]]+)\]\((\d+)\)/g;
    let match;
    const mentionedIds: number[] = [];

    while ((match = mentionRegex.exec(content)) !== null) {
      const mentionedId = parseInt(match[2], 10);
      if (mentionedId && !mentionedIds.includes(mentionedId) && mentionedId !== authorMemberId) {
        mentionedIds.push(mentionedId);
      }
    }

    if (mentionedIds.length > 0) {
      // Insert mentions and notifications
      const mentionValues = mentionedIds.map(mId => ({
        postId: newPostId,
        mentionedMemberId: mId,
        authorMemberId,
      }));

      const notifValues = mentionedIds.map(mId => ({
        recipientMemberId: mId,
        actorMemberId: authorMemberId,
        type: 'mention' as const,
        targetPostId: newPostId,
      }));

      await Promise.all([
        db.insert(schema.communityMentions).values(mentionValues),
        db.insert(schema.portalNotifications).values(notifValues),
      ]);
    }

    return ok({ id: newPostId, message: 'Postingan berhasil diterbitkan!' });
  } catch (error: any) {
    console.error('Error creating community post:', error);
    return fail('Gagal menerbitkan postingan', 500);
  }
}
