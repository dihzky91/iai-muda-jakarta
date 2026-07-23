import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getUserFromRequest, requireRole } from '@/lib/auth';

// PUT /api/admin/member-accounts/:id - Toggle account active status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);

    if (!requireRole(user, 'superadmin', 'admin')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const accountId = parseInt(id);

    if (isNaN(accountId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid account ID' },
        { status: 400 }
      );
    }

    // Get current account
    const accounts = await db
      .select()
      .from(schema.memberAccounts)
      .where(eq(schema.memberAccounts.id, accountId))
      .limit(1);

    if (accounts.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Akun tidak ditemukan' },
        { status: 404 }
      );
    }

    const account = accounts[0];

    // Toggle active status
    await db
      .update(schema.memberAccounts)
      .set({
        isActive: !account.isActive,
        updatedAt: new Date(),
      })
      .where(eq(schema.memberAccounts.id, accountId));

    return NextResponse.json({
      success: true,
      message: `Akun berhasil ${!account.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
      isActive: !account.isActive,
    });
  } catch (err: any) {
    console.error('[Admin Toggle Member Account Error]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal mengubah status akun' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/member-accounts/:id - Delete member account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);

    if (!requireRole(user, 'superadmin', 'admin')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const accountId = parseInt(id);

    if (isNaN(accountId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid account ID' },
        { status: 400 }
      );
    }

    // Delete account
    await db
      .delete(schema.memberAccounts)
      .where(eq(schema.memberAccounts.id, accountId));

    return NextResponse.json({
      success: true,
      message: 'Akun portal berhasil dihapus',
    });
  } catch (err: any) {
    console.error('[Admin Delete Member Account Error]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal menghapus akun' },
      { status: 500 }
    );
  }
}
