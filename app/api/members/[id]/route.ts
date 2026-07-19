import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getUserFromRequest, requireRole } from '@/lib/auth';

async function resolvePositionId(positionName: string | undefined, divisionName: string | undefined): Promise<number | null> {
  if (!positionName) return null;
  const nameTrimmed = positionName.trim();
  if (!nameTrimmed) return null;

  const matched = await db.select().from(schema.positions).where(eq(schema.positions.name, nameTrimmed)).limit(1);
  if (matched.length > 0) {
    return matched[0].id;
  }

  const result = await db.insert(schema.positions).values({
    name: nameTrimmed,
    category: divisionName || 'Lainnya',
    sortOrder: 100,
  });
  return (result as any).insertId;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await db
      .select({
        id: schema.members.id,
        generationId: schema.members.generationId,
        positionId: schema.members.positionId,
        name: schema.members.name,
        division: schema.members.division,
        university: schema.members.university,
        email: schema.members.email,
        imageUrl: schema.members.imageUrl,
        linkedinUrl: schema.members.linkedinUrl,
        bio: schema.members.bio,
        isActive: schema.members.isActive,
        createdAt: schema.members.createdAt,
        updatedAt: schema.members.updatedAt,
        position: schema.positions.name,
      })
      .from(schema.members)
      .leftJoin(schema.positions, eq(schema.members.positionId, schema.positions.id))
      .where(eq(schema.members.id, parseInt(id)))
      .limit(1);
    if (!rows.length) {
      return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });
    }
    const member = { ...rows[0], position: rows[0].position || '' };
    return NextResponse.json({ success: true, data: member });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch member' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { generationId, positionId, position, name, division, university, email, imageUrl, linkedinUrl, bio, isActive } = await request.json();
    const memberId = parseInt(id);

    let resolvedPosId = positionId || undefined;
    if (position !== undefined) {
      resolvedPosId = position ? (await resolvePositionId(position, division || 'Lainnya') || undefined) : null;
    }

    await db.update(schema.members).set({
      generationId: generationId || undefined,
      positionId: resolvedPosId,
      name: name || undefined,
      division: division || undefined,
      university: university !== undefined ? university : undefined,
      email: email || undefined,
      imageUrl: imageUrl || undefined,
      linkedinUrl: linkedinUrl || undefined,
      bio: bio || undefined,
      isActive: isActive !== undefined ? isActive : undefined,
    }).where(eq(schema.members.id, memberId));

    return NextResponse.json({ success: true, message: 'Member updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to update member' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const memberId = parseInt(id);

    await db.delete(schema.members).where(eq(schema.members.id, memberId));

    return NextResponse.json({ success: true, message: 'Member deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to delete member' }, { status: 500 });
  }
}
