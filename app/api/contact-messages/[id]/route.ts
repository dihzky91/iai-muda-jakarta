import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { adminRoute, done } from '@/lib/api';

type Params = { id: string };

export const DELETE = adminRoute<Params>(['superadmin', 'admin'], async (_request, { params }) => {
  const { id } = await params;

  await db.delete(schema.contactMessages).where(eq(schema.contactMessages.id, parseInt(id)));

  return done('Pesan dihapus.');
}, 'Gagal menghapus pesan.');
