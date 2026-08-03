import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { adminRoute, publicRoute, fail, ok, done } from '@/lib/api';
import { revalidatePath } from 'next/cache';

type Params = { id: string };

export const GET = publicRoute<Params>(async (_request, { params }) => {
  const { id } = await params;
  const pillar = await db.select().from(schema.pillars).where(eq(schema.pillars.id, parseInt(id))).limit(1);
  if (!pillar.length) {
    return fail('Pillar not found', 404);
  }
  return ok(pillar[0]);
}, 'Failed to fetch pillar');

export const PUT = adminRoute<Params>(['superadmin', 'admin'], async (request, { params }) => {
  const { id } = await params;
  const { title, description, iconName, sortOrder } = await request.json();

  await db.update(schema.pillars).set({
    title: title || undefined,
    description: description || undefined,
    iconName: iconName || undefined,
    sortOrder: sortOrder !== undefined ? sortOrder : undefined,
  }).where(eq(schema.pillars.id, parseInt(id)));

  revalidatePath('/');
  return done('Pillar updated successfully');
}, 'Failed to update pillar');

export const DELETE = adminRoute<Params>(['superadmin', 'admin'], async (_request, { params }) => {
  const { id } = await params;

  await db.delete(schema.pillars).where(eq(schema.pillars.id, parseInt(id)));

  revalidatePath('/');
  return done('Pillar deleted successfully');
}, 'Failed to delete pillar');

