import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, and, or, like, desc } from 'drizzle-orm';
import { getUserFromRequest, requireMember } from '@/lib/auth';

/**
 * Directory API for member portal (internal access only).
 * Returns list of members with search & filter capabilities.
 *
 * Alumni status is DERIVED from generation's isActive flag:
 * - Active = member has at least one record in a generation where isActive = true
 * - Alumni = member only has records in generations where isActive = false
 *
 * Members with multiple generation records are grouped into one entry
 * (by email, or by name if email is null) showing their generation history.
 *
 * Query params:
 * - search: string (search by name or division)
 * - isAlumni: 'true' | 'false' (filter by derived alumni status)
 *
 * Returns safe fields: id, name, division, imageUrl, linkedinUrl,
 * isAlumni (derived), generations (history array), position.
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!requireMember(user)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const isAlumniFilter = searchParams.get('isAlumni');

    // Build conditions array — only filter by isActive member status
    const conditions = [eq(schema.members.isActive, true)];

    if (search) {
      conditions.push(
        or(
          like(schema.members.name, `%${search}%`),
          like(schema.members.division, `%${search}%`)
        )!
      );
    }

    // Fetch ALL member records (no isAlumni filter in SQL — we derive it)
    const rawMembers = await db
      .select({
        id: schema.members.id,
        name: schema.members.name,
        email: schema.members.email,
        division: schema.members.division,
        imageUrl: schema.members.imageUrl,
        linkedinUrl: schema.members.linkedinUrl,
        university: schema.members.university,
        generationId: schema.generations.id,
        generationName: schema.generations.name,
        generationYears: schema.generations.years,
        generationIsActive: schema.generations.isActive,
        positionId: schema.positions.id,
        positionName: schema.positions.name,
        positionCategory: schema.positions.category,
      })
      .from(schema.members)
      .leftJoin(schema.generations, eq(schema.members.generationId, schema.generations.id))
      .leftJoin(schema.positions, eq(schema.members.positionId, schema.positions.id))
      .where(and(...conditions))
      .orderBy(desc(schema.members.generationId), schema.members.name);

    // Group by email (or name if email is null) to merge multiple generation records
    const groupedMap = new Map<string, {
      id: number;
      name: string;
      division: string | null;
      university: string | null;
      imageUrl: string | null;
      linkedinUrl: string | null;
      generations: Array<{
        id: number;
        name: string;
        years: string;
        isActive: boolean;
      }>;
      position: {
        id: number;
        name: string;
        category: string;
      } | null;
    }>();

    for (const record of rawMembers) {
      // Use email as key if available, otherwise use name
      const key = record.email || record.name;

      const genInfo = record.generationId ? {
        id: record.generationId,
        name: record.generationName!,
        years: record.generationYears!,
        isActive: record.generationIsActive ?? false,
      } : null;

      if (!groupedMap.has(key)) {
        // New person entry
        groupedMap.set(key, {
          id: record.id,
          name: record.name,
          division: record.division,
          university: record.university,
          imageUrl: record.imageUrl,
          linkedinUrl: record.linkedinUrl,
          generations: genInfo ? [genInfo] : [],
          position: record.positionId ? {
            id: record.positionId,
            name: record.positionName!,
            category: record.positionCategory!,
          } : null,
        });
      } else {
        // Existing person — add generation to history
        const existing = groupedMap.get(key)!;
        if (genInfo) {
          // Avoid duplicate generations
          if (!existing.generations.some(g => g.id === genInfo.id)) {
            existing.generations.push(genInfo);
          }
        }
        // Update division/position/imageUrl/linkedinUrl to latest generation record
        // (records are ordered by generationId DESC, so first seen = latest)
        // Only update if current record has a higher generationId
        if (record.generationId && existing.generations.length > 0) {
          const maxGenId = Math.max(...existing.generations.map(g => g.id));
          if (record.generationId >= maxGenId) {
            existing.id = record.id;
            existing.division = record.division;
            existing.university = record.university;
            existing.imageUrl = record.imageUrl;
            existing.linkedinUrl = record.linkedinUrl;
            existing.position = record.positionId ? {
              id: record.positionId,
              name: record.positionName!,
              category: record.positionCategory!,
            } : null;
          }
        }
      }
    }

    // Convert to array and derive isAlumni
    let members = Array.from(groupedMap.values()).map(person => ({
      ...person,
      // Sort generations by id ascending for display (oldest first)
      generations: person.generations.sort((a, b) => a.id - b.id),
      // Derive isAlumni: true if member has NO active generation
      isAlumni: !person.generations.some(g => g.isActive),
    }));

    // Apply alumni filter (derived) in TypeScript
    if (isAlumniFilter === 'true') {
      members = members.filter(m => m.isAlumni);
    } else if (isAlumniFilter === 'false') {
      members = members.filter(m => !m.isAlumni);
    }

    // Sort: active members first, then by name
    members.sort((a, b) => {
      if (a.isAlumni !== b.isAlumni) return a.isAlumni ? 1 : -1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      success: true,
      data: members,
    });
  } catch (err: any) {
    console.error('[Member Directory API Error]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch directory' },
      { status: 500 }
    );
  }
}
