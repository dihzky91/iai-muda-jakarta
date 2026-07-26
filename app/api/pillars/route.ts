import { db, schema, insertedId } from '@/lib/db';
import { adminRoute, publicRoute, fail, ok, done } from '@/lib/api';

export const GET = publicRoute(async () => {
  const pillars = await db.select().from(schema.pillars).orderBy(schema.pillars.sortOrder);
  return ok(pillars);
}, 'Failed to fetch pillars');

export const POST = adminRoute(['superadmin', 'admin'], async (request) => {
  const { title, description, iconName, sortOrder } = await request.json();
  if (!title || !description) {
    return fail('Missing required fields', 400);
  }

  const result = await db.insert(schema.pillars).values({
    title,
    description,
    iconName: iconName || 'Shield',
    sortOrder: sortOrder || 0,
  });

  return done('Pillar created successfully', { id: insertedId(result) });
}, 'Failed to create pillar');
