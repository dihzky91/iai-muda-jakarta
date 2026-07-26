import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { memberRoute, fail, done } from '@/lib/api';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const POST = memberRoute(async (request, _context, user) => {
  const formData = await request.formData();
  const file = formData.get('image') as File;

  if (!file) {
    return fail('Tidak ada file yang diupload', 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return fail('Format file harus JPG, PNG, atau WebP', 400);
  }

  if (file.size > MAX_SIZE) {
    return fail('Ukuran file maksimal 5MB', 400);
  }

  const uploadsDir = join(process.cwd(), 'public', 'uploads', 'members');
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `member-${user.memberId}-${Date.now()}.${fileExt}`;

  await writeFile(join(uploadsDir, fileName), Buffer.from(await file.arrayBuffer()));

  const imageUrl = `/uploads/members/${fileName}`;
  await db
    .update(schema.members)
    .set({ imageUrl, updatedAt: new Date() })
    .where(eq(schema.members.id, user.memberId));

  return done('Foto profil berhasil diupload', { imageUrl });
}, 'Gagal upload foto');
