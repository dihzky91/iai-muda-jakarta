import { NextResponse } from 'next/server';
import { db, schema } from '../../../db';
import { eq, or, lte, gte } from 'drizzle-orm';

export async function GET() {
  try {
    const rows = await db.select().from(schema.events).orderBy(schema.events.date);

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
