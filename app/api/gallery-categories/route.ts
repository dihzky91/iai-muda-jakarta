import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, asc } from 'drizzle-orm';
import { getUserFromRequest, requireRole } from '@/lib/auth';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(schema.galleryCategories)
      .orderBy(asc(schema.galleryCategories.sortOrder), asc(schema.galleryCategories.id));
    return NextResponse.json({ success: true, data: rows });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin', 'editor')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { name, color, sortOrder } = await request.json();
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ success: false, message: 'Nama kategori minimal 2 karakter' }, { status: 400 });
    }

    const slug = slugify(name);

    // Cek duplikat name
    const existing = await db
      .select()
      .from(schema.galleryCategories)
      .where(eq(schema.galleryCategories.name, name.trim()))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: 'Nama kategori sudah ada' }, { status: 400 });
    }

    const result = await db.insert(schema.galleryCategories).values({
      name: name.trim(),
      slug,
      color: color || 'blue',
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 99,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil ditambahkan',
      id: (result as any).insertId,
      data: { id: (result as any).insertId, name: name.trim(), slug, color: color || 'blue', sortOrder: typeof sortOrder === 'number' ? sortOrder : 99, isActive: true },
    });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, message: 'Kategori sudah ada' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: err.message || 'Failed to create category' }, { status: 500 });
  }
}
