import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const rows = await db.select().from(schema.galleries).orderBy(schema.galleries.date);
    const galleries = rows.map(g => ({
      ...g,
      images: g.images ? JSON.parse(g.images) : [],
    }));
    return NextResponse.json({ success: true, data: galleries });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch galleries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin', 'editor')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { title, description, imageUrl, date, category, photographer, images } = await request.json();

    if (!title || !date) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const result = await db.insert(schema.galleries).values({
      title,
      description: description || null,
      imageUrl: imageUrl || null,
      date,
      category: category || null,
      photographer: photographer || null,
      images: images ? JSON.stringify(images) : null,
    });

    return NextResponse.json({ success: true, message: 'Gallery created successfully', id: (result as any).insertId });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to create gallery' }, { status: 500 });
  }
}
