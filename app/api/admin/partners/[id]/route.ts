import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { ensurePartnersTableExists } from '@/lib/partners';
import { eq } from 'drizzle-orm';

async function checkAdminAuth(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}


export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await checkAdminAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: idStr } = await params;
    const partnerId = parseInt(idStr, 10);
    if (isNaN(partnerId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    await ensurePartnersTableExists();

    const body = await req.json();
    const updateData: Record<string, any> = {};

    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.university !== undefined) updateData.university = body.university ? String(body.university).trim() : null;
    if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl ? String(body.logoUrl).trim() : null;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.websiteUrl !== undefined) updateData.websiteUrl = body.websiteUrl ? String(body.websiteUrl).trim() : null;
    if (body.contactPerson !== undefined) updateData.contactPerson = body.contactPerson ? String(body.contactPerson).trim() : null;
    if (body.sortOrder !== undefined) updateData.sortOrder = Number(body.sortOrder);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    await db.update(schema.partners).set(updateData).where(eq(schema.partners.id, partnerId));

    return NextResponse.json({ success: true, message: 'Partner updated' });
  } catch (error: any) {
    console.error('Error updating partner:', error);
    return NextResponse.json({ success: false, error: 'Failed to update partner' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await checkAdminAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: idStr } = await params;
    const partnerId = parseInt(idStr, 10);
    if (isNaN(partnerId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    await ensurePartnersTableExists();

    await db.delete(schema.partners).where(eq(schema.partners.id, partnerId));

    return NextResponse.json({ success: true, message: 'Partner deleted' });
  } catch (error: any) {
    console.error('Error deleting partner:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete partner' }, { status: 500 });
  }
}
