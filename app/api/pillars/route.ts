import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const pillars = await db.select().from(schema.pillars).orderBy(schema.pillars.sortOrder);
    return NextResponse.json({ success: true, data: pillars });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch pillars' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { title, description, iconName, sortOrder } = await request.json();
    if (!title || !description) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const result = await db.insert(schema.pillars).values({
      title,
      description,
      iconName: iconName || 'Shield',
      sortOrder: sortOrder || 0,
    });

    return NextResponse.json({ success: true, message: 'Pillar created successfully', id: (result as any).insertId });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to create pillar' }, { status: 500 });
  }
}
