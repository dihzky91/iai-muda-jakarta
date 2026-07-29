import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';
import { ok, fail } from '@/lib/api';

/**
 * PUT /api/admin/community/categories/[id]
 * Update category details, sort order, or active status.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request as any);
    if (!user || user.type !== 'admin') {
      return fail('Unauthorized', 403);
    }

    const resolvedParams = await params;
    const catId = parseInt(resolvedParams.id, 10);
    if (isNaN(catId)) return fail('ID kategori tidak valid', 400);

    const body = await request.json();
    const { slug, hashtag, label, description, badgeClass, activeTabClass, sortOrder, isActive } = body;

    const updateData: Record<string, any> = {};

    if (slug) updateData.slug = slug.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (hashtag) updateData.hashtag = hashtag.trim().startsWith('#') ? hashtag.trim() : `#${hashtag.trim()}`;
    if (label) updateData.label = label.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (badgeClass) updateData.badgeClass = badgeClass.trim();
    if (activeTabClass) updateData.activeTabClass = activeTabClass.trim();
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    await db
      .update(schema.communityCategories)
      .set(updateData)
      .where(eq(schema.communityCategories.id, catId));

    return ok({ id: catId }, { message: 'Kategori berhasil diperbarui' });
  } catch (err: any) {
    console.error('Admin update category error:', err);
    return fail('Gagal memperbarui kategori', 500);
  }
}

/**
 * DELETE /api/admin/community/categories/[id]
 * Delete a category by ID.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request as any);
    if (!user || user.type !== 'admin') {
      return fail('Unauthorized', 403);
    }

    const resolvedParams = await params;
    const catId = parseInt(resolvedParams.id, 10);
    if (isNaN(catId)) return fail('ID kategori tidak valid', 400);

    await db
      .delete(schema.communityCategories)
      .where(eq(schema.communityCategories.id, catId));

    return ok({ id: catId }, { message: 'Kategori berhasil dihapus' });
  } catch (err: any) {
    console.error('Admin delete category error:', err);
    return fail('Gagal menghapus kategori', 500);
  }
}
