import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { like, or, eq, sql } from 'drizzle-orm';
import { ok, fail } from '@/lib/api';

/**
 * GET /api/member/community/search-members?q=
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query || query.trim().length === 0) {
      const defaultMembers = await db
        .select({
          id: schema.members.id,
          fullName: schema.members.name,
          roleTitle: schema.members.division,
          division: schema.members.division,
          profileImagePath: schema.members.imageUrl,
        })
        .from(schema.members)
        .limit(8);

      return ok(defaultMembers);
    }

    const searchTerm = `%${query.trim()}%`;

    const membersList = await db
      .select({
        id: schema.members.id,
        fullName: schema.members.name,
        roleTitle: schema.members.division,
        division: schema.members.division,
        profileImagePath: schema.members.imageUrl,
      })
      .from(schema.members)
      .where(
        or(
          like(schema.members.name, searchTerm),
          like(schema.members.email, searchTerm),
          like(schema.members.division, searchTerm)
        )
      )
      .limit(8);

    return ok(membersList);
  } catch (error: any) {
    console.error('Error searching members for mention:', error);
    return fail('Gagal mencari anggota', 500);
  }
}
