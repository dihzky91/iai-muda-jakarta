import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { selectMembers, normalizeMemberPosition } from '@/lib/members';
import type { Generation, Member, Settings } from '@/src/types';
import OrganizationalStructure from '@/src/components/OrganizationalStructure';
import type { Metadata } from 'next';

/**
 * Halaman kepengurusan di-cache 5 menit (ISR), konsisten dengan homepage.
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
    if (retries > 0 && (err?.cause?.code === 'ECONNRESET' || err?.message?.includes('ECONNRESET'))) {
      await new Promise(r => setTimeout(r, delayMs));
      return fetchWithRetry(fn, retries - 1, delayMs * 2);
    }
    throw err;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Kepengurusan — IAI Muda DKI Jakarta',
    description: 'Struktur kepengurusan dan anggota komite IAI Muda Wilayah DKI Jakarta periode aktif.',
    alternates: {
      canonical: '/struktur',
    },
    openGraph: {
      title: 'Kepengurusan — IAI Muda DKI Jakarta',
      description: 'Struktur kepengurusan dan anggota komite IAI Muda Wilayah DKI Jakarta.',
      url: '/struktur',
    },
  };
}

export default async function StrukturPage() {
  try {
    const [settingsRows, members, generations] = await Promise.all([
      fetchWithRetry(() =>
        db.select().from(schema.settings).where(eq(schema.settings.id, 1)).limit(1)
      ),
      fetchWithRetry(() => selectMembers({ publicOnly: true })),
      fetchWithRetry(() =>
        db.select().from(schema.generations).orderBy(schema.generations.id)
      ),
    ]);

    const settings = settingsRows[0];

    if (!settings) {
      return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
          <p className="text-slate-600">Data tidak tersedia.</p>
        </div>
      );
    }

    const membersWithPos = members.map(m => serialize(normalizeMemberPosition(m)));

    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <OrganizationalStructure
            generations={serialize(generations) as unknown as Generation[]}
            members={membersWithPos as unknown as Member[]}
            settings={serialize(settings) as unknown as Settings}
          />
        </main>
      </div>
    );
  } catch (err) {
    console.error('Failed to fetch data for struktur:', err);
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <p className="text-slate-600">Terjadi kesalahan saat memuat data.</p>
      </div>
    );
  }
}
