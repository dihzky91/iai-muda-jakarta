import { db, schema, insertedId } from '@/lib/db';
import { adminRoute, publicRoute, fail, ok, done } from '@/lib/api';

export const GET = publicRoute(async () => {
  const generations = await db.select().from(schema.generations).orderBy(schema.generations.id);
  return ok(generations);
}, 'Failed to fetch generations');

export const POST = adminRoute(['superadmin'], async (request) => {
  const { slug, name, years, isActive, description } = await request.json();

  if (!slug || !name || !years) {
    return fail('Missing required fields', 400);
  }

  const result = await db.insert(schema.generations).values({
    slug,
    name,
    years,
    isActive: isActive || false,
    description: description || null,
  });

  return done('Generation created successfully', { id: insertedId(result) });
}, 'Failed to create generation');
