import { NextResponse } from 'next/server';
import { selectActivePartners } from '@/lib/partners';

export async function GET() {
  try {
    const data = await selectActivePartners();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching active partners:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch partners' }, { status: 500 });
  }
}
