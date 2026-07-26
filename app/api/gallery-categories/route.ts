import { db, schema, insertedId } from '@/lib/db';
import { eq, asc } from 'drizzle-orm';
import { adminRoute, publicRoute, fail, ok } from '@/lib/api';
import { NextResponse } from 'next/server';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const GET = publicRoute(async () => {
  const rows = await db
    .select()
    .from(schema.galleryCategories)
    .orderBy(asc(schema.galleryCategories.sortOrder), asc(schema.galleryCategories.id));
  return ok(rows);
}, 'Failed to fetch categories');

export const POST = adminRoute(['superadmin', 'admin', 'editor'], async (request) => {
  const { name, color, sortOrder } = await request.json();
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return fail('Nama kategori minimal 2 karakter', 400);
  }

  const slug = slugify(name);

  // Cek duplikat name
  const existing = await db
    .select()
    .from(schema.galleryCategories)
    .where(eq(schema.galleryCategories.name, name.trim()))
    .limit(1);
  if (existing.length > 0) {
    return fail('Nama kategori sudah ada', 400);
  }

  const values = {
    name: name.trim(),
    slug,
    color: color || 'blue',
    sortOrder: typeof sortOrder === 'number' ? sortOrder : 99,
    isActive: true,
  };

  let insertId: number;
  try {
    const result = await db.insert(schema.galleryCategories).values(values);
    insertId = insertedId(result);
  } catch (err: any) {
    // Ditangani di sini, bukan diserahkan ke penangan error wrapper: bentrok
    // unique index adalah kesalahan input (400), bukan kegagalan server (500).
    if (err?.code === 'ER_DUP_ENTRY') {
      return fail('Kategori sudah ada', 400);
    }
    throw err;
  }

  return NextResponse.json({
    success: true,
    message: 'Kategori berhasil ditambahkan',
    id: insertId,
    data: { id: insertId, ...values },
  });
}, 'Failed to create category');
