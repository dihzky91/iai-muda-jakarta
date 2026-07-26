import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { selectMembers, normalizeMemberPosition } from '@/lib/members';
import type { Generation, Member, Event, Article, GalleryItem, Pillar } from '@/src/types';
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
        fetchWithRetry(() => selectMembers({ publicOnly: true })),
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

    const membersWithPos = members.map(m => serialize(normalizeMemberPosition(m)));
    const galleriesWithImages = galleries.map(g => ({
      ...serialize(g),
      images: g.images ? JSON.parse(g.images) : [],
    }));

    /**
     * Cast di bawah menandai batas nyata, bukan tipe yang malas: tipe klien di
     * `src/types.ts` sengaja lebih sempit daripada baris tabel — tidak memuat
     * createdAt/updatedAt, dan beberapa kolom nullable dinyatakan non-null di
     * sana. Menghilangkannya butuh fungsi pemetaan eksplisit per entitas
     * (baris DB → tipe klien), pekerjaan tersendiri yang mengubah bentuk data
     * yang dikirim ke komponen.
     */
    return (
      <HomeClient
        settings={serialize(settings)}
        pillars={serialize(pillars) as unknown as Pillar[]}
        events={serialize(events) as unknown as Event[]}
        members={membersWithPos as unknown as Member[]}
        generations={serialize(generations) as unknown as Generation[]}
        articles={serialize(articles) as unknown as Article[]}
        galleries={galleriesWithImages as unknown as GalleryItem[]}
      />
    );
  } catch (err) {
    console.error('Failed to fetch data:', err);
    return <HomeClient settings={null} pillars={[]} events={[]} members={[]} generations={[]} articles={[]} galleries={[]} />;
  }
}
