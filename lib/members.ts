import { and, eq, type SQL } from 'drizzle-orm';
import { db, schema } from './db';

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

/** `position` bisa null karena LEFT JOIN; konsumen mengharapkan string. */
export function normalizeMemberPosition<T extends { position: string | null }>(row: T) {
  return { ...row, position: row.position || '' };
}
