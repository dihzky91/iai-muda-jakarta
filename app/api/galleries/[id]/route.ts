import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const row = await db.select().from(schema.galleries).where(eq(schema.galleries.id, parseInt(id))).limit(1);
    if (!row.length) {
      return NextResponse.json({ success: false, message: 'Gallery not found' }, { status: 404 });
    }
    const gallery = { ...row[0], images: row[0].images ? JSON.parse(row[0].images) : [] };
    return NextResponse.json({ success: true, data: gallery });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch gallery' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin', 'editor')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { title, description, imageUrl, date, category, photographer, images } = await request.json();
    const galleryId = parseInt(id);

    await db.update(schema.galleries).set({
      title: title || undefined,
      description: description !== undefined ? description : undefined,
      imageUrl: imageUrl !== undefined ? imageUrl : undefined,
      date: date || undefined,
      category: category !== undefined ? category : undefined,
      photographer: photographer !== undefined ? photographer : undefined,
      images: images !== undefined ? JSON.stringify(images) : undefined,
    }).where(eq(schema.galleries.id, galleryId));

    return NextResponse.json({ success: true, message: 'Gallery updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to update gallery' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin', 'editor')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const galleryId = parseInt(id);

    await db.delete(schema.galleries).where(eq(schema.galleries.id, galleryId));

    return NextResponse.json({ success: true, message: 'Gallery deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to delete gallery' }, { status: 500 });
  }
}
