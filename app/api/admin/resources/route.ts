import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resources } from '@/db/schema';
import { eq, asc, desc } from 'drizzle-orm';
import { adminRoute, ok, fail } from '@/lib/api';

/**
 * GET /api/admin/resources?category=onboarding
 * Fetch resources for admin management
 */
export const GET = adminRoute(['superadmin', 'admin', 'editor'], async (request) => {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'onboarding';

  const items = await db
    .select()
    .from(resources)
    .where(eq(resources.category, category))
    .orderBy(asc(resources.sortOrder), desc(resources.createdAt));

  return ok(items);
}, 'Failed to fetch resources');

/**
 * POST /api/admin/resources
 * Create a new resource document
 */
export const POST = adminRoute(['superadmin', 'admin', 'editor'], async (request, _context, user) => {
  const body = await request.json();
  const {
    title,
    description,
    fileUrl,
    fileName,
    fileType,
    fileSize,
    category = 'onboarding',
    subcategory,
    visibility = 'pengurus',
    sortOrder = 0,
    isActive = true,
  } = body;

  if (!title || !fileUrl) {
    return fail('Title and fileUrl are required fields', 400);
  }

  const [inserted] = await db
    .insert(resources)
    .values({
      title,
      description: description || null,
      fileUrl,
      fileName: fileName || null,
      fileType: fileType || null,
      fileSize: fileSize ? Number(fileSize) : null,
      category,
      subcategory: subcategory || null,
      visibility,
      sortOrder: Number(sortOrder) || 0,
      downloadCount: 0,
      uploadedBy: user.userId,
      isActive: Boolean(isActive),
    })
    .$returningId();

  const [createdResource] = await db
    .select()
    .from(resources)
    .where(eq(resources.id, inserted.id));

  return NextResponse.json({
    success: true,
    message: 'Resource document created successfully',
    data: createdResource,
  }, { status: 201 });
}, 'Failed to create resource');
