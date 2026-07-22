import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getUserFromRequest, requireMember, hashPassword, comparePassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!requireMember(user)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password baru minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Konfirmasi password tidak cocok' },
        { status: 400 }
      );
    }

    // Get member account
    const accounts = await db
      .select()
      .from(schema.memberAccounts)
      .where(eq(schema.memberAccounts.memberId, user.memberId))
      .limit(1);

    if (accounts.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Akun tidak ditemukan' },
        { status: 404 }
      );
    }

    const account = accounts[0];

    // Verify current password
    const isValid = await comparePassword(currentPassword, account.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Password saat ini tidak sesuai' },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await db
      .update(schema.memberAccounts)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(schema.memberAccounts.memberId, user.memberId));

    return NextResponse.json({
      success: true,
      message: 'Password berhasil diubah',
    });
  } catch (err: any) {
    console.error('[Member Change Password Error]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal mengubah password' },
      { status: 500 }
    );
  }
}
