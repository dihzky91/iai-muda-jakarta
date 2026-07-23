import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events, eventRsvps } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUserFromRequest, requireMember } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireMember(user)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const eventId = parseInt(id);

    const eventList = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (eventList.length === 0) {
      return NextResponse.json({ success: false, message: 'Event tidak ditemukan' }, { status: 404 });
    }

    const event = eventList[0];

    // Block internal events to non-admin (safety: pastikan eventType)
    if (event.eventType === 'internal') {
      // Member boleh lihat event internal (portal anggota)
    }

    // Get RSVP status for current member
    const memberId = user.memberId;
    const rsvpList = await db
      .select()
      .from(eventRsvps)
      .where(and(
        eq(eventRsvps.eventId, eventId),
        eq(eventRsvps.memberId, memberId)
      ))
      .limit(1);

    const myRsvp = rsvpList[0] || null;

    // Get RSVP stats (total attending, etc.)
    const allRsvps = await db
      .select()
      .from(eventRsvps)
      .where(eq(eventRsvps.eventId, eventId));

    const stats = {
      totalAttending: allRsvps.filter(r => r.status === 'attending').length,
      totalNotAttending: allRsvps.filter(r => r.status === 'not_attending').length,
      totalMaybe: allRsvps.filter(r => r.status === 'maybe').length,
      totalResponded: allRsvps.length,
    };

    return NextResponse.json({
      success: true,
      data: {
        ...event,
        myRsvp: myRsvp ? { status: myRsvp.status, respondedAt: myRsvp.respondedAt } : null,
        stats,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch event' }, { status: 500 });
  }
}
