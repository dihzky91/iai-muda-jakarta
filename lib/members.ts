import { and, eq, type SQL } from 'drizzle-orm';
import { db, schema, insertedId } from './db';

/**
 * Query anggota + nama jabatan, dipakai bersama oleh homepage dan
 * GET /api/members.
 *
 * Sebelumnya blok `.select({...15 kolom}).leftJoin(...)` ini ditulis tiga kali:
 * dua kali di route (cabang admin dan non-admin) dan sekali lagi di app/page.tsx.
 * Ketiganya harus diubah barengan setiap ada kolom baru — dan cabang non-admin
 * sempat dipaksa lolos type check dengan `as any`.
 */

/** Kolom yang diekspos untuk daftar anggota. Satu definisi, satu tempat ubah. */
export const memberListColumns = {
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
} as const;

export type MemberListRow = {
  [K in keyof typeof memberListColumns]: (typeof memberListColumns)[K]['_']['data'];
};

export interface MemberListFilters {
  /** Batasi ke satu generasi. */
  generationId?: number;
  /** Hanya anggota yang ditandai tampil publik. Wajib untuk pengunjung non-admin. */
  publicOnly?: boolean;
}

/**
 * Bangun query daftar anggota. Kondisi dirakit sebagai array lalu digabung
 * sekali di akhir, jadi tidak perlu percabangan builder yang digandakan.
 */
export function selectMembers(filters: MemberListFilters = {}) {
  const conditions: SQL[] = [];

  if (filters.generationId !== undefined) {
    conditions.push(eq(schema.members.generationId, filters.generationId));
  }
  if (filters.publicOnly) {
    conditions.push(eq(schema.members.showPublic, true));
  }

  return db
    .select(memberListColumns)
    .from(schema.members)
    .leftJoin(schema.positions, eq(schema.members.positionId, schema.positions.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(schema.members.id);
}

/** Ambil satu anggota beserta nama jabatannya. */
export function selectMemberById(id: number) {
  return db
    .select(memberListColumns)
    .from(schema.members)
    .leftJoin(schema.positions, eq(schema.members.positionId, schema.positions.id))
    .where(eq(schema.members.id, id))
    .limit(1);
}

/** `position` bisa null karena LEFT JOIN; konsumen mengharapkan string. */
export function normalizeMemberPosition<T extends { position: string | null }>(row: T) {
  return { ...row, position: row.position || '' };
}

/**
 * Cari id jabatan berdasarkan nama, buat baru kalau belum ada.
 *
 * Sebelumnya fungsi ini disalin identik di POST /api/members dan
 * PUT /api/members/[id].
 *
 * CATATAN: SELECT-lalu-INSERT ini tidak aman terhadap balapan — `positions.name`
 * tidak punya unique constraint, jadi dua request bersamaan dengan nama jabatan
 * sama bisa menghasilkan dua baris kembar. Dampaknya kosmetik (tiap anggota
 * tetap menunjuk positionId masing-masing), tapi perlu unique index untuk
 * benar-benar tertutup.
 */
export async function resolvePositionId(
  positionName: string | undefined,
  divisionName: string | undefined
): Promise<number | null> {
  if (!positionName) return null;
  const nameTrimmed = positionName.trim();
  if (!nameTrimmed) return null;

  const matched = await db
    .select()
    .from(schema.positions)
    .where(eq(schema.positions.name, nameTrimmed))
    .limit(1);
  if (matched.length > 0) {
    return matched[0].id;
  }

  const result = await db.insert(schema.positions).values({
    name: nameTrimmed,
    category: divisionName || 'Lainnya',
    sortOrder: 100,
  });
  return insertedId(result);
}
