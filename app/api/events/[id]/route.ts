import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { adminRoute, publicRoute, fail, ok, done } from '@/lib/api';

const URL_REGEX = /^https:\/\/(docs\.)?google\.com\/forms\/.+/i;

type Params = { id: string };

const EDITORS = ['superadmin', 'admin', 'editor'] as const;

export const GET = publicRoute<Params>(async (_request, { params }) => {
  const { id } = await params;
  const event = await db.select().from(schema.events).where(eq(schema.events.id, parseInt(id))).limit(1);
  if (!event.length) {
    return fail('Event not found', 404);
  }
  return ok(event[0]);
}, 'Failed to fetch event');

export const PUT = adminRoute<Params>([...EDITORS], async (request, { params }) => {
  const { id } = await params;
  const { title, description, date, endDate, time, location, imageUrl, registrationUrl, status, eventType, generationId, allDay, color } = await request.json();

  if (registrationUrl && !URL_REGEX.test(registrationUrl)) {
    return fail('Link Google Form tidak valid. Harus berupa URL Google Form (https://docs.google.com/forms/...)', 400);
  }

  if (endDate && date && endDate < date) {
    return fail('Tanggal selesai harus sama atau setelah tanggal mulai.', 400);
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
  }).where(eq(schema.events.id, parseInt(id)));

  return done('Event updated successfully');
}, 'Failed to update event');

export const DELETE = adminRoute<Params>([...EDITORS], async (_request, { params }) => {
  const { id } = await params;

  await db.delete(schema.events).where(eq(schema.events.id, parseInt(id)));

  return done('Event deleted successfully');
}, 'Failed to delete event');
