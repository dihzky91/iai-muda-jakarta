import { db, schema } from '@/lib/db';
import type { GalleryItem } from '@/src/types';
import GallerySection from '@/src/components/GallerySection';
import type { Metadata } from 'next';

/**
 * Halaman galeri di-cache 5 menit (ISR).
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
    title: 'Galeri Kegiatan — IAI Muda DKI Jakarta',
    description: 'Dokumentasi foto dan video kegiatan, webinar, dan workshop IAI Muda Wilayah DKI Jakarta.',
    alternates: {
      canonical: '/galeri',
    },
    openGraph: {
      title: 'Galeri Kegiatan — IAI Muda DKI Jakarta',
      description: 'Kilas balik momen seru dari berbagai kegiatan IAI Muda DKI Jakarta.',
      url: '/galeri',
    },
  };
}

export default async function GaleriPage() {
  try {
    const galleries = await fetchWithRetry(() =>
      db.select().from(schema.galleries).orderBy(schema.galleries.date)
    );

    const galleriesWithImages = galleries.map(g => ({
      ...serialize(g),
      images: g.images ? JSON.parse(g.images) : [],
    }));

    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <GallerySection galleryItems={galleriesWithImages as unknown as GalleryItem[]} />
        </main>
      </div>
    );
  } catch (err) {
    console.error('Failed to fetch galleries:', err);
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <p className="text-slate-600">Terjadi kesalahan saat memuat galeri.</p>
      </div>
    );
  }
}
