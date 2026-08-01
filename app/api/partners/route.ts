import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, asc } from 'drizzle-orm';

export async function GET() {
  try {
    const data = await db
      .select()
      .from(schema.partners)
      .where(eq(schema.partners.isActive, true))
      .orderBy(asc(schema.partners.sortOrder));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching active partners:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch partners' }, { status: 500 });
  }
}
