/**
 * API: GET /api/member/events/internal
 * 
 * Get list of internal events (for member RSVP)
 * Filters by member status (active pengurus or alumni based on visibleToAlumni flag)
 * For Portal Anggota - Event Internal (A2)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { events, eventRsvps, members } from '@/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { verifyMemberToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify member authentication
    const authResult = await verifyMemberToken(request);
    if (!authResult.valid || !authResult.memberId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const memberId = authResult.memberId;

    // Get current member info to check if alumni
    const [currentMember] = await db
      .select()
      .from(members)
      .where(eq(members.id, memberId))
      .limit(1);

    if (!currentMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    const isAlumni = currentMember.isAlumni;

    // Get internal events
    // If member is alumni, only show events with visibleToAlumni=true
    // If member is active pengurus, show all internal events
    const internalEventsQuery = db
      .select()
      .from(events)
      .where(
        and(
          eq(events.eventType, 'internal'),
          isAlumni 
            ? eq(events.visibleToAlumni, true)
            : undefined // Active pengurus can see all internal events
        )
      )
      .orderBy(desc(events.date));

    const internalEvents = await internalEventsQuery;

    // Get RSVPs for current member
    const myRsvps = await db
      .select()
      .from(eventRsvps)
      .where(
        and(
          eq(eventRsvps.memberId, memberId),
          or(...internalEvents.map(e => eq(eventRsvps.eventId, e.id)))
        )
      );

    // Get RSVP stats for each event
    const allRsvps = await db
      .select()
      .from(eventRsvps)
      .where(
        or(...internalEvents.map(e => eq(eventRsvps.eventId, e.id)))
      );

    // Build enriched events with RSVP data
    const enrichedEvents = internalEvents.map(event => {
      const myRsvp = myRsvps.find(r => r.eventId === event.id);
      const eventRsvpList = allRsvps.filter(r => r.eventId === event.id);

      const stats = {
        totalAttending: eventRsvpList.filter(r => r.status === 'attending').length,
        totalNotAttending: eventRsvpList.filter(r => r.status === 'not_attending').length,
        totalMaybe: eventRsvpList.filter(r => r.status === 'maybe').length,
        totalResponded: eventRsvpList.length,
      };

      return {
        ...event,
        myRsvpStatus: myRsvp?.status || null,
        stats,
        myRsvp: myRsvp ? {
          status: myRsvp.status,
          respondedAt: myRsvp.respondedAt?.toISOString() || '',
        } : null,
      };
    });

    return NextResponse.json({ 
      events: enrichedEvents,
      memberInfo: {
        isAlumni,
        canSeeAllInternal: !isAlumni,
      },
    });

  } catch (error) {
    console.error('Error fetching internal events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch internal events' },
      { status: 500 }
    );
  }
}
