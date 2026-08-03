/**
 * Migration Script: Tambah Tabel Partners (Jejaring HIMA & Kemitraan)
 *
 * Tabel yang dibuat:
 * - partners
 *
 * Seed data awal: 6 HIMA Akuntansi default.
 *
 * Run: npx tsx db/add_partners_table.ts
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';

async function main() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = parseInt(process.env.DB_PORT || '3306', 10);

  if (!host || !user || !database) {
    console.error('❌ DB_HOST / DB_USER / DB_NAME belum di-set di .env');
    process.exit(1);
  }

  const isTiDB = host.includes('tidb');

  const conn = await mysql.createConnection({
    host,
    user,
    password,
    database,
    port,
    ...(isTiDB
      ? {
          ssl: {
            rejectUnauthorized: true,
            minVersion: 'TLSv1.2' as const,
          },
        }
      : {}),
  });

  console.log('⚡ Memulai Migrasi Tabel Partners...');

  // 1. Table: partners
  await conn.query(`
    CREATE TABLE IF NOT EXISTS partners (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      university VARCHAR(255) NULL,
      logo_url VARCHAR(500) NULL,
      category ENUM('hima', 'organisasi', 'corporate', 'media') NOT NULL DEFAULT 'hima',
      website_url VARCHAR(500) NULL,
      contact_person VARCHAR(255) NULL,
      sort_order INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ Tabel partners dibuat (atau sudah ada)');

  // 2. Seed data awal jika tabel kosong
  const [rows] = await conn.query('SELECT COUNT(*) AS count FROM partners');
  const count = (rows as any[])[0]?.count ?? 0;

  if (Number(count) === 0) {
    await conn.query(`
      INSERT INTO partners (name, university, logo_url, category, website_url, sort_order, is_active) VALUES
      ('SPA FEB UI', 'Universitas Indonesia', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=300&fit=crop&q=80', 'hima', 'https://ui.ac.id', 1, 1),
      ('HIMA Akuntansi UGM', 'Universitas Gadjah Mada', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&fit=crop&q=80', 'hima', 'https://ugm.ac.id', 2, 1),
      ('USAKTI Accounting Society', 'Universitas Trisakti', 'https://images.unsplash.com/photo-1562774053-701939374585?w=300&fit=crop&q=80', 'hima', 'https://trisakti.ac.id', 3, 1),
      ('HIMAKA UNPAD', 'Universitas Padjadjaran', 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=300&fit=crop&q=80', 'hima', 'https://unpad.ac.id', 4, 1),
      ('HMJA BINUS', 'Binus University', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&fit=crop&q=80', 'hima', 'https://binus.ac.id', 5, 1),
      ('HIMA Akuntansi UNJ', 'Universitas Negeri Jakarta', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=300&fit=crop&q=80', 'hima', 'https://unj.ac.id', 6, 1);
    `);
    console.log('✅ Seed 6 HIMA Akuntansi default berhasil');
  } else {
    console.log(`⏭️  Tabel partners tidak kosong (${count} baris), seed dilewati`);
  }

  await conn.end();
  console.log('✨ Migrasi Database Partners Selesai!');
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});