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

    // Seed default initial HIMA partners if table is empty
    const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM partners`);
    const count = (countResult as any)?.[0]?.[0]?.count ?? (countResult as any)?.[0]?.count ?? 0;

    if (Number(count) === 0) {
      await db.execute(sql`
        INSERT INTO partners (name, university, logo_url, category, website_url, sort_order, is_active) VALUES
        ('SPA FEB UI', 'Universitas Indonesia', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=300&fit=crop&q=80', 'hima', 'https://ui.ac.id', 1, 1),
        ('HIMA Akuntansi UGM', 'Universitas Gadjah Mada', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&fit=crop&q=80', 'hima', 'https://ugm.ac.id', 2, 1),
        ('USAKTI Accounting Society', 'Universitas Trisakti', 'https://images.unsplash.com/photo-1562774053-701939374585?w=300&fit=crop&q=80', 'hima', 'https://trisakti.ac.id', 3, 1),
        ('HIMAKA UNPAD', 'Universitas Padjadjaran', 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=300&fit=crop&q=80', 'hima', 'https://unpad.ac.id', 4, 1),
        ('HMJA BINUS', 'Binus University', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&fit=crop&q=80', 'hima', 'https://binus.ac.id', 5, 1),
        ('HIMA Akuntansi UNJ', 'Universitas Negeri Jakarta', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=300&fit=crop&q=80', 'hima', 'https://unj.ac.id', 6, 1);
      `);
    }

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
