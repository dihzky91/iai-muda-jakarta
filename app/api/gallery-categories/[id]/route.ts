import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin', 'editor')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const catId = parseInt(id);
    if (isNaN(catId)) {
      return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 });
    }

    const body = await request.json();
    const update: Record<string, any> = {};
    if (typeof body.name === 'string' && body.name.trim().length >= 2) {
      update.name = body.name.trim();
      update.slug = slugify(body.name);
    }
    if (typeof body.color === 'string') update.color = body.color;
    if (typeof body.sortOrder === 'number') update.sortOrder = body.sortOrder;
    if (typeof body.isActive === 'boolean') update.isActive = body.isActive;
    update.updatedAt = new Date();

    if (Object.keys(update).length === 1) {
      return NextResponse.json({ success: false, message: 'Tidak ada field yang diubah' }, { status: 400 });
    }

    await db.update(schema.galleryCategories).set(update).where(eq(schema.galleryCategories.id, catId));
    return NextResponse.json({ success: true, message: 'Kategori berhasil diperbarui' });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, message: 'Nama kategori sudah dipakai' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: err.message || 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin', 'editor')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const catId = parseInt(id);
    if (isNaN(catId)) {
      return NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 });
    }

    // Cek apakah ada gallery yang masih pakai kategori ini
    const galleries = await db.select().from(schema.galleries).where(eq(schema.galleries.category, String(catId))).limit(1);
    // Note: galleries.category berisi string nama kategori (bukan id).
    // Pengecekan ini hanya peringatan — kita tetap izinkan delete, karena gallery
    // akan menampilkan nama kategori terakhir yang tersimpan di kolom text-nya.
    if (galleries.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Kategori masih dipakai oleh foto galeri. Hapus atau ganti kategori foto terkait terlebih dahulu.',
      }, { status: 400 });
    }

    await db.delete(schema.galleryCategories).where(eq(schema.galleryCategories.id, catId));
    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to delete category' }, { status: 500 });
  }
}
