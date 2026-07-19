import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const msgId = parseInt(id);

    await db.delete(schema.contactMessages).where(eq(schema.contactMessages.id, msgId));

    return NextResponse.json({ success: true, message: 'Pesan dihapus.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Gagal menghapus pesan.' }, { status: 500 });
  }
}
