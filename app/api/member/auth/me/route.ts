import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { memberRoute, fail } from '@/lib/api';

export const GET = memberRoute(async (_request, _context, user) => {
  // Anggota dan akun portalnya diambil bersamaan — keduanya hanya bergantung
  // pada memberId dari token, bukan satu sama lain.
  const [members, accounts] = await Promise.all([
    db.select().from(schema.members).where(eq(schema.members.id, user.memberId)).limit(1),
    db
      .select()
      .from(schema.memberAccounts)
      .where(eq(schema.memberAccounts.memberId, user.memberId))
      .limit(1),
  ]);

  const member = members[0];
  if (!member) {
    return fail('Member tidak ditemukan', 404);
  }

  const account = accounts[0];
  if (!account || !account.isActive) {
    return fail('Akun tidak aktif', 403);
  }

  // Generasi dan jabatan juga saling bebas.
  const [generations, positions] = await Promise.all([
    db
      .select()
      .from(schema.generations)
      .where(eq(schema.generations.id, member.generationId))
      .limit(1),
    member.positionId
      ? db.select().from(schema.positions).where(eq(schema.positions.id, member.positionId)).limit(1)
      : Promise.resolve([]),
  ]);

  const generation = generations[0];
  const pos = positions[0];

  return NextResponse.json({
    success: true,
    member: {
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      whatsapp: member.whatsapp,
      imageUrl: member.imageUrl,
      linkedinUrl: member.linkedinUrl,
      bio: member.bio,
      division: member.division,
      university: member.university,
      isAlumni: member.isAlumni,
      showPublic: member.showPublic,
      generation: generation
        ? { id: generation.id, name: generation.name, years: generation.years }
        : null,
      position: pos ? { id: pos.id, name: pos.name, category: pos.category } : null,
      lastLoginAt: account.lastLoginAt,
    },
  });
}, 'Failed to get member data');
