import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';
import { adminRoute, fail, done } from '@/lib/api';

type Params = { id: string };

export const PUT = adminRoute<Params>(['superadmin'], async (request, { params }) => {
  const { id } = await params;
  const userId = parseInt(id);
  const { role, password } = await request.json();

  const updates: Record<string, any> = {};
  if (role) {
    if (!['superadmin', 'admin', 'editor'].includes(role)) {
      return fail('Invalid role', 400);
    }
    updates.role = role;
  }
  if (password) {
    updates.passwordHash = await hashPassword(password);
  }

  if (Object.keys(updates).length === 0) {
    return fail('Nothing to update', 400);
  }

  await db.update(schema.users).set(updates).where(eq(schema.users.id, userId));
  return done('User updated');
}, 'Failed to update user');

export const DELETE = adminRoute<Params>(['superadmin'], async (_request, { params }, authUser) => {
  const { id } = await params;
  const userId = parseInt(id);

  if (authUser.userId === userId) {
    return fail('Tidak bisa menghapus akun sendiri', 400);
  }

  await db.delete(schema.users).where(eq(schema.users.id, userId));
  return done('User deleted');
}, 'Failed to delete user');
