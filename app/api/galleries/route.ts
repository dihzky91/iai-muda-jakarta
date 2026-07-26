import { db, schema } from '@/lib/db';
import { adminRoute, publicRoute, fail, ok, done } from '@/lib/api';

export const GET = publicRoute(async () => {
  const rows = await db.select().from(schema.galleries).orderBy(schema.galleries.date);
  const galleries = rows.map(g => ({
    ...g,
    images: g.images ? JSON.parse(g.images) : [],
  }));
  return ok(galleries);
}, 'Failed to fetch galleries');

export const POST = adminRoute(['superadmin', 'admin', 'editor'], async (request) => {
  const { title, description, imageUrl, date, category, photographer, images } = await request.json();

  if (!title || !date) {
    return fail('Missing required fields', 400);
  }

  const result = await db.insert(schema.galleries).values({
    title,
    description: description || null,
    imageUrl: imageUrl || null,
    date,
    category: category || null,
    photographer: photographer || null,
    images: images ? JSON.stringify(images) : null,
  });

  return done('Gallery created successfully', { id: (result as any).insertId });
}, 'Failed to create gallery');
