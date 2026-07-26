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
import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { and, gte, lte, eq } from 'drizzle-orm';
import { getUserFromRequest, requireAdmin } from '@/lib/auth';
import { publicRoute, fail } from '@/lib/api';

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

export const GET = publicRoute(async (request) => {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');         // YYYY-MM-DD
    const to = searchParams.get('to');             // YYYY-MM-DD
    const scope = (searchParams.get('scope') || 'public').toLowerCase();

    // Validasi scope
    if (!['public', 'member', 'admin'].includes(scope)) {
      return fail('scope harus salah satu dari: public, member, admin', 400);
    }

    // Admin scope butuh login admin
    if (scope === 'admin') {
      const user = getUserFromRequest(request);
      if (!requireAdmin(user)) {
        return fail('Unauthorized', 401);
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

    // Query — `where(undefined)` diabaikan Drizzle, jadi tidak perlu percabangan
    const rows = await db
      .select()
      .from(schema.events)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(schema.events.date, schema.events.time);

    // Scope public sudah difilter di WHERE di atas — tidak ada filter ulang di JS.
    const data = rows.map(normalize);

    // Bukan helper ok(): response ini juga membawa `scope`.
    return NextResponse.json({ success: true, data, scope });
}, 'Failed to fetch calendar events');
