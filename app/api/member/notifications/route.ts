import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, desc, and } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';
import { ok, fail } from '@/lib/api';

/**
 * GET /api/member/notifications
 */
export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request as any);
    if (!user || user.type !== 'member') {
      return ok({ unreadCount: 0, notifications: [] });
    }

    const recipientMemberId = user.memberId;

    const notifications = await db
      .select({
        id: schema.portalNotifications.id,
        type: schema.portalNotifications.type,
        targetPostId: schema.portalNotifications.targetPostId,
        isRead: schema.portalNotifications.isRead,
        createdAt: schema.portalNotifications.createdAt,
        actorName: schema.members.name,
        actorAvatar: schema.members.imageUrl,
        postContent: schema.communityPosts.content,
      })
      .from(schema.portalNotifications)
      .leftJoin(schema.members, eq(schema.portalNotifications.actorMemberId, schema.members.id))
      .leftJoin(schema.communityPosts, eq(schema.portalNotifications.targetPostId, schema.communityPosts.id))
      .where(eq(schema.portalNotifications.recipientMemberId, recipientMemberId))
      .orderBy(desc(schema.portalNotifications.createdAt))
      .limit(20);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return ok({ unreadCount, notifications });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return fail('Gagal mengambil notifikasi', 500);
  }
}

/**
 * PUT /api/member/notifications (Mark as read)
 * Body: { notificationId?: number, markAll?: boolean }
 */
export async function PUT(request: Request) {
  try {
    const user = getUserFromRequest(request as any);
    if (!user || user.type !== 'member') {
      return fail('Unauthorized', 401);
    }

    const body = await request.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await db
        .update(schema.portalNotifications)
        .set({ isRead: true })
        .where(eq(schema.portalNotifications.recipientMemberId, user.memberId));
    } else if (notificationId) {
      await db
        .update(schema.portalNotifications)
        .set({ isRead: true })
        .where(
          and(
            eq(schema.portalNotifications.id, parseInt(notificationId, 10)),
            eq(schema.portalNotifications.recipientMemberId, user.memberId)
          )
        );
    }

    return ok({ success: true, message: 'Notifikasi berhasil diperbarui' });
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return fail('Gagal memperbarui notifikasi', 500);
  }
}
