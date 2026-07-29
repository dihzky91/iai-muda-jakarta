import { db } from '../index';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Creating community_categories table if not exists...');
  
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS community_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(50) NOT NULL UNIQUE,
      hashtag VARCHAR(50) NOT NULL,
      label VARCHAR(100) NOT NULL,
      description TEXT,
      badge_class VARCHAR(255) NOT NULL DEFAULT 'bg-slate-100 text-slate-700 border-slate-200',
      active_tab_class VARCHAR(255) NOT NULL DEFAULT 'bg-slate-800 text-white',
      sort_order INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('Checking default categories...');
  const [existingCount] = await db.execute(sql`SELECT COUNT(*) as cnt FROM community_categories`);
  const count = (existingCount as any)?.[0]?.cnt || 0;

  if (Number(count) === 0) {
    console.log('Seeding initial default categories...');
    await db.execute(sql`
      INSERT INTO community_categories (slug, hashtag, label, description, badge_class, active_tab_class, sort_order, is_active)
      VALUES 
      ('umum', '#DiskusiUmum', 'Diskusi Umum', 'Bincang santai, kabar harian, dan obrolan umum pengurus', 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200', 'bg-slate-800 text-white shadow-sm', 1, 1),
      ('pengumuman', '#Pengumuman', 'Pengumuman', 'Informasi resmi & pengumuman penting organisasi', 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100', 'bg-blue-600 text-white shadow-sm', 2, 1),
      ('event_sharing', '#EventSharing', 'Acara & Sharing', 'Dokumentasi kegiatan, info workshop, dan insight acara IAI Muda', 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100', 'bg-purple-600 text-white shadow-sm', 3, 1)
    `);
    console.log('Seeded default categories successfully!');
  } else {
    console.log('community_categories already populated.');
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
