import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { adminRoute, fail, done } from '@/lib/api';

type Params = { id: string };

const MANAGERS = ['superadmin', 'admin'] as const;

/** Route ini memakai 401 (bukan 403) saat otorisasi gagal — dipertahankan. */
const UNAUTHORIZED_STATUS = 401;

/** PUT /api/admin/member-accounts/:id — aktif/nonaktifkan akun portal. */
export const PUT = adminRoute<Params>(
  [...MANAGERS],
  async (_request, { params }) => {
    const { id } = await params;
    const accountId = parseInt(id);

    if (isNaN(accountId)) {
      return fail('Invalid account ID', 400);
    }

    const accounts = await db
      .select()
      .from(schema.memberAccounts)
      .where(eq(schema.memberAccounts.id, accountId))
      .limit(1);

    if (accounts.length === 0) {
      return fail('Akun tidak ditemukan', 404);
    }

    const nextActive = !accounts[0].isActive;

    await db
      .update(schema.memberAccounts)
      .set({ isActive: nextActive, updatedAt: new Date() })
      .where(eq(schema.memberAccounts.id, accountId));

    return done(`Akun berhasil ${nextActive ? 'diaktifkan' : 'dinonaktifkan'}`, {
      isActive: nextActive,
    });
  },
  'Gagal mengubah status akun',
  UNAUTHORIZED_STATUS
);

/** DELETE /api/admin/member-accounts/:id — hapus akun portal. */
export const DELETE = adminRoute<Params>(
  [...MANAGERS],
  async (_request, { params }) => {
    const { id } = await params;
    const accountId = parseInt(id);

    if (isNaN(accountId)) {
      return fail('Invalid account ID', 400);
    }

    await db.delete(schema.memberAccounts).where(eq(schema.memberAccounts.id, accountId));

    return done('Akun portal berhasil dihapus');
  },
  'Gagal menghapus akun',
  UNAUTHORIZED_STATUS
);
