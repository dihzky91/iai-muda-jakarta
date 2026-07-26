import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { adminRoute, publicRoute, ok, done } from '@/lib/api';
import { DEFAULT_SETTINGS } from '@/src/constants/defaults';

export const GET = publicRoute(async () => {
  const rows = await db.select().from(schema.settings).where(eq(schema.settings.id, 1)).limit(1);
  return ok(rows[0] || DEFAULT_SETTINGS);
}, 'Failed to fetch settings');

export const PUT = adminRoute(['superadmin', 'admin', 'editor'], async (request) => {
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

  return done('Settings updated successfully');
}, 'Failed to update settings');
