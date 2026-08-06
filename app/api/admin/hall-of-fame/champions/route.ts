import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { generationId, awardType, title, winnerName, description, imageUrl, sortOrder } = body;

    if (!generationId || !title || !winnerName) {
      return NextResponse.json({ error: 'Judul dan Nama Pemenang wajib diisi' }, { status: 400 });
    }

    const inserted = await db.insert(schema.wallOfChampions).values({
      generationId: Number(generationId),
      awardType: awardType || 'other',
      title,
      winnerName,
      description: description || null,
      imageUrl: imageUrl || null,
      sortOrder: Number(sortOrder) || 0,
    });

    return NextResponse.json({ success: true, message: 'Penghargaan berhasil ditambahkan', id: inserted[0].insertId });
  } catch (error) {
    console.error('Error adding champion award:', error);
    return NextResponse.json({ error: 'Gagal menambahkan penghargaan' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, generationId, awardType, title, winnerName, description, imageUrl, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID Penghargaan diperlukan' }, { status: 400 });
    }

    await db.update(schema.wallOfChampions)
      .set({
        generationId: Number(generationId),
        awardType: awardType || 'other',
        title,
        winnerName,
        description: description || null,
        imageUrl: imageUrl || null,
        sortOrder: Number(sortOrder) || 0,
        updatedAt: new Date(),
      })
      .where(eq(schema.wallOfChampions.id, Number(id)));

    return NextResponse.json({ success: true, message: 'Penghargaan berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating champion award:', error);
    return NextResponse.json({ error: 'Gagal memperbarui penghargaan' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID Penghargaan diperlukan' }, { status: 400 });
    }

    await db.delete(schema.wallOfChampions).where(eq(schema.wallOfChampions.id, Number(id)));

    return NextResponse.json({ success: true, message: 'Penghargaan berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting champion award:', error);
    return NextResponse.json({ error: 'Gagal menghapus penghargaan' }, { status: 500 });
  }
}
