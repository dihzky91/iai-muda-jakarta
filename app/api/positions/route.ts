import { db, schema, insertedId } from '@/lib/db';
import { adminRoute, publicRoute, fail, ok, done } from '@/lib/api';

export const GET = publicRoute(async () => {
  const positions = await db.select().from(schema.positions).orderBy(schema.positions.sortOrder);
  return ok(positions);
}, 'Failed to fetch positions');

export const POST = adminRoute(['superadmin'], async (request) => {
  const { name, category, sortOrder } = await request.json();

  if (!name || !category) {
    return fail('Missing required fields', 400);
  }

  const result = await db.insert(schema.positions).values({
    name,
    category,
    sortOrder: sortOrder || 0,
  });

  return done('Position created successfully', { id: insertedId(result) });
}, 'Failed to create position');
