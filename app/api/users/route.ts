import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getUserFromRequest, requireRole } from '@/lib/auth';
import bcrypt from 'bcrypt';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const users = await db
      .select({ id: schema.users.id, username: schema.users.username, role: schema.users.role, createdAt: schema.users.createdAt })
      .from(schema.users)
      .orderBy(schema.users.createdAt);
    return NextResponse.json({ success: true, data: users });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { username, password, role } = await request.json();
    if (!username || !password || !role) {
      return NextResponse.json({ success: false, message: 'username, password, and role are required' }, { status: 400 });
    }
    if (!['superadmin', 'admin', 'editor'].includes(role)) {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 });
    }

    const existing = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: 'Username sudah digunakan' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await db.insert(schema.users).values({ username, passwordHash, role });
    return NextResponse.json({ success: true, message: 'User created', id: (result as any).insertId });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to create user' }, { status: 500 });
  }
}
