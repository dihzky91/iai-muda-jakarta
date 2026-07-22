import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getUserFromRequest, requireRole } from '@/lib/auth';

function validate(fields: Record<string, { value: unknown; minLen?: number; maxLen?: number; type?: string; regex?: RegExp; label: string }>) {
  for (const [, rule] of Object.entries(fields)) {
    const val = rule.value;
    if (val === undefined || val === null || val === '') {
      return `${rule.label} wajib diisi.`;
    }
    if (rule.type === 'string' && typeof val !== 'string') {
      return `${rule.label} harus berupa teks.`;
    }
    if (typeof val === 'string') {
      if (rule.minLen && val.trim().length < rule.minLen) {
        return `${rule.label} minimal ${rule.minLen} karakter.`;
      }
      if (rule.maxLen && val.trim().length > rule.maxLen) {
        return `${rule.label} maksimal ${rule.maxLen} karakter.`;
      }
      if (rule.regex && !rule.regex.test(val)) {
        return `${rule.label} formatnya tidak valid.`;
      }
    }
  }
  return null;
}

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const generationId = searchParams.get('generationId') ? parseInt(searchParams.get('generationId')!) : undefined;
    
    // Check if user is authenticated admin/superadmin
    const user = getUserFromRequest(request);
    const isAdmin = user && user.type === 'admin' && (user.role === 'superadmin' || user.role === 'admin' || user.role === 'editor');

    let query = db
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
        showPublic: schema.members.showPublic,
        createdAt: schema.members.createdAt,
        updatedAt: schema.members.updatedAt,
        position: schema.positions.name,
      })
      .from(schema.members)
      .leftJoin(schema.positions, eq(schema.members.positionId, schema.positions.id));

    if (generationId) {
      query = query.where(eq(schema.members.generationId, generationId)) as any;
    }
    
    // If not admin, only show public members
    if (!isAdmin) {
      const conditions = [eq(schema.members.showPublic, true)];
      if (generationId) {
        conditions.push(eq(schema.members.generationId, generationId));
      }
      query = db
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
          showPublic: schema.members.showPublic,
          createdAt: schema.members.createdAt,
          updatedAt: schema.members.updatedAt,
          position: schema.positions.name,
        })
        .from(schema.members)
        .leftJoin(schema.positions, eq(schema.members.positionId, schema.positions.id))
        .where(eq(schema.members.showPublic, true)) as any;
        
      if (generationId) {
        query = query.where(eq(schema.members.generationId, generationId)) as any;
      }
    }

    const rows = await query.orderBy(schema.members.id);
    const members = rows.map((row) => ({
      ...row,
      position: row.position || '',
    }));
    return NextResponse.json({ success: true, data: members });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { generationId, positionId, position, name, division, university, email, imageUrl, linkedinUrl, bio, isActive } = await request.json();

    const err = validate({
      name:        { value: name,        type: 'string', minLen: 2, maxLen: 255, label: 'Nama anggota' },
      generationId:{ value: generationId,                                        label: 'ID Generasi' },
      ...(email ? { email: { value: email, type: 'string', regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, label: 'Email' } } : {}),
    });
    if (err) return NextResponse.json({ success: false, message: err }, { status: 400 });

    let resolvedPosId = positionId || null;
    if (!resolvedPosId && position) {
      resolvedPosId = await resolvePositionId(position, division);
    }

    const result = await db.insert(schema.members).values({
      generationId,
      positionId: resolvedPosId,
      name,
      division: division || null,
      university: university || null,
      email: email || null,
      imageUrl: imageUrl || null,
      linkedinUrl: linkedinUrl || null,
      bio: bio || null,
      isActive: isActive !== false,
    });

    return NextResponse.json({ success: true, message: 'Member created successfully', id: (result as any).insertId });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to create member' }, { status: 500 });
  }
}
