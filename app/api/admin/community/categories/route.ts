import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { asc, eq } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';
import { ok, fail } from '@/lib/api';

export const revalidate = 0;

/**
 * GET /api/admin/community/categories
 * Returns all categories (active & inactive) for Admin CMS management.
 */
export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request as any);
    if (!user || user.type !== 'admin') {
      return fail('Unauthorized', 403);
    }

    const categories = await db
      .select()
      .from(schema.communityCategories)
      .orderBy(asc(schema.communityCategories.sortOrder));

    return ok(categories);
  } catch (err: any) {
    console.error('Admin fetch categories error:', err);
    return fail('Gagal mengambil daftar kategori', 500);
  }
}

/**
 * POST /api/admin/community/categories
 * Create a new category from Admin CMS.
 */
export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request as any);
    if (!user || user.type !== 'admin') {
      return fail('Unauthorized', 403);
    }

    const body = await request.json();
    const { slug, hashtag, label, description, badgeClass, activeTabClass, sortOrder = 0, isActive = true } = body;

    if (!slug || !hashtag || !label) {
      return fail('Slug, Hashtag, dan Label kategori wajib diisi', 400);
    }

    // Clean slug and hashtag
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const cleanHashtag = hashtag.trim().startsWith('#') ? hashtag.trim() : `#${hashtag.trim()}`;

    // Check duplicate slug
    const [existing] = await db
      .select({ id: schema.communityCategories.id })
      .from(schema.communityCategories)
      .where(eq(schema.communityCategories.slug, cleanSlug))
      .limit(1);

    if (existing) {
      return fail(`Kategori dengan slug '${cleanSlug}' sudah ada`, 400);
    }

    const [result] = await db.insert(schema.communityCategories).values({
      slug: cleanSlug,
      hashtag: cleanHashtag,
      label: label.trim(),
      description: description?.trim() || null,
      badgeClass: badgeClass?.trim() || 'bg-slate-100 text-slate-700 border-slate-200',
      activeTabClass: activeTabClass?.trim() || 'bg-slate-800 text-white',
      sortOrder: Number(sortOrder) || 0,
      isActive: Boolean(isActive),
    });

    return ok({ id: (result as any).insertId, slug: cleanSlug }, { message: 'Kategori berhasil ditambahkan' });
  } catch (err: any) {
    console.error('Admin create category error:', err);
    return fail(err.message || 'Gagal menambahkan kategori', 500);
  }
}
