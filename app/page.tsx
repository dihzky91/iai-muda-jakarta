import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import HomeClient from './HomeClient';

/**
 * Halaman ini di-cache 5 menit (ISR), bukan `force-dynamic`.
 * Sebelumnya setiap pengunjung memicu 7 query ke TiDB.
 *
 * Konsekuensi: perubahan dari CMS baru tampil maksimal 5 menit kemudian.
 * Kalau butuh langsung tampil, panggil `revalidatePath('/')` dari route
 * handler CMS setelah data disimpan.
 */
export const revalidate = 300;

function serialize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(serialize);
  if (typeof obj === 'object') {
    const plain: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      plain[key] = serialize(val);
    }
    return plain;
  }
  return obj;
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
    // Ketujuh query saling independen — dijalankan paralel supaya latency
    // total = query paling lambat, bukan jumlah 7 round-trip berurutan.
    const [settingsRows, pillars, events, members, generations, articles, galleries] =
      await Promise.all([
        fetchWithRetry(() =>
          db.select().from(schema.settings).where(eq(schema.settings.id, 1)).limit(1)
        ),
        fetchWithRetry(() =>
          db.select().from(schema.pillars).orderBy(schema.pillars.sortOrder)
        ),
        fetchWithRetry(() =>
          db.select().from(schema.events).orderBy(schema.events.date)
        ),
        fetchWithRetry(() =>
          db
            .select({
              id: schema.members.id,
              generationId: schema.members.generationId,
              positionId: schema.members.positionId,
              name: schema.members.name,
              division: schema.members.division,
              university: schema.members.university,
              email: schema.members.email,
              imageUrl: schema.members.imageUrl,
              linkedinUrl: schema.members.linkedinUrl,
              bio: schema.members.bio,
              isActive: schema.members.isActive,
              showPublic: schema.members.showPublic,
              createdAt: schema.members.createdAt,
              updatedAt: schema.members.updatedAt,
              position: schema.positions.name,
            })
            .from(schema.members)
            .leftJoin(schema.positions, eq(schema.members.positionId, schema.positions.id))
            .where(eq(schema.members.showPublic, true))
            .orderBy(schema.members.id)
        ),
        fetchWithRetry(() =>
          db.select().from(schema.generations).orderBy(schema.generations.id)
        ),
        fetchWithRetry(() =>
          db.select().from(schema.articles).orderBy(schema.articles.date)
        ),
        fetchWithRetry(() =>
          db.select().from(schema.galleries).orderBy(schema.galleries.date)
        ),
      ]);

    const settings = settingsRows[0];

    if (!settings) {
      return <HomeClient settings={null} pillars={[]} events={[]} members={[]} generations={[]} articles={[]} galleries={[]} />;
    }

    const membersWithPos = members.map(m => ({ ...serialize(m), position: m.position || '' }));
    const galleriesWithImages = galleries.map(g => ({
      ...serialize(g),
      images: g.images ? JSON.parse(g.images) : [],
    }));

    return (
      <HomeClient
        settings={serialize(settings)}
        pillars={serialize(pillars) as any}
        events={serialize(events) as any}
        members={membersWithPos as any}
        generations={serialize(generations) as any}
        articles={serialize(articles) as any}
        galleries={galleriesWithImages as any}
      />
    );
  } catch (err) {
    console.error('Failed to fetch data:', err);
    return <HomeClient settings={null} pillars={[]} events={[]} members={[]} generations={[]} articles={[]} galleries={[]} />;
  }
}
