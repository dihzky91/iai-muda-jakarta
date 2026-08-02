import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { selectMembers } from '@/lib/members';
import { selectActivePartners } from '@/lib/partners';
import type { Settings, Event } from '@/src/types';
import HeroSection from '@/src/components/home/HeroSection';
import FeaturedEventSection from '@/src/components/home/FeaturedEventSection';
import UpcomingEventsSection from '@/src/components/home/UpcomingEventsSection';
import PillarsSection from '@/src/components/home/PillarsSection';
import ContactSection from '@/src/components/home/ContactSection';
import BrandFooter from '@/src/components/home/BrandFooter';

/**
 * Halaman ini di-cache 5 menit (ISR), bukan `force-dynamic`.
 * Sebelumnya setiap pengunjung memicu 7 query ke TiDB.
 *
 * Konsekuensi: perubahan dari CMS baru tampil maksimal 5 menit kemudian.
 * Kalau butuh langsung tampil, panggil `revalidatePath('/')` dari route
 * handler CMS setelah data disimpan.
 */
export const revalidate = 300;

/** Bentuk sebuah tipe setelah setiap Date di dalamnya jadi string ISO. */
type Serialized<T> =
  T extends Date ? string
  : T extends (infer U)[] ? Serialized<U>[]
  : T extends object ? { [K in keyof T]: Serialized<T[K]> }
  : T;

/**
 * Ubah baris hasil query jadi objek polos yang aman dikirim ke client
 * component (Date → string ISO).
 *
 * Sebelumnya bertanda tangan `(obj: any): any`, jadi pemanggil tidak tahu
 * apa pun tentang hasilnya.
 */
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
    // Retry pada koneksi reset (TiDB serverless bisa pause saat idle)
    if (retries > 0 && (err?.cause?.code === 'ECONNRESET' || err?.message?.includes('ECONNRESET'))) {
      await new Promise(r => setTimeout(r, delayMs));
      return fetchWithRetry(fn, retries - 1, delayMs * 2);
    }
    throw err;
  }
}

export default async function HomePage() {
  try {
    // Homepage query: settings, events, pillars, members, partners, activeGen
    const [settingsRows, events, pillars, members, partners, activeGenRows] = await Promise.all([
      fetchWithRetry(() =>
        db.select().from(schema.settings).where(eq(schema.settings.id, 1)).limit(1)
      ),
      fetchWithRetry(() =>
        db.select().from(schema.events).orderBy(schema.events.date).limit(10)
      ),
      fetchWithRetry(() =>
        db.select().from(schema.pillars).orderBy(schema.pillars.sortOrder)
      ),
      fetchWithRetry(() => selectMembers({ publicOnly: true })),
      fetchWithRetry(() => selectActivePartners()),
      fetchWithRetry(() =>
        db.select().from(schema.generations).where(eq(schema.generations.isActive, true)).limit(1)
      ).catch(() => []),
    ]);

    const settings = settingsRows[0];

    if (!settings) {
      return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
          <p className="text-slate-600">Data tidak tersedia.</p>
        </div>
      );
    }

    // Filter featured events (ditandai isFeatured = true, atau fallback ke upcoming/ongoing terdekat)
    let featuredEvents = events.filter(e => e.isFeatured);
    if (featuredEvents.length === 0) {
      const fallback = events.filter(e => e.status === 'upcoming' || e.status === 'ongoing');
      featuredEvents = fallback.length > 0 ? fallback.slice(0, 3) : events.slice(0, 1);
    }

    // Exclude featured events dari list upcoming events agar tidak terduplikasi
    const featuredIds = new Set(featuredEvents.map(f => f.id));
    const upcomingEvents = events.filter(e => !featuredIds.has(e.id) && e.status !== 'completed');

    // Hitung member count, event count, partner count dan generation years
    const memberCount = members.length;
    const eventCount = events.length;
    const partnerCount = partners.length;
    const activeGenYears = activeGenRows[0]?.years || '2025-2026';

    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <HeroSection 
          memberCount={memberCount} 
          eventCount={eventCount}
          partnerCount={partnerCount}
          activeGenYears={activeGenYears} 
        />

        <div className="space-y-16 py-12">
          <FeaturedEventSection 
            events={serialize(featuredEvents) as unknown as Event[]} 
          />
          
          <UpcomingEventsSection 
            events={serialize(upcomingEvents) as unknown as Event[]} 
          />

          <PillarsSection 
            pillars={serialize(pillars)} 
          />
          
          <ContactSection 
            settings={serialize(settings) as unknown as Settings} 
          />
        </div>
        
        <BrandFooter 
          settings={serialize(settings) as unknown as Settings} 
        />
      </div>
    );
  } catch (err) {
    console.error('Failed to fetch data:', err);
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <p className="text-slate-600">Terjadi kesalahan saat memuat halaman.</p>
      </div>
    );
  }
}
