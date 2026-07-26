/**
 * API: GET /api/member/events/[id]/attendees
 *
 * Daftar RSVP sebuah event. Hanya untuk panitia event tersebut.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eventRsvps, eventCommittees, members } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { memberRouteRaw, errorBody } from '@/lib/api';

type Params = { id: string };

export const GET = memberRouteRaw<Params>(async (_request, { params }, member) => {
  const { id } = await params;
  const eventId = parseInt(id);

  if (isNaN(eventId)) {
    return errorBody('Invalid event ID', 400);
  }

  const [committee] = await db
    .select()
    .from(eventCommittees)
    .where(
      and(
        eq(eventCommittees.eventId, eventId),
        eq(eventCommittees.memberId, member.memberId)
      )
    )
    .limit(1);

  if (!committee) {
    return errorBody('Forbidden: Only committee members can view attendees', 403);
  }

  const rsvps = await db
    .select({ rsvp: eventRsvps, member: members })
    .from(eventRsvps)
    .innerJoin(members, eq(eventRsvps.memberId, members.id))
    .where(eq(eventRsvps.eventId, eventId));

  const formattedRsvps = rsvps.map(r => ({
    id: r.rsvp.id,
    eventId: r.rsvp.eventId,
    memberId: r.rsvp.memberId,
    status: r.rsvp.status,
    respondedAt: r.rsvp.respondedAt?.toISOString() || '',
    member: {
      id: r.member.id,
      name: r.member.name,
      email: r.member.email,
      imageUrl: r.member.imageUrl,
      division: r.member.division,
      isAlumni: r.member.isAlumni,
    },
  }));

  return NextResponse.json({
    attendees: formattedRsvps,
    stats: {
      totalAttending: formattedRsvps.filter(r => r.status === 'attending').length,
      totalNotAttending: formattedRsvps.filter(r => r.status === 'not_attending').length,
      totalMaybe: formattedRsvps.filter(r => r.status === 'maybe').length,
      totalResponded: formattedRsvps.length,
    },
  });
}, 'Failed to fetch attendees', 'Error fetching attendees:');
