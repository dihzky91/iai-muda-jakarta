import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { memberRoute, fail } from '@/lib/api';

export const PUT = memberRoute(async (request, _context, member) => {
  const { name, email, phone, whatsapp, linkedinUrl, bio, university, showPublic } =
    await request.json();

  if (!name || !email) {
    return fail('Nama dan email harus diisi', 400);
  }

  // Email hanya boleh dipakai satu anggota.
  if (email !== member.email) {
    const existingMembers = await db
      .select()
      .from(schema.members)
      .where(eq(schema.members.email, email))
      .limit(1);

    if (existingMembers.length > 0 && existingMembers[0].id !== member.memberId) {
      return fail('Email sudah digunakan oleh member lain', 400);
    }
  }

  await db
    .update(schema.members)
    .set({
      name,
      email,
      phone: phone || null,
      whatsapp: whatsapp || null,
      linkedinUrl: linkedinUrl || null,
      bio: bio || null,
      university: university || null,
      showPublic: showPublic ?? true,
      updatedAt: new Date(),
    })
    .where(eq(schema.members.id, member.memberId));

  const [updatedMember] = await db
    .select()
    .from(schema.members)
    .where(eq(schema.members.id, member.memberId))
    .limit(1);

  return NextResponse.json({
    success: true,
    message: 'Profil berhasil diperbarui',
    member: {
      id: updatedMember.id,
      name: updatedMember.name,
      email: updatedMember.email,
      phone: updatedMember.phone,
      whatsapp: updatedMember.whatsapp,
      imageUrl: updatedMember.imageUrl,
      linkedinUrl: updatedMember.linkedinUrl,
      bio: updatedMember.bio,
      division: updatedMember.division,
      university: updatedMember.university,
      isAlumni: updatedMember.isAlumni,
      showPublic: updatedMember.showPublic,
    },
  });
}, 'Gagal memperbarui profil');
