import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getUserFromRequest, requireRole, hashPassword } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getUserFromRequest(request);
    if (!requireRole(authUser, 'superadmin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);
    const { role, password } = await request.json();

    const updates: Record<string, any> = {};
    if (role) {
      if (!['superadmin', 'admin', 'editor'].includes(role)) {
        return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 });
      }
      updates.role = role;
    }
    if (password) {
      updates.passwordHash = await hashPassword(password);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, message: 'Nothing to update' }, { status: 400 });
    }

    await db.update(schema.users).set(updates).where(eq(schema.users.id, userId));
    return NextResponse.json({ success: true, message: 'User updated' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getUserFromRequest(request);
    if (!requireRole(authUser, 'superadmin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (authUser?.type === 'admin' && authUser.userId === userId) {
      return NextResponse.json({ success: false, message: 'Tidak bisa menghapus akun sendiri' }, { status: 400 });
    }

    await db.delete(schema.users).where(eq(schema.users.id, userId));
    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to delete user' }, { status: 500 });
  }
}
