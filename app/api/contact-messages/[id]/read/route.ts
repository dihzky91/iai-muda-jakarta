import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { adminRoute, done } from '@/lib/api';

type Params = { id: string };

export const PATCH = adminRoute<Params>(['superadmin', 'admin'], async (_request, { params }) => {
  const { id } = await params;

  await db.update(schema.contactMessages).set({ isRead: true }).where(eq(schema.contactMessages.id, parseInt(id)));

  return done('Pesan ditandai sudah dibaca.');
}, 'Gagal memperbarui status pesan.');
