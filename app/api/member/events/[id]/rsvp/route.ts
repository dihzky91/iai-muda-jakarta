import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events, eventRsvps } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUserFromRequest, requireMember } from '@/lib/auth';

const VALID_STATUSES = ['attending', 'not_attending', 'maybe'] as const;
type RsvpStatus = typeof VALID_STATUSES[number];

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireMember(user)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const eventId = parseInt(id);

    const body = await request.json();
    const status = body.status as RsvpStatus;

    // Validasi status
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: `Status tidak valid. Harus salah satu dari: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Cek event ada & internal
    const eventList = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (eventList.length === 0) {
      return NextResponse.json({ success: false, message: 'Event tidak ditemukan' }, { status: 404 });
    }

    const event = eventList[0];
    if (event.eventType !== 'internal') {
      return NextResponse.json(
        { success: false, message: 'RSVP hanya tersedia untuk event internal organisasi' },
        { status: 400 }
      );
    }

    const memberId = user.memberId;

    // Cek apakah sudah ada RSVP
    const existing = await db
      .select()
      .from(eventRsvps)
      .where(and(
        eq(eventRsvps.eventId, eventId),
        eq(eventRsvps.memberId, memberId)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await db
        .update(eventRsvps)
        .set({ status, respondedAt: new Date() })
        .where(and(
          eq(eventRsvps.eventId, eventId),
          eq(eventRsvps.memberId, memberId)
        ));
      return NextResponse.json({
        success: true,
        message: 'RSVP berhasil diperbarui',
        data: { eventId, memberId, status },
      });
    } else {
      // Create new
      await db.insert(eventRsvps).values({
        eventId,
        memberId,
        status,
      });
      return NextResponse.json({
        success: true,
        message: 'RSVP berhasil disimpan',
        data: { eventId, memberId, status },
      });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to submit RSVP' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireMember(user)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const eventId = parseInt(id);
    const memberId = user.memberId;

    await db
      .delete(eventRsvps)
      .where(and(
        eq(eventRsvps.eventId, eventId),
        eq(eventRsvps.memberId, memberId)
      ));

    return NextResponse.json({
      success: true,
      message: 'RSVP berhasil dihapus',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to delete RSVP' }, { status: 500 });
  }
}
