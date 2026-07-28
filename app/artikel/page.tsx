import { db, schema } from '@/lib/db';
import { ne, sql } from 'drizzle-orm';
import type { Article } from '@/src/types';
import ArticlesSection from '@/src/components/ArticlesSection';
import type { Metadata } from 'next';

/**
 * Halaman artikel di-cache 5 menit (ISR).
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
    title: 'Artikel & Opini — IAI Muda DKI Jakarta',
    description: 'Artikel, opini, dan insight dari para akuntan muda tentang perkembangan dunia akuntansi dan keuangan.',
    alternates: {
      canonical: '/artikel',
    },
    openGraph: {
      title: 'Artikel & Opini — IAI Muda DKI Jakarta',
      description: 'Artikel dan insight dari para akuntan muda.',
      url: '/artikel',
    },
  };
}

export default async function ArtikelPage() {
  try {
    // Pastikan kolom category ada di DB
    try {
      await db.execute(sql`ALTER TABLE articles ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'public'`);
    } catch (_e) {
      // Column already exists
    }

    // Hanya ambil artikel berstatus publik (bukan pengumuman internal)
    const articles = await fetchWithRetry(() =>
      db
        .select()
        .from(schema.articles)
        .where(ne(schema.articles.category, 'internal'))
        .orderBy(schema.articles.date)
    );

    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ArticlesSection articles={serialize(articles) as unknown as Article[]} />
        </main>
      </div>
    );
  } catch (err) {
    console.error('Failed to fetch articles:', err);
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <p className="text-slate-600">Terjadi kesalahan saat memuat artikel.</p>
      </div>
    );
  }
}
