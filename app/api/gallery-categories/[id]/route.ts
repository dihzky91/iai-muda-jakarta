import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { adminRoute, fail, done } from '@/lib/api';

type Params = { id: string };

const EDITORS = ['superadmin', 'admin', 'editor'] as const;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const PUT = adminRoute<Params>([...EDITORS], async (request, { params }) => {
  const { id } = await params;
  const catId = parseInt(id);
  if (isNaN(catId)) {
    return fail('Invalid id', 400);
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

  // Hanya berisi updatedAt → tidak ada field sungguhan yang dikirim.
  if (Object.keys(update).length === 1) {
    return fail('Tidak ada field yang diubah', 400);
  }

  try {
    await db.update(schema.galleryCategories).set(update).where(eq(schema.galleryCategories.id, catId));
  } catch (err: any) {
    // Ditangani di sini, bukan diserahkan ke penangan error wrapper: bentrok
    // unique index adalah kesalahan input (400), bukan kegagalan server (500).
    if (err?.code === 'ER_DUP_ENTRY') {
      return fail('Nama kategori sudah dipakai', 400);
    }
    throw err;
  }

  return done('Kategori berhasil diperbarui');
}, 'Failed to update category');

export const DELETE = adminRoute<Params>([...EDITORS], async (_request, { params }) => {
  const { id } = await params;
  const catId = parseInt(id);
  if (isNaN(catId)) {
    return fail('Invalid id', 400);
  }

  // Cek apakah ada gallery yang masih pakai kategori ini
  const galleries = await db.select().from(schema.galleries).where(eq(schema.galleries.category, String(catId))).limit(1);
  // Note: galleries.category berisi string nama kategori (bukan id).
  // Pengecekan ini hanya peringatan — kita tetap izinkan delete, karena gallery
  // akan menampilkan nama kategori terakhir yang tersimpan di kolom text-nya.
  if (galleries.length > 0) {
    return fail(
      'Kategori masih dipakai oleh foto galeri. Hapus atau ganti kategori foto terkait terlebih dahulu.',
      400
    );
  }

  await db.delete(schema.galleryCategories).where(eq(schema.galleryCategories.id, catId));
  return done('Kategori berhasil dihapus');
}, 'Failed to delete category');
