import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getUserFromRequest, requireRole, hashPassword } from '@/lib/auth';

// GET /api/admin/member-accounts - List all member accounts
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!requireRole(user, 'superadmin', 'admin')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all members with their account status
    const members = await db
      .select({
        id: schema.members.id,
        name: schema.members.name,
        email: schema.members.email,
        imageUrl: schema.members.imageUrl,
        division: schema.members.division,
        isAlumni: schema.members.isAlumni,
        showPublic: schema.members.showPublic,
        positionId: schema.members.positionId,
        generationId: schema.members.generationId,
        accountId: schema.memberAccounts.id,
        accountIsActive: schema.memberAccounts.isActive,
        accountLastLogin: schema.memberAccounts.lastLoginAt,
        accountCreatedAt: schema.memberAccounts.createdAt,
      })
      .from(schema.members)
      .leftJoin(
        schema.memberAccounts,
        eq(schema.members.id, schema.memberAccounts.memberId)
      )
      .orderBy(schema.members.name);

    return NextResponse.json({
      success: true,
      data: members,
    });
  } catch (err: any) {
    console.error('[Admin Member Accounts List Error]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal mengambil data' },
      { status: 500 }
    );
  }
}

// POST /api/admin/member-accounts - Create member account
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!requireRole(user, 'superadmin', 'admin')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { memberId, password } = body;

    // Validate required fields
    if (!memberId || !password) {
      return NextResponse.json(
        { success: false, message: 'Member ID dan password harus diisi' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Check if member exists
    const members = await db
      .select()
      .from(schema.members)
      .where(eq(schema.members.id, memberId))
      .limit(1);

    if (members.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Member tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if account already exists
    const existingAccounts = await db
      .select()
      .from(schema.memberAccounts)
      .where(eq(schema.memberAccounts.memberId, memberId))
      .limit(1);

    if (existingAccounts.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Akun portal sudah ada untuk member ini' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create account
    await db.insert(schema.memberAccounts).values({
      memberId,
      passwordHash,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Akun portal berhasil dibuat',
    });
  } catch (err: any) {
    console.error('[Admin Create Member Account Error]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal membuat akun' },
      { status: 500 }
    );
  }
}
