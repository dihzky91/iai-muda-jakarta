import { db, schema } from './db';
import { eq, asc, sql } from 'drizzle-orm';

let tableChecked = false;

export async function ensurePartnersTableExists() {
  if (tableChecked) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS partners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        university VARCHAR(255),
        logo_url VARCHAR(500),
        category ENUM('hima', 'organisasi', 'corporate', 'media') NOT NULL DEFAULT 'hima',
        website_url VARCHAR(500),
        contact_person VARCHAR(255),
        sort_order INT NOT NULL DEFAULT 0,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);


    tableChecked = true;
  } catch (err) {
    console.error('Auto-migration partners table check error:', err);
  }
}

export async function selectActivePartners() {
  try {
    return await db
      .select()
      .from(schema.partners)
      .where(eq(schema.partners.isActive, true))
      .orderBy(asc(schema.partners.sortOrder));
  } catch (err: any) {
    // If table missing error (code 1146), attempt auto-creating table once then query again
    if (err?.code === 'ER_NO_SUCH_TABLE' || err?.errno === 1146 || err?.message?.includes("doesn't exist")) {
      await ensurePartnersTableExists();
      return await db
        .select()
        .from(schema.partners)
        .where(eq(schema.partners.isActive, true))
        .orderBy(asc(schema.partners.sortOrder))
        .catch(() => []);
    }
    return [];
  }
}
