import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, asc, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const generations = await db.select().from(schema.generations).orderBy(desc(schema.generations.id));
    const milestones = await db.select().from(schema.historyMilestones).orderBy(asc(schema.historyMilestones.sortOrder));
    const alumni = await db.select().from(schema.alumniBoard).orderBy(asc(schema.alumniBoard.sortOrder));
    const champions = await db.select().from(schema.wallOfChampions).orderBy(asc(schema.wallOfChampions.sortOrder));

    return NextResponse.json({
      generations,
      milestones,
      alumni,
      champions,
    });
  } catch (error) {
    console.error('Error fetching admin Hall of Fame data:', error);
    return NextResponse.json({ error: 'Gagal memuat data admin' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, cabinetName, visionMission, logoUrl } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID Generasi diperlukan' }, { status: 400 });
    }

    await db.update(schema.generations)
      .set({
        cabinetName: cabinetName || null,
        visionMission: visionMission || null,
        logoUrl: logoUrl || null,
        updatedAt: new Date(),
      })
      .where(eq(schema.generations.id, Number(id)));

    return NextResponse.json({ success: true, message: 'Metadata kabinet berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating generation cabinet info:', error);
    return NextResponse.json({ error: 'Gagal memperbarui data kabinet' }, { status: 500 });
  }
}
