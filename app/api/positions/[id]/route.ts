import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { adminRoute, publicRoute, fail, ok, done } from '@/lib/api';

type Params = { id: string };

export const GET = publicRoute<Params>(async (_request, { params }) => {
  const { id } = await params;
  const position = await db.select().from(schema.positions).where(eq(schema.positions.id, parseInt(id))).limit(1);
  if (!position.length) {
    return fail('Position not found', 404);
  }
  return ok(position[0]);
}, 'Failed to fetch position');

export const PUT = adminRoute<Params>(['superadmin'], async (request, { params }) => {
  const { id } = await params;
  const { name, category, sortOrder } = await request.json();

  await db.update(schema.positions).set({
    name: name || undefined,
    category: category || undefined,
    sortOrder: sortOrder !== undefined ? sortOrder : undefined,
  }).where(eq(schema.positions.id, parseInt(id)));

  return done('Position updated successfully');
}, 'Failed to update position');

export const DELETE = adminRoute<Params>(['superadmin'], async (_request, { params }) => {
  const { id } = await params;

  await db.delete(schema.positions).where(eq(schema.positions.id, parseInt(id)));

  return done('Position deleted successfully');
}, 'Failed to delete position');
