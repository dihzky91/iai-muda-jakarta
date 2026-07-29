import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, asc } from 'drizzle-orm';
import { ok, fail } from '@/lib/api';
import { COMMUNITY_CATEGORIES } from '@/src/components/member/community/categories';

export const revalidate = 0;

/**
 * GET /api/member/community/categories
 * Returns all active community categories for post creation & feed filtering.
 */
export async function GET() {
  try {
    const categories = await db
      .select()
      .from(schema.communityCategories)
      .where(eq(schema.communityCategories.isActive, true))
      .orderBy(asc(schema.communityCategories.sortOrder));

    if (categories.length === 0) {
      return ok(COMMUNITY_CATEGORIES);
    }

    return ok(categories);
  } catch (err: any) {
    console.error('Failed to fetch community categories:', err);
    return ok(COMMUNITY_CATEGORIES);
  }
}
