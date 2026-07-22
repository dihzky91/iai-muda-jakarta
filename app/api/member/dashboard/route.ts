import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, gte, desc } from 'drizzle-orm';
import { getUserFromRequest, requireMember } from '@/lib/auth';

/**
 * Dashboard API for member portal.
 * Returns aggregated data needed for the redesigned dashboard:
 * - upcoming events
 * - recent announcements (articles)
 * - recent activity derived from available data
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!requireMember(user)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const today = new Date().toISOString().split('T')[0];

    // Fetch upcoming events (date >= today), sorted by nearest date, limited to 5
    const events = await db
      .select({
        id: schema.events.id,
        title: schema.events.title,
        description: schema.events.description,
        date: schema.events.date,
        time: schema.events.time,
        location: schema.events.location,
        imageUrl: schema.events.imageUrl,
        registrationUrl: schema.events.registrationUrl,
        status: schema.events.status,
      })
      .from(schema.events)
      .where(gte(schema.events.date, today))
      .orderBy(schema.events.date)
      .limit(5);

    // Fetch recent announcements from articles, sorted by date desc, limited to 3
    const announcements = await db
      .select({
        id: schema.articles.id,
        title: schema.articles.title,
        excerpt: schema.articles.excerpt,
        date: schema.articles.date,
        author: schema.articles.author,
        imageUrl: schema.articles.imageUrl,
      })
      .from(schema.articles)
      .orderBy(desc(schema.articles.date))
      .limit(3);

    // Fetch member account for lastLoginAt to build activity feed
    const accounts = await db
      .select({ lastLoginAt: schema.memberAccounts.lastLoginAt })
      .from(schema.memberAccounts)
      .where(eq(schema.memberAccounts.memberId, user.memberId))
      .limit(1);

    const account = accounts[0];

    return NextResponse.json({
      success: true,
      data: {
        events,
        announcements,
        lastLoginAt: account?.lastLoginAt || null,
      },
    });
  } catch (err: any) {
    console.error('[Member Dashboard API Error]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
