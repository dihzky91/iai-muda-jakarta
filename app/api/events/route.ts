import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { desc } from 'drizzle-orm';
import { getUserFromRequest, requireRole } from '@/lib/auth';

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

export async function GET(request: NextRequest) {
  try {
    const events = await db.select().from(schema.events).orderBy(schema.events.date);
    return NextResponse.json({ success: true, data: events });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin', 'editor')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { title, description, date, time, location, imageUrl, registrationUrl, status, generationId } = await request.json();

    const err = validate({
      title:       { value: title,       type: 'string', minLen: 3, maxLen: 200,  label: 'Judul acara' },
      description: { value: description, type: 'string', minLen: 10,              label: 'Deskripsi' },
      date:        { value: date,        type: 'string', regex: /^\d{4}-\d{2}-\d{2}$/, label: 'Tanggal (format YYYY-MM-DD)' },
      ...(status ? { status: { value: status, enum: ['upcoming', 'ongoing', 'completed'], label: 'Status' } } : {}),
    });
    if (err) return NextResponse.json({ success: false, message: err }, { status: 400 });

    const result = await db.insert(schema.events).values({
      title,
      description,
      date,
      time: time || null,
      location: location || null,
      imageUrl: imageUrl || null,
      registrationUrl: registrationUrl || null,
      status: status || 'upcoming',
      generationId: generationId || null,
    });

    return NextResponse.json({ success: true, message: 'Event created successfully', id: (result as any).insertId });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to create event' }, { status: 500 });
  }
}
