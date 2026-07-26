import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { signMemberToken, comparePassword, MEMBER_COOKIE, sessionCookieOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password harus diisi' }, 
        { status: 400 }
      );
    }

    // 1. Find member by email
    const members = await db
      .select()
      .from(schema.members)
      .where(eq(schema.members.email, email))
      .limit(1);
    
    const member = members[0];
    
    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah' }, 
        { status: 401 }
      );
    }

    // 2. Check if member has account
    const accounts = await db
      .select()
      .from(schema.memberAccounts)
      .where(eq(schema.memberAccounts.memberId, member.id))
      .limit(1);
    
    const account = accounts[0];
    
    if (!account) {
      return NextResponse.json(
        { success: false, message: 'Akun portal belum diaktifkan. Hubungi admin.' }, 
        { status: 403 }
      );
    }

    // 3. Check if account is active
    if (!account.isActive) {
      return NextResponse.json(
        { success: false, message: 'Akun tidak aktif. Hubungi admin.' }, 
        { status: 403 }
      );
    }

    // 4. Verify password
    const valid = await comparePassword(password, account.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah' }, 
        { status: 401 }
      );
    }

    // 5. Update last login
    await db
      .update(schema.memberAccounts)
      .set({ lastLoginAt: new Date() })
      .where(eq(schema.memberAccounts.id, account.id));

    // 6. Generate token
    const token = signMemberToken({ 
      memberId: member.id, 
      email: member.email || email 
    });

    const response = NextResponse.json({
      success: true,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        imageUrl: member.imageUrl,
        isAlumni: member.isAlumni,
      },
      token,
    });

    // 7. Set cookie
    response.cookies.set(MEMBER_COOKIE, token, sessionCookieOptions(8 * 60 * 60));

    return response;
  } catch (err: any) {
    console.error('[Member Login Error]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Login gagal' }, 
      { status: 500 }
    );
  }
}
