import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { ensurePartnersTableExists } from '@/lib/partners';
import { asc, desc } from 'drizzle-orm';

async function checkAdminAuth(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}


export async function GET(req: NextRequest) {
  try {
    const auth = await checkAdminAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await ensurePartnersTableExists();

    const data = await db
      .select()
      .from(schema.partners)
      .orderBy(asc(schema.partners.sortOrder), desc(schema.partners.id));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching admin partners:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch partners' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await checkAdminAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, university, logoUrl, category, websiteUrl, contactPerson, sortOrder, isActive } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Nama himpunan/mitra wajib diisi' }, { status: 400 });
    }

    await ensurePartnersTableExists();

    const [newPartner] = await db.insert(schema.partners).values({
      name: name.trim(),
      university: university?.trim() || null,
      logoUrl: logoUrl?.trim() || null,
      category: category || 'hima',
      websiteUrl: websiteUrl?.trim() || null,
      contactPerson: contactPerson?.trim() || null,
      sortOrder: Number(sortOrder) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return NextResponse.json({ success: true, data: newPartner });
  } catch (error: any) {
    console.error('Error creating partner:', error);
    return NextResponse.json({ success: false, error: 'Failed to create partner' }, { status: 500 });
  }
}
