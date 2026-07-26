import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { signAdminToken, comparePassword, ADMIN_COOKIE, sessionCookieOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username and password required' }, { status: 400 });
    }

    const rows = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
    const user = rows[0];

    if (!user) {
      return NextResponse.json({ success: false, message: 'Username atau password salah' }, { status: 401 });
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, message: 'Username atau password salah' }, { status: 401 });
    }

    const token = signAdminToken({ userId: user.id, username: user.username, role: user.role });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role },
      token,
    });

    response.cookies.set(ADMIN_COOKIE, token, sessionCookieOptions(8 * 60 * 60));

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Login failed' }, { status: 500 });
  }
}
