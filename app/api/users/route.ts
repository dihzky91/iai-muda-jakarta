import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';
import { adminRoute, fail, ok, done } from '@/lib/api';

export const GET = adminRoute(['superadmin'], async () => {
  const users = await db
    .select({ id: schema.users.id, username: schema.users.username, role: schema.users.role, createdAt: schema.users.createdAt })
    .from(schema.users)
    .orderBy(schema.users.createdAt);
  return ok(users);
}, 'Failed to fetch users');

export const POST = adminRoute(['superadmin'], async (request) => {
  const { username, password, role } = await request.json();
  if (!username || !password || !role) {
    return fail('username, password, and role are required', 400);
  }
  if (!['superadmin', 'admin', 'editor'].includes(role)) {
    return fail('Invalid role', 400);
  }

  const existing = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
  if (existing.length > 0) {
    return fail('Username sudah digunakan', 409);
  }

  const passwordHash = await hashPassword(password);
  const result = await db.insert(schema.users).values({ username, passwordHash, role });
  return done('User created', { id: (result as any).insertId });
}, 'Failed to create user');
