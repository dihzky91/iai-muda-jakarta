import { db, schema } from '@/lib/db';
import { eq, gte, desc } from 'drizzle-orm';
import { memberRoute, ok } from '@/lib/api';

/**
 * Data agregat untuk dashboard portal anggota:
 * acara mendatang, pengumuman terbaru, dan waktu login terakhir.
 */
export const GET = memberRoute(async (_request, _context, member) => {
  const today = new Date().toISOString().split('T')[0];

  // Ketiganya saling independen — dijalankan paralel, bukan berurutan.
  const [events, announcements, accounts] = await Promise.all([
    db
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
      .limit(5),
    db
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
      .limit(3),
    db
      .select({ lastLoginAt: schema.memberAccounts.lastLoginAt })
      .from(schema.memberAccounts)
      .where(eq(schema.memberAccounts.memberId, member.memberId))
      .limit(1),
  ]);

  return ok({
    events,
    announcements,
    lastLoginAt: accounts[0]?.lastLoginAt || null,
  });
}, 'Failed to fetch dashboard data');
