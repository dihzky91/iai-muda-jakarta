import { Suspense } from 'react';
import { db, schema } from '@/lib/db';
import type { Event } from '@/src/types';
import EventsList from '@/src/components/EventsList';
import type { Metadata } from 'next';

/**
 * Halaman acara di-cache 5 menit (ISR).
 */
export const revalidate = 300;

type Serialized<T> =
  T extends Date ? string
  : T extends (infer U)[] ? Serialized<U>[]
  : T extends object ? { [K in keyof T]: Serialized<T[K]> }
  : T;

function serialize<T>(obj: T): Serialized<T> {
  if (obj === null || obj === undefined) return obj as Serialized<T>;
  if (obj instanceof Date) return obj.toISOString() as Serialized<T>;
  if (Array.isArray(obj)) return obj.map(serialize) as Serialized<T>;
  if (typeof obj === 'object') {
    const plain: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      plain[key] = serialize(val);
    }
    return plain as Serialized<T>;
  }
  return obj as Serialized<T>;
}

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

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Agenda & Webinar — IAI Muda DKI Jakarta',
    description: 'Daftar lengkap agenda webinar, workshop, dan kegiatan peningkatan kompetensi dari IAI Muda Wilayah DKI Jakarta.',
    alternates: {
      canonical: '/acara',
    },
    openGraph: {
      title: 'Agenda & Webinar — IAI Muda DKI Jakarta',
      description: 'Tingkatkan kompetensi profesional melalui webinar dan workshop berkualitas.',
      url: '/acara',
    },
  };
}

export default async function AcaraPage() {
  try {
    const events = await fetchWithRetry(() =>
      db.select().from(schema.events).orderBy(schema.events.date)
    );

    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Suspense fallback={
            <div className="py-12 text-center text-slate-500">Memuat agenda acara...</div>
          }>
            <EventsList events={serialize(events) as unknown as Event[]} />
          </Suspense>
        </main>
      </div>
    );
  } catch (err) {
    console.error('Failed to fetch events:', err);
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <p className="text-slate-600">Terjadi kesalahan saat memuat acara.</p>
      </div>
    );
  }
}
