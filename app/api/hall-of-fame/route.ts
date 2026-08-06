import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, asc, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const genParam = searchParams.get('generationId');

    // 1. Fetch all generations for dropdown filter
    const allGenerations = await db
      .select()
      .from(schema.generations)
      .orderBy(desc(schema.generations.id));

    if (allGenerations.length === 0) {
      return NextResponse.json({
        generations: [],
        currentGeneration: null,
        milestones: [],
        alumniBoard: [],
        champions: [],
      });
    }

    // 2. Determine target generation
    let selectedGen = allGenerations.find((g) => g.isActive) || allGenerations[0];
    if (genParam) {
      const parsedId = parseInt(genParam, 10);
      if (!isNaN(parsedId)) {
        const found = allGenerations.find((g) => g.id === parsedId);
        if (found) selectedGen = found;
      }
    }

    // 3. Fetch Hall of Fame details for selected generation
    const [milestones, alumni, champions, genMembers] = await Promise.all([
      db
        .select()
        .from(schema.historyMilestones)
        .where(eq(schema.historyMilestones.generationId, selectedGen.id))
        .orderBy(asc(schema.historyMilestones.sortOrder), asc(schema.historyMilestones.id)),
      db
        .select()
        .from(schema.alumniBoard)
        .where(eq(schema.alumniBoard.generationId, selectedGen.id))
        .orderBy(asc(schema.alumniBoard.sortOrder), asc(schema.alumniBoard.id)),
      db
        .select()
        .from(schema.wallOfChampions)
        .where(eq(schema.wallOfChampions.generationId, selectedGen.id))
        .orderBy(asc(schema.wallOfChampions.sortOrder), asc(schema.wallOfChampions.id)),
      db
        .select({ id: schema.members.id })
        .from(schema.members)
        .where(eq(schema.members.generationId, selectedGen.id)),
    ]);

    return NextResponse.json({
      generations: allGenerations,
      selectedGeneration: {
        ...selectedGen,
        totalMembers: genMembers.length,
      },
      milestones,
      alumniBoard: alumni,
      champions,
    });
  } catch (error) {
    console.error('Error fetching Hall of Fame data:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data Hall of Fame' },
      { status: 500 }
    );
  }
}
