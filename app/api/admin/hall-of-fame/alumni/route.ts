import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { generationId, name, roleName, currentCompany, photoUrl, quote, sortOrder } = body;

    if (!generationId || !name || !roleName) {
      return NextResponse.json({ error: 'Nama dan Jabatan wajib diisi' }, { status: 400 });
    }

    const inserted = await db.insert(schema.alumniBoard).values({
      generationId: Number(generationId),
      name,
      roleName,
      currentCompany: currentCompany || null,
      photoUrl: photoUrl || null,
      quote: quote || null,
      sortOrder: Number(sortOrder) || 0,
    });

    return NextResponse.json({ success: true, message: 'Data alumni berhasil ditambahkan', id: inserted[0].insertId });
  } catch (error) {
    console.error('Error adding alumni board member:', error);
    return NextResponse.json({ error: 'Gagal menambahkan alumni' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, generationId, name, roleName, currentCompany, photoUrl, quote, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID Alumni diperlukan' }, { status: 400 });
    }

    await db.update(schema.alumniBoard)
      .set({
        generationId: Number(generationId),
        name,
        roleName,
        currentCompany: currentCompany || null,
        photoUrl: photoUrl || null,
        quote: quote || null,
        sortOrder: Number(sortOrder) || 0,
        updatedAt: new Date(),
      })
      .where(eq(schema.alumniBoard.id, Number(id)));

    return NextResponse.json({ success: true, message: 'Data alumni berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating alumni:', error);
    return NextResponse.json({ error: 'Gagal memperbarui alumni' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID Alumni diperlukan' }, { status: 400 });
    }

    await db.delete(schema.alumniBoard).where(eq(schema.alumniBoard.id, Number(id)));

    return NextResponse.json({ success: true, message: 'Data alumni berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting alumni:', error);
    return NextResponse.json({ error: 'Gagal menghapus alumni' }, { status: 500 });
  }
}
