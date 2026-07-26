import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { adminRoute, publicRoute, fail, ok, done } from '@/lib/api';

type Params = { id: string };

export const GET = publicRoute<Params>(async (_request, { params }) => {
  const { id } = await params;
  const generation = await db.select().from(schema.generations).where(eq(schema.generations.id, parseInt(id))).limit(1);
  if (!generation.length) {
    return fail('Generation not found', 404);
  }
  return ok(generation[0]);
}, 'Failed to fetch generation');

export const PUT = adminRoute<Params>(['superadmin'], async (request, { params }) => {
  const { id } = await params;
  const { name, years, isActive, description } = await request.json();
  const genId = parseInt(id);

  // Hanya boleh ada satu generasi aktif — nonaktifkan yang lain dulu.
  if (isActive === true) {
    await db.update(schema.generations).set({ isActive: false });
  }

  await db.update(schema.generations).set({
    name: name || undefined,
    years: years || undefined,
    isActive: isActive !== undefined ? isActive : undefined,
    description: description || undefined,
  }).where(eq(schema.generations.id, genId));

  return done('Generation updated successfully');
}, 'Failed to update generation');

export const DELETE = adminRoute<Params>(['superadmin'], async (_request, { params }) => {
  const { id } = await params;

  await db.delete(schema.generations).where(eq(schema.generations.id, parseInt(id)));

  return done('Generation deleted successfully');
}, 'Failed to delete generation');
