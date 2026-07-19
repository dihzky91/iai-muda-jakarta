import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pillar = await db.select().from(schema.pillars).where(eq(schema.pillars.id, parseInt(id))).limit(1);
    if (!pillar.length) {
      return NextResponse.json({ success: false, message: 'Pillar not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: pillar[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch pillar' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { title, description, iconName, sortOrder } = await request.json();
    const pillarId = parseInt(id);

    await db.update(schema.pillars).set({
      title: title || undefined,
      description: description || undefined,
      iconName: iconName || undefined,
      sortOrder: sortOrder !== undefined ? sortOrder : undefined,
    }).where(eq(schema.pillars.id, pillarId));

    return NextResponse.json({ success: true, message: 'Pillar updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to update pillar' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const pillarId = parseInt(id);

    await db.delete(schema.pillars).where(eq(schema.pillars.id, pillarId));

    return NextResponse.json({ success: true, message: 'Pillar deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to delete pillar' }, { status: 500 });
  }
}
