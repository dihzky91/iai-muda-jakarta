import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const position = await db.select().from(schema.positions).where(eq(schema.positions.id, parseInt(id))).limit(1);
    if (!position.length) {
      return NextResponse.json({ success: false, message: 'Position not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: position[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch position' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { name, category, sortOrder } = await request.json();
    const posId = parseInt(id);

    await db.update(schema.positions).set({
      name: name || undefined,
      category: category || undefined,
      sortOrder: sortOrder !== undefined ? sortOrder : undefined,
    }).where(eq(schema.positions.id, posId));

    return NextResponse.json({ success: true, message: 'Position updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to update position' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const posId = parseInt(id);

    await db.delete(schema.positions).where(eq(schema.positions.id, posId));

    return NextResponse.json({ success: true, message: 'Position deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to delete position' }, { status: 500 });
  }
}
