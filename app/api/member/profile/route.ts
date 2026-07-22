import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getUserFromRequest, requireMember } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!requireMember(user)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      whatsapp,
      linkedinUrl,
      bio,
      university,
      showPublic,
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'Nama dan email harus diisi' },
        { status: 400 }
      );
    }

    // Check if email is already used by another member
    if (email !== user.email) {
      const existingMembers = await db
        .select()
        .from(schema.members)
        .where(eq(schema.members.email, email))
        .limit(1);

      if (existingMembers.length > 0 && existingMembers[0].id !== user.memberId) {
        return NextResponse.json(
          { success: false, message: 'Email sudah digunakan oleh member lain' },
          { status: 400 }
        );
      }
    }

    // Update member profile
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
      .where(eq(schema.members.id, user.memberId));

    // Get updated member data
    const members = await db
      .select()
      .from(schema.members)
      .where(eq(schema.members.id, user.memberId))
      .limit(1);

    const updatedMember = members[0];

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
  } catch (err: any) {
    console.error('[Member Profile Update Error]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Gagal memperbarui profil' },
      { status: 500 }
    );
  }
}
