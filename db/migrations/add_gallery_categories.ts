/**
 * Migration: Tambah tabel gallery_categories (kategori galeri editable)
 *
 * Tabel baru: gallery_categories
 *   - id, name, slug, color, sort_order, is_active
 *   - Seed 4 kategori default (menggantikan hardcode di GalleryManager.tsx)
 *
 * Usage:
 *   npx tsx db/migrations/add_gallery_categories.ts
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';

const SEED = [
  { name: 'Webinar & Talkshow',     slug: 'webinar-talkshow',  color: 'blue',   sortOrder: 1 },
  { name: 'Rapat Kerja (Raker)',    slug: 'rapat-kerja',       color: 'amber',  sortOrder: 2 },
  { name: 'Kunjungan Industri',     slug: 'kunjungan-industri',color: 'emerald',sortOrder: 3 },
  { name: 'Sosial & Pengabdian',    slug: 'sosial-pengabdian', color: 'pink',   sortOrder: 4 },
];

async function main() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = parseInt(process.env.DB_PORT || '3306', 10);

  if (!host || !user || !database) {
    console.error('DB_HOST / DB_USER / DB_NAME belum di-set di .env');
    process.exit(1);
  }

  const isTiDB = host.includes('tidb');
  const conn = await mysql.createConnection({
    host, user, password, database, port,
    ...(isTiDB ? { ssl: { rejectUnauthorized: true, minVersion: 'TLSv1.2' as const } } : {}),
  });

  console.log('Creating table gallery_categories...');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS gallery_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      slug VARCHAR(100) NOT NULL UNIQUE,
      color VARCHAR(20) NOT NULL DEFAULT 'blue',
      sort_order INT NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('OK table gallery_categories created');

  console.log('\nSeeding default categories...');
  for (const cat of SEED) {
    try {
      await conn.query(
        `INSERT INTO gallery_categories (name, slug, color, sort_order, is_active)
         VALUES (?, ?, ?, ?, TRUE)`,
        [cat.name, cat.slug, cat.color, cat.sortOrder]
      );
      console.log(`+ ${cat.name}`);
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log(`= skipped (exists): ${cat.name}`);
      } else {
        throw err;
      }
    }
  }

  // Tampilkan hasil akhir
  const [rows] = await conn.query('SELECT id, name, slug, color, sort_order, is_active FROM gallery_categories ORDER BY sort_order');
  console.log('\nFinal state:');
  console.table(rows);

  await conn.end();
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
