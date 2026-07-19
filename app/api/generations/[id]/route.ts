import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const generation = await db.select().from(schema.generations).where(eq(schema.generations.id, parseInt(id))).limit(1);
    if (!generation.length) {
      return NextResponse.json({ success: false, message: 'Generation not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: generation[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch generation' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { name, years, isActive, description } = await request.json();
    const genId = parseInt(id);

    if (isActive === true) {
      await db.update(schema.generations).set({ isActive: false });
    }

    await db.update(schema.generations).set({
      name: name || undefined,
      years: years || undefined,
      isActive: isActive !== undefined ? isActive : undefined,
      description: description || undefined,
    }).where(eq(schema.generations.id, genId));

    return NextResponse.json({ success: true, message: 'Generation updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to update generation' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const genId = parseInt(id);

    await db.delete(schema.generations).where(eq(schema.generations.id, genId));

    return NextResponse.json({ success: true, message: 'Generation deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to delete generation' }, { status: 500 });
  }
}
