import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resources } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { adminRoute, ok, fail } from '@/lib/api';

type Params = { id: string };

/**
 * PUT /api/admin/resources/[id]
 * Update resource document
 */
export const PUT = adminRoute<Params>(['superadmin', 'admin', 'editor'], async (request, context) => {
  const { id } = await context.params;
  const resourceId = parseInt(id);

  if (isNaN(resourceId)) {
    return fail('Invalid resource ID', 400);
  }

  const body = await request.json();
  const {
    title,
    description,
    fileUrl,
    fileName,
    fileType,
    fileSize,
    category,
    subcategory,
    visibility,
    sortOrder,
    isActive,
  } = body;

  const [existing] = await db
    .select()
    .from(resources)
    .where(eq(resources.id, resourceId))
    .limit(1);

  if (!existing) {
    return fail('Resource not found', 404);
  }

  await db
    .update(resources)
    .set({
      title: title !== undefined ? title : existing.title,
      description: description !== undefined ? (description || null) : existing.description,
      fileUrl: fileUrl !== undefined ? fileUrl : existing.fileUrl,
      fileName: fileName !== undefined ? (fileName || null) : existing.fileName,
      fileType: fileType !== undefined ? (fileType || null) : existing.fileType,
      fileSize: fileSize !== undefined ? (fileSize ? Number(fileSize) : null) : existing.fileSize,
      category: category !== undefined ? category : existing.category,
      subcategory: subcategory !== undefined ? (subcategory || null) : existing.subcategory,
      visibility: visibility !== undefined ? visibility : existing.visibility,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : existing.sortOrder,
      isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      updatedAt: new Date(),
    })
    .where(eq(resources.id, resourceId));

  const [updated] = await db
    .select()
    .from(resources)
    .where(eq(resources.id, resourceId));

  return ok(updated, { message: 'Resource updated successfully' });
}, 'Failed to update resource');

/**
 * DELETE /api/admin/resources/[id]
 * Delete resource document
 */
export const DELETE = adminRoute<Params>(['superadmin', 'admin', 'editor'], async (_request, context) => {
  const { id } = await context.params;
  const resourceId = parseInt(id);

  if (isNaN(resourceId)) {
    return fail('Invalid resource ID', 400);
  }

  const [existing] = await db
    .select()
    .from(resources)
    .where(eq(resources.id, resourceId))
    .limit(1);

  if (!existing) {
    return fail('Resource not found', 404);
  }

  await db
    .delete(resources)
    .where(eq(resources.id, resourceId));

  return ok({ id: resourceId }, { message: 'Resource deleted successfully' });
}, 'Failed to delete resource');
