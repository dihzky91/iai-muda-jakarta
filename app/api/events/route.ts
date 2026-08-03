import { db, schema, insertedId, ensureEventsSchema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { adminRoute, publicRoute, fail, ok, done } from '@/lib/api';

const URL_REGEX = /^https?:\/\/.+/i;

function validate(fields: Record<string, { value: unknown; minLen?: number; maxLen?: number; type?: string; enum?: string[]; regex?: RegExp; label: string }>) {
  for (const [, rule] of Object.entries(fields)) {
    const val = rule.value;
    if (val === undefined || val === null || val === '') {
      return `${rule.label} wajib diisi.`;
    }
    if (rule.type === 'string' && typeof val !== 'string') {
      return `${rule.label} harus berupa teks.`;
    }
    if (typeof val === 'string') {
      if (rule.minLen && val.trim().length < rule.minLen) {
        return `${rule.label} minimal ${rule.minLen} karakter.`;
      }
      if (rule.maxLen && val.trim().length > rule.maxLen) {
        return `${rule.label} maksimal ${rule.maxLen} karakter.`;
      }
      if (rule.enum && !rule.enum.includes(val)) {
        return `${rule.label} harus salah satu dari: ${rule.enum.join(', ')}.`;
      }
      if (rule.regex && !rule.regex.test(val)) {
        return `${rule.label} formatnya tidak valid.`;
      }
    }
  }
  return null;
}

export const GET = publicRoute(async () => {
  await ensureEventsSchema();
  // Event 'internal' hanya untuk portal anggota. Filternya di WHERE, bukan
  // .filter() setelah seluruh tabel ditarik — memakai idx_events_type_date.
  const events = await db
    .select()
    .from(schema.events)
    .where(eq(schema.events.eventType, 'public'))
    .orderBy(schema.events.date);
  return ok(events);
}, 'Failed to fetch events');

export const POST = adminRoute(['superadmin', 'admin', 'editor'], async (request) => {
  await ensureEventsSchema();
  const body = await request.json();
  const { title, description, date, endDate, time, location, imageUrl, registrationUrl, status, eventType, generationId, allDay, color, isFeatured, skpText, skpSubtitle, hasCertificate, priceText, speakersText, categoryBadge, isLive } = body;

  const regUrl = typeof registrationUrl === 'string' ? registrationUrl.trim() : registrationUrl;

  if (regUrl && !URL_REGEX.test(regUrl)) {
    return fail('Link pendaftaran tidak valid. Harus berupa URL yang diawali dengan http:// atau https:// (misal: https://forms.gle/... atau https://docs.google.com/forms/...)', 400);
  }

  if (endDate && endDate < date) {
    return fail('Tanggal selesai harus sama atau setelah tanggal mulai.', 400);
  }

  const err = validate({
    title:       { value: title,       type: 'string', minLen: 3, maxLen: 200,  label: 'Judul acara' },
    description: { value: description, type: 'string', minLen: 10,              label: 'Deskripsi' },
    date:        { value: date,        type: 'string', regex: /^\d{4}-\d{2}-\d{2}$/, label: 'Tanggal (format YYYY-MM-DD)' },
    ...(status ? { status: { value: status, enum: ['upcoming', 'ongoing', 'completed'], label: 'Status' } } : {}),
    ...(eventType ? { eventType: { value: eventType, enum: ['public', 'internal'], label: 'Tipe acara' } } : {}),
    ...(color ? { color: { value: color, enum: ['blue', 'emerald', 'purple', 'amber', 'slate', 'rose'], label: 'Warna' } } : {}),
  });
  if (err) return fail(err, 400);

  const result = await db.insert(schema.events).values({
    title,
    description,
    date,
    endDate: endDate || null,
    time: time || null,
    location: location || null,
    imageUrl: imageUrl || null,
    registrationUrl: regUrl || null,
    status: status || 'upcoming',
    eventType: eventType || 'public',
    allDay: allDay ?? false,
    color: color || 'blue',
    generationId: generationId || null,
    isFeatured: isFeatured ?? false,
    skpText: skpText || null,
    skpSubtitle: skpSubtitle || null,
    hasCertificate: hasCertificate ?? true,
    priceText: priceText || 'Gratis',
    speakersText: speakersText || null,
    categoryBadge: categoryBadge || 'WEBINAR',
    isLive: isLive ?? false,
  });

  return done('Event created successfully', { id: insertedId(result) });
}, 'Failed to create event');
