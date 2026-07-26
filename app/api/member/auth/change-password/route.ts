import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { hashPassword, comparePassword } from '@/lib/auth';
import { memberRoute, fail, done } from '@/lib/api';

export const POST = memberRoute(async (request, _context, user) => {
  const { currentPassword, newPassword, confirmPassword } = await request.json();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return fail('Semua field harus diisi', 400);
  }

  if (newPassword.length < 6) {
    return fail('Password baru minimal 6 karakter', 400);
  }

  if (newPassword !== confirmPassword) {
    return fail('Konfirmasi password tidak cocok', 400);
  }

  const accounts = await db
    .select()
    .from(schema.memberAccounts)
    .where(eq(schema.memberAccounts.memberId, user.memberId))
    .limit(1);

  if (accounts.length === 0) {
    return fail('Akun tidak ditemukan', 404);
  }

  const isValid = await comparePassword(currentPassword, accounts[0].passwordHash);
  if (!isValid) {
    return fail('Password saat ini tidak sesuai', 400);
  }

  await db
    .update(schema.memberAccounts)
    .set({
      passwordHash: await hashPassword(newPassword),
      updatedAt: new Date(),
    })
    .where(eq(schema.memberAccounts.memberId, user.memberId));

  return done('Password berhasil diubah');
}, 'Gagal mengubah password');
