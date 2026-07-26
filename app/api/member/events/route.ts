import { db } from '@/lib/db';
import { events, eventRsvps } from '@/db/schema';
import { eq, and, desc, getTableColumns, type SQL } from 'drizzle-orm';
import { memberRoute, ok } from '@/lib/api';

const EVENT_TYPES = ['public', 'internal'] as const;
const EVENT_STATUSES = ['upcoming', 'ongoing', 'completed'] as const;

export const GET = memberRoute(async (request, _context, member) => {
  const { searchParams } = new URL(request.url);
  const eventType = searchParams.get('type');
  const status = searchParams.get('status');

  // Filter dilakukan di SQL, bukan di memori — sebelumnya seluruh tabel
  // events ditarik dulu lalu di-.filter() di JS.
  const conditions: SQL[] = [];
  if (EVENT_TYPES.includes(eventType as any)) {
    conditions.push(eq(events.eventType, eventType as (typeof EVENT_TYPES)[number]));
  }
  if (EVENT_STATUSES.includes(status as any)) {
    conditions.push(eq(events.status, status as (typeof EVENT_STATUSES)[number]));
  }

  // RSVP milik member digabung lewat LEFT JOIN, jadi cukup satu round-trip
  // (sebelumnya dua query terpisah + penggabungan pakai Map di JS).
  const rows = await db
    .select({
      ...getTableColumns(events),
      myRsvpStatus: eventRsvps.status,
    })
    .from(events)
    .leftJoin(
      eventRsvps,
      and(eq(eventRsvps.eventId, events.id), eq(eventRsvps.memberId, member.memberId))
    )
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(events.date));

  return ok(rows.map(row => ({ ...row, myRsvpStatus: row.myRsvpStatus ?? null })));
}, 'Failed to fetch events');
