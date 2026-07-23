import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events, eventRsvps } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getUserFromRequest, requireMember } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!requireMember(user)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('type');
    const status = searchParams.get('status');

    // Fetch all events first (simple approach; can be optimized later)
    let eventsList = await db
      .select()
      .from(events)
      .orderBy(desc(events.date));

    // Filter in memory
    if (eventType === 'public' || eventType === 'internal') {
      eventsList = eventsList.filter(e => e.eventType === eventType);
    }
    if (status === 'upcoming' || status === 'ongoing' || status === 'completed') {
      eventsList = eventsList.filter(e => e.status === status);
    }

    // Get RSVP status for current member
    const memberId = user.memberId;
    const rsvps = await db
      .select()
      .from(eventRsvps)
      .where(eq(eventRsvps.memberId, memberId));

    const rsvpMap = new Map(rsvps.map(r => [r.eventId, r.status]));

    // Enrich events with RSVP status
    const enriched = eventsList.map(e => ({
      ...e,
      myRsvpStatus: rsvpMap.get(e.id) || null,
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch events' }, { status: 500 });
  }
}
