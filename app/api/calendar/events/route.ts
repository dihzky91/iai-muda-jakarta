/**
 * API Kalender Terpusat
 *
 * GET /api/calendar/events?from=YYYY-MM-DD&to=YYYY-MM-DD&scope=public|member|admin
 *
 * - scope=public  : event publik saja (eventType !== 'internal')
 * - scope=member  : semua event (publik + internal), tanpa auth check (filter di FE jika perlu)
 * - scope=admin   : semua event + tambahan data (perlu login admin)
 *
 * Return shape konsisten untuk 3 area (publik/admin/portal) sehingga
 * satu komponen CalendarGrid bisa dipakai ulang.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { and, gte, lte, or, eq } from 'drizzle-orm';
import { getUserFromRequest, requireAdmin } from '@/lib/auth';

export type CalendarEventType = {
  id: number;
  title: string;
  description: string;
  startDate: string;     // YYYY-MM-DD (alias date)
  endDate: string | null;
  allDay: boolean;
  time: string | null;
  location: string | null;
  imageUrl: string | null;
  registrationUrl: string | null;
  status: 'upcoming' | 'ongoing' | 'completed';
  eventType: 'public' | 'internal';
  color: string;
  generationId: number | null;
};

function normalize(row: any): CalendarEventType {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startDate: row.date,
    endDate: row.endDate ?? null,
    allDay: Boolean(row.allDay),
    time: row.time ?? null,
    location: row.location ?? null,
    imageUrl: row.imageUrl ?? null,
    registrationUrl: row.registrationUrl ?? null,
    status: row.status,
    eventType: row.eventType,
    color: row.color || 'blue',
    generationId: row.generationId ?? null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');         // YYYY-MM-DD
    const to = searchParams.get('to');             // YYYY-MM-DD
    const scope = (searchParams.get('scope') || 'public').toLowerCase();

    // Validasi scope
    if (!['public', 'member', 'admin'].includes(scope)) {
      return NextResponse.json(
        { success: false, message: 'scope harus salah satu dari: public, member, admin' },
        { status: 400 }
      );
    }

    // Admin scope butuh login admin
    if (scope === 'admin') {
      const user = getUserFromRequest(request);
      if (!requireAdmin(user)) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      }
    }

    // Bangun kondisi WHERE
    const conditions: any[] = [];
    if (from) conditions.push(gte(schema.events.date, from));
    if (to) conditions.push(lte(schema.events.date, to));

    // Untuk public, exclude event internal
    if (scope === 'public') {
      conditions.push(eq(schema.events.eventType, 'public'));
    }

    // Query
    let rows: any[];
    if (conditions.length > 0) {
      rows = await db
        .select()
        .from(schema.events)
        .where(and(...conditions))
        .orderBy(schema.events.date, schema.events.time);
    } else {
      rows = await db
        .select()
        .from(schema.events)
        .orderBy(schema.events.date, schema.events.time);
    }

    // Untuk public, double-check exclude internal (safety)
    let data = rows.map(normalize);
    if (scope === 'public') {
      data = data.filter((e) => e.eventType !== 'internal');
    }

    return NextResponse.json({ success: true, data, scope });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
