import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const msgId = parseInt(id);

    await db.update(schema.contactMessages).set({ isRead: true }).where(eq(schema.contactMessages.id, msgId));

    return NextResponse.json({ success: true, message: 'Pesan ditandai sudah dibaca.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Gagal memperbarui status pesan.' }, { status: 500 });
  }
}
