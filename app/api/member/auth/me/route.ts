import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getUserFromRequest, requireMember } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!requireMember(user)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Get member data
    const members = await db
      .select()
      .from(schema.members)
      .where(eq(schema.members.id, user.memberId))
      .limit(1);
    
    const member = members[0];

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member tidak ditemukan' }, 
        { status: 404 }
      );
    }

    // Get account data
    const accounts = await db
      .select()
      .from(schema.memberAccounts)
      .where(eq(schema.memberAccounts.memberId, member.id))
      .limit(1);
    
    const account = accounts[0];

    if (!account || !account.isActive) {
      return NextResponse.json(
        { success: false, message: 'Akun tidak aktif' }, 
        { status: 403 }
      );
    }

    // Get generation data
    const generations = await db
      .select()
      .from(schema.generations)
      .where(eq(schema.generations.id, member.generationId))
      .limit(1);
    
    const generation = generations[0];

    // Get position data if exists
    let position: { id: number; name: string; category: string } | null = null;
    if (member.positionId) {
      const positions = await db
        .select()
        .from(schema.positions)
        .where(eq(schema.positions.id, member.positionId))
        .limit(1);
      const pos = positions[0];
      if (pos) {
        position = {
          id: pos.id,
          name: pos.name,
          category: pos.category,
        };
      }
    }

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
        generation: generation ? {
          id: generation.id,
          name: generation.name,
          years: generation.years,
        } : null,
        position: position,
        lastLoginAt: account.lastLoginAt,
      },
    });
  } catch (err: any) {
    console.error('[Member Me Error]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to get member data' }, 
      { status: 500 }
    );
  }
}
