import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';
import { adminRoute, fail, ok, done } from '@/lib/api';

const MANAGERS = ['superadmin', 'admin'] as const;

/** Route ini memakai 401 (bukan 403) saat otorisasi gagal — dipertahankan. */
const UNAUTHORIZED_STATUS = 401;

/** GET /api/admin/member-accounts — daftar anggota beserta status akun portalnya. */
export const GET = adminRoute(
  [...MANAGERS],
  async () => {
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
      .leftJoin(schema.memberAccounts, eq(schema.members.id, schema.memberAccounts.memberId))
      .orderBy(schema.members.name);

    return ok(members);
  },
  'Gagal mengambil data',
  UNAUTHORIZED_STATUS
);

/** POST /api/admin/member-accounts — buatkan akun portal untuk seorang anggota. */
export const POST = adminRoute(
  [...MANAGERS],
  async (request) => {
    const { memberId, password } = await request.json();

    if (!memberId || !password) {
      return fail('Member ID dan password harus diisi', 400);
    }

    if (password.length < 6) {
      return fail('Password minimal 6 karakter', 400);
    }

    // Anggota harus ada, dan belum punya akun portal.
    const [members, existingAccounts] = await Promise.all([
      db.select().from(schema.members).where(eq(schema.members.id, memberId)).limit(1),
      db
        .select()
        .from(schema.memberAccounts)
        .where(eq(schema.memberAccounts.memberId, memberId))
        .limit(1),
    ]);

    if (members.length === 0) {
      return fail('Member tidak ditemukan', 404);
    }

    if (existingAccounts.length > 0) {
      return fail('Akun portal sudah ada untuk member ini', 400);
    }

    // Cek apakah email member ini sudah dipakai akun portal lain.
    const member = members[0];
    if (member.email) {
      const emailOwners = await db
        .select({
          id: schema.members.id,
          name: schema.members.name,
          accountId: schema.memberAccounts.id,
        })
        .from(schema.members)
        .leftJoin(schema.memberAccounts, eq(schema.members.id, schema.memberAccounts.memberId))
        .where(eq(schema.members.email, member.email));

      const existingPortalOwners = emailOwners.filter(
        (r) => r.id !== memberId && r.accountId != null
      );

      if (existingPortalOwners.length > 0) {
        return fail(
          `Email ${member.email} sudah terdaftar sebagai akun portal atas nama "${existingPortalOwners[0].name}". Gunakan email lain atau hapus akun portal yang lama.`,
          400
        );
      }
    }

    await db.insert(schema.memberAccounts).values({
      memberId,
      passwordHash: await hashPassword(password),
      isActive: true,
    });

    return done('Akun portal berhasil dibuat');
  },
  'Gagal membuat akun',
  UNAUTHORIZED_STATUS
);
