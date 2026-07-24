const URL_REGEX = /^https:\/\/(docs\.)?google\.com\/forms\/.+/i;

import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const event = await db.select().from(schema.events).where(eq(schema.events.id, parseInt(id))).limit(1);
    if (!event.length) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: event[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin', 'editor')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { title, description, date, endDate, time, location, imageUrl, registrationUrl, status, eventType, generationId, allDay, color } = await request.json();
    const eventId = parseInt(id);

    // Validasi registrationUrl jika diisi
    if (registrationUrl && !URL_REGEX.test(registrationUrl)) {
      return NextResponse.json(
        { success: false, message: 'Link Google Form tidak valid. Harus berupa URL Google Form (https://docs.google.com/forms/...)' },
        { status: 400 }
      );
    }

    if (endDate && date && endDate < date) {
      return NextResponse.json(
        { success: false, message: 'Tanggal selesai harus sama atau setelah tanggal mulai.' },
        { status: 400 }
      );
    }

    await db.update(schema.events).set({
      title: title || undefined,
      description: description || undefined,
      date: date || undefined,
      endDate: endDate !== undefined ? endDate : undefined,
      time: time || undefined,
      location: location || undefined,
      imageUrl: imageUrl || undefined,
      registrationUrl: registrationUrl || undefined,
      status: status || undefined,
      eventType: eventType || undefined,
      allDay: allDay !== undefined ? allDay : undefined,
      color: color || undefined,
      generationId: generationId || undefined,
    }).where(eq(schema.events.id, eventId));

    return NextResponse.json({ success: true, message: 'Event updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin', 'editor')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const eventId = parseInt(id);

    await db.delete(schema.events).where(eq(schema.events.id, eventId));

    return NextResponse.json({ success: true, message: 'Event deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to delete event' }, { status: 500 });
  }
}
