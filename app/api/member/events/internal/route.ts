/**
 * API: GET /api/member/events/internal
 *
 * Daftar event internal untuk RSVP anggota.
 * Alumni hanya melihat event dengan visibleToAlumni = true;
 * pengurus aktif melihat seluruh event internal.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events, eventRsvps, members } from '@/db/schema';
import { eq, and, inArray, desc } from 'drizzle-orm';
import { memberRouteRaw, errorBody } from '@/lib/api';

export const GET = memberRouteRaw(async (_request, _context, member) => {
  const memberId = member.memberId;

  const [currentMember] = await db
    .select()
    .from(members)
    .where(eq(members.id, memberId))
    .limit(1);

  if (!currentMember) {
    return errorBody('Member not found', 404);
  }

  const isAlumni = currentMember.isAlumni;

  const internalEvents = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.eventType, 'internal'),
        isAlumni ? eq(events.visibleToAlumni, true) : undefined
      )
    )
    .orderBy(desc(events.date));

  const eventIds = internalEvents.map(e => e.id);

  // inArray, bukan or(...map(eq)) — satu predikat IN (...) alih-alih rantai OR
  // sepanjang jumlah event. Tanpa event sama sekali, query dilewati: or() dan
  // inArray() dengan daftar kosong sama-sama bermasalah.
  const allRsvps = eventIds.length
    ? await db.select().from(eventRsvps).where(inArray(eventRsvps.eventId, eventIds))
    : [];

  const enrichedEvents = internalEvents.map(event => {
    const eventRsvpList = allRsvps.filter(r => r.eventId === event.id);
    const myRsvp = eventRsvpList.find(r => r.memberId === memberId);

    return {
      ...event,
      myRsvpStatus: myRsvp?.status || null,
      stats: {
        totalAttending: eventRsvpList.filter(r => r.status === 'attending').length,
        totalNotAttending: eventRsvpList.filter(r => r.status === 'not_attending').length,
        totalMaybe: eventRsvpList.filter(r => r.status === 'maybe').length,
        totalResponded: eventRsvpList.length,
      },
      myRsvp: myRsvp
        ? { status: myRsvp.status, respondedAt: myRsvp.respondedAt?.toISOString() || '' }
        : null,
    };
  });

  return NextResponse.json({
    events: enrichedEvents,
    memberInfo: {
      isAlumni,
      canSeeAllInternal: !isAlumni,
    },
  });
}, 'Failed to fetch internal events', 'Error fetching internal events:');
