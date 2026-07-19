import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const generations = await db.select().from(schema.generations).orderBy(schema.generations.id);
    return NextResponse.json({ success: true, data: generations });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch generations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { slug, name, years, isActive, description } = await request.json();

    if (!slug || !name || !years) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const result = await db.insert(schema.generations).values({
      slug,
      name,
      years,
      isActive: isActive || false,
      description: description || null,
    });

    return NextResponse.json({ success: true, message: 'Generation created successfully', id: (result as any).insertId });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to create generation' }, { status: 500 });
  }
}
