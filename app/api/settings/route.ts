import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getUserFromRequest, requireRole } from '@/lib/auth';
import { DEFAULT_SETTINGS } from '@/src/constants/defaults';

export async function GET(request: NextRequest) {
  try {
    const rows = await db.select().from(schema.settings).where(eq(schema.settings.id, 1)).limit(1);
    return NextResponse.json({ success: true, data: rows[0] || DEFAULT_SETTINGS });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin', 'editor')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { contactTitle, contactDescription, address, email, phone, showPhone, instagramUrl, linkedinUrl, youtubeUrl, divisionPhotos, divisions, footerDescription, logoUrl, faviconUrl } = await request.json();
    const rows = await db.select().from(schema.settings).where(eq(schema.settings.id, 1)).limit(1);

    if (rows.length === 0) {
      await db.insert(schema.settings).values({
        id: 1,
        contactTitle,
        contactDescription,
        address,
        email,
        phone,
        showPhone,
        instagramUrl,
        linkedinUrl,
        youtubeUrl,
        divisionPhotos,
        divisions,
        footerDescription: footerDescription || null,
        logoUrl: logoUrl || null,
        faviconUrl: faviconUrl || null,
      });
    } else {
      await db.update(schema.settings).set({
        contactTitle,
        contactDescription,
        address,
        email,
        phone,
        showPhone,
        instagramUrl: instagramUrl || undefined,
        linkedinUrl: linkedinUrl || undefined,
        youtubeUrl: youtubeUrl || undefined,
        divisionPhotos: divisionPhotos !== undefined ? divisionPhotos : undefined,
        divisions: divisions !== undefined ? divisions : undefined,
        footerDescription: footerDescription !== undefined ? footerDescription : undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        faviconUrl: faviconUrl !== undefined ? faviconUrl : undefined,
      }).where(eq(schema.settings.id, 1));
    }

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to update settings' }, { status: 500 });
  }
}
