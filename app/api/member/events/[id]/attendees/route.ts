/**
 * API: GET /api/member/events/[id]/attendees
 * 
 * Get list of attendees (RSVPs) for an event
 * Only accessible by committee members of the event
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { eventRsvps, eventCommittees, members } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyMemberToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Verify member authentication
    const authResult = await verifyMemberToken(request);
    if (!authResult.valid || !authResult.memberId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const memberId = authResult.memberId;

    // Check if member is committee for this event
    const [committee] = await db
      .select()
      .from(eventCommittees)
      .where(
        and(
          eq(eventCommittees.eventId, eventId),
          eq(eventCommittees.memberId, memberId)
        )
      )
      .limit(1);

    if (!committee) {
      return NextResponse.json(
        { error: 'Forbidden: Only committee members can view attendees' },
        { status: 403 }
      );
    }

    // Get all RSVPs with member info
    const rsvps = await db
      .select({
        rsvp: eventRsvps,
        member: members,
      })
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

    // Calculate stats
    const stats = {
      totalAttending: formattedRsvps.filter(r => r.status === 'attending').length,
      totalNotAttending: formattedRsvps.filter(r => r.status === 'not_attending').length,
      totalMaybe: formattedRsvps.filter(r => r.status === 'maybe').length,
      totalResponded: formattedRsvps.length,
    };

    return NextResponse.json({
      attendees: formattedRsvps,
      stats,
    });

  } catch (error) {
    console.error('Error fetching attendees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendees' },
      { status: 500 }
    );
  }
}
