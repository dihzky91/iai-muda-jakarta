import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const positions = await db.select().from(schema.positions).orderBy(schema.positions.sortOrder);
    return NextResponse.json({ success: true, data: positions });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch positions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { name, category, sortOrder } = await request.json();

    if (!name || !category) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const result = await db.insert(schema.positions).values({
      name,
      category,
      sortOrder: sortOrder || 0,
    });

    return NextResponse.json({ success: true, message: 'Position created successfully', id: (result as any).insertId });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to create position' }, { status: 500 });
  }
}
