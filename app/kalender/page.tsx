import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import KalenderClient from './KalenderClient';
import type { CalendarEvent } from '@/src/components/calendar';

/**
 * Halaman kalender — server component dengan ISR 5 menit.
 *
 * Sebelumnya halaman ini client component yang fetch /api/calendar/events
 * lewat useEffect: setiap pengunjung = 1 API call = 1 query DB, tanpa cache.
 * Sekarang query dijalankan saat (re)build halaman, mengikuti pola /acara,
 * /artikel, /galeri, dan /struktur. Konsekuensi: event baru dari CMS tampil
 * maksimal 5 menit kemudian.
 */
export const revalidate = 300;

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 500): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries > 0 && (err?.cause?.code === 'ECONNRESET' || err?.message?.includes('ECONNRESET'))) {
      await new Promise(r => setTimeout(r, delayMs));
      return fetchWithRetry(fn, retries - 1, delayMs * 2);
    }
    throw err;
  }
}

/** Samakan bentuk data dengan response GET /api/calendar/events (normalize()). */
function normalize(row: typeof schema.events.$inferSelect): CalendarEvent {
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
    eventType: (row.eventType === 'internal' ? 'internal' : 'public') as 'public' | 'internal',
    color: row.color || 'blue',
    generationId: row.generationId ?? null,
  };
}

export const metadata: Metadata = {
  title: 'Kalender Acara — IAI Muda DKI Jakarta',
  description: 'Lihat agenda webinar, workshop, dan kegiatan IAI Muda Wilayah DKI Jakarta dalam tampilan kalender bulanan.',
  alternates: {
    canonical: '/kalender',
  },
  openGraph: {
    title: 'Kalender Acara — IAI Muda DKI Jakarta',
    description: 'Agenda lengkap kegiatan IAI Muda Wilayah DKI Jakarta dalam tampilan kalender.',
    url: '/kalender',
  },
};

export default async function KalenderPage() {
  try {
    // Scope public: exclude event internal (sama seperti route API).
    const rows = await fetchWithRetry(() =>
      db
        .select()
        .from(schema.events)
        .where(eq(schema.events.eventType, 'public'))
        .orderBy(schema.events.date, schema.events.time)
    );

    return <KalenderClient events={rows.map(normalize)} />;
  } catch (err) {
    console.error('Failed to fetch calendar events:', err);
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <p className="text-slate-600">Terjadi kesalahan saat memuat kalender acara.</p>
      </div>
    );
  }
}
