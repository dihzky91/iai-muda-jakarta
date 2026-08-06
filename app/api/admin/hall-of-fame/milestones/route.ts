import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { generationId, eventDate, title, description, imageUrl, impactTag, sortOrder } = body;

    if (!generationId || !eventDate || !title || !description) {
      return NextResponse.json({ error: 'Data utama milestone wajib diisi' }, { status: 400 });
    }

    const inserted = await db.insert(schema.historyMilestones).values({
      generationId: Number(generationId),
      eventDate,
      title,
      description,
      imageUrl: imageUrl || null,
      impactTag: impactTag || null,
      sortOrder: Number(sortOrder) || 0,
    });

    return NextResponse.json({ success: true, message: 'Milestone berhasil ditambahkan', id: inserted[0].insertId });
  } catch (error) {
    console.error('Error adding milestone:', error);
    return NextResponse.json({ error: 'Gagal menambahkan milestone' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, generationId, eventDate, title, description, imageUrl, impactTag, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID Milestone diperlukan' }, { status: 400 });
    }

    await db.update(schema.historyMilestones)
      .set({
        generationId: Number(generationId),
        eventDate,
        title,
        description,
        imageUrl: imageUrl || null,
        impactTag: impactTag || null,
        sortOrder: Number(sortOrder) || 0,
        updatedAt: new Date(),
      })
      .where(eq(schema.historyMilestones.id, Number(id)));

    return NextResponse.json({ success: true, message: 'Milestone berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating milestone:', error);
    return NextResponse.json({ error: 'Gagal memperbarui milestone' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID Milestone diperlukan' }, { status: 400 });
    }

    await db.delete(schema.historyMilestones).where(eq(schema.historyMilestones.id, Number(id)));

    return NextResponse.json({ success: true, message: 'Milestone berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    return NextResponse.json({ error: 'Gagal menghapus milestone' }, { status: 500 });
  }
}
