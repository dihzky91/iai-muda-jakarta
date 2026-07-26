import { db } from '@/lib/db';
import { events, eventRsvps } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { memberRoute, fail, done } from '@/lib/api';

const VALID_STATUSES = ['attending', 'not_attending', 'maybe'] as const;
type RsvpStatus = typeof VALID_STATUSES[number];

type Params = { id: string };

export const POST = memberRoute<Params>(async (request, { params }, member) => {
  const { id } = await params;
  const eventId = parseInt(id);
  const memberId = member.memberId;

  const body = await request.json();
  const status = body.status as RsvpStatus;

  if (!VALID_STATUSES.includes(status)) {
    return fail(`Status tidak valid. Harus salah satu dari: ${VALID_STATUSES.join(', ')}`, 400);
  }

  const eventList = await db.select().from(events).where(eq(events.id, eventId)).limit(1);

  if (eventList.length === 0) {
    return fail('Event tidak ditemukan', 404);
  }

  if (eventList[0].eventType !== 'internal') {
    return fail('RSVP hanya tersedia untuk event internal organisasi', 400);
  }

  const rsvpFilter = and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.memberId, memberId));

  const existing = await db.select().from(eventRsvps).where(rsvpFilter).limit(1);

  if (existing.length > 0) {
    await db.update(eventRsvps).set({ status, respondedAt: new Date() }).where(rsvpFilter);
    return done('RSVP berhasil diperbarui', { data: { eventId, memberId, status } });
  }

  await db.insert(eventRsvps).values({ eventId, memberId, status });
  return done('RSVP berhasil disimpan', { data: { eventId, memberId, status } });
}, 'Failed to submit RSVP');

export const DELETE = memberRoute<Params>(async (_request, { params }, member) => {
  const { id } = await params;

  await db
    .delete(eventRsvps)
    .where(and(eq(eventRsvps.eventId, parseInt(id)), eq(eventRsvps.memberId, member.memberId)));

  return done('RSVP berhasil dihapus');
}, 'Failed to delete RSVP');
