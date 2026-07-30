import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { like, or, eq, and, desc } from 'drizzle-orm';
import { ok, fail } from '@/lib/api';
import { getPersonKey } from '@/lib/member-helpers';

/**
 * GET /api/member/community/search-members?q=
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    const conditions = [eq(schema.members.isActive, true)];

    if (query.length > 0) {
      const searchTerm = `%${query}%`;
      conditions.push(
        or(
          like(schema.members.name, searchTerm),
          like(schema.members.email, searchTerm),
          like(schema.members.division, searchTerm)
        )!
      );
    }

    // Fetch member records with position info, joined with member_accounts so ONLY members with portal accounts appear
    const rawMembers = await db
      .select({
        id: schema.members.id,
        fullName: schema.members.name,
        email: schema.members.email,
        division: schema.members.division,
        profileImagePath: schema.members.imageUrl,
        generationId: schema.members.generationId,
        positionName: schema.positions.name,
      })
      .from(schema.members)
      .innerJoin(
        schema.memberAccounts,
        and(
          eq(schema.members.id, schema.memberAccounts.memberId),
          eq(schema.memberAccounts.isActive, true)
        )
      )
      .leftJoin(schema.positions, eq(schema.members.positionId, schema.positions.id))
      .where(and(...conditions))
      .orderBy(desc(schema.members.generationId), schema.members.name);

    // Deduplicate by person (email-first, name-fallback) to keep only the latest generation record per member
    const deduplicatedMap = new Map<string, {
      id: number;
      fullName: string;
      roleTitle: string | null;
      division: string | null;
      profileImagePath: string | null;
    }>();

    for (const member of rawMembers) {
      const key = getPersonKey({ email: member.email, name: member.fullName });
      if (!deduplicatedMap.has(key)) {
        const roleTitle = member.positionName || member.division || 'Anggota IAI Muda';
        deduplicatedMap.set(key, {
          id: member.id,
          fullName: member.fullName,
          roleTitle,
          division: member.division,
          profileImagePath: member.profileImagePath,
        });
      }
    }

    const deduplicatedList = Array.from(deduplicatedMap.values()).slice(0, 8);

    return ok(deduplicatedList);
  } catch (error: any) {
    console.error('Error searching members for mention:', error);
    return fail('Gagal mencari anggota', 500);
  }
}
