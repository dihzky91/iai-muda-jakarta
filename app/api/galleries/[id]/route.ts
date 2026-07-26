import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { adminRoute, publicRoute, fail, ok, done } from '@/lib/api';

type Params = { id: string };

const EDITORS = ['superadmin', 'admin', 'editor'] as const;

export const GET = publicRoute<Params>(async (_request, { params }) => {
  const { id } = await params;
  const row = await db.select().from(schema.galleries).where(eq(schema.galleries.id, parseInt(id))).limit(1);
  if (!row.length) {
    return fail('Gallery not found', 404);
  }
  return ok({ ...row[0], images: row[0].images ? JSON.parse(row[0].images) : [] });
}, 'Failed to fetch gallery');

export const PUT = adminRoute<Params>([...EDITORS], async (request, { params }) => {
  const { id } = await params;
  const { title, description, imageUrl, date, category, photographer, images } = await request.json();

  await db.update(schema.galleries).set({
    title: title || undefined,
    description: description !== undefined ? description : undefined,
    imageUrl: imageUrl !== undefined ? imageUrl : undefined,
    date: date || undefined,
    category: category !== undefined ? category : undefined,
    photographer: photographer !== undefined ? photographer : undefined,
    images: images !== undefined ? JSON.stringify(images) : undefined,
  }).where(eq(schema.galleries.id, parseInt(id)));

  return done('Gallery updated successfully');
}, 'Failed to update gallery');

export const DELETE = adminRoute<Params>([...EDITORS], async (_request, { params }) => {
  const { id } = await params;

  await db.delete(schema.galleries).where(eq(schema.galleries.id, parseInt(id)));

  return done('Gallery deleted successfully');
}, 'Failed to delete gallery');
