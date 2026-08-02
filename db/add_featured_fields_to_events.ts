/**
 * Migration: Tambah field featured dan metadata ke tabel events
 *
 * Field baru:
 * - is_featured     : boolean, default false
 * - skp_text        : varchar(50), nullable
 * - skp_subtitle    : varchar(100), nullable
 * - has_certificate : boolean, default true
 * - price_text      : varchar(100), default 'Gratis'
 * - speakers_text   : varchar(255), nullable
 * - category_badge  : varchar(50), default 'WEBINAR'
 * - is_live         : boolean, default false
 *
 * Usage:
 *   npx tsx db/add_featured_fields_to_events.ts
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
    console.error('DB_HOST / DB_USER / DB_NAME belum di-set di .env');
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

  console.log('Adding featured event fields to events table...');

  const statements = [
    "ALTER TABLE events ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT FALSE",
    "ALTER TABLE events ADD COLUMN skp_text VARCHAR(50) NULL",
    "ALTER TABLE events ADD COLUMN skp_subtitle VARCHAR(100) NULL",
    "ALTER TABLE events ADD COLUMN has_certificate BOOLEAN NOT NULL DEFAULT TRUE",
    "ALTER TABLE events ADD COLUMN price_text VARCHAR(100) NOT NULL DEFAULT 'Gratis'",
    "ALTER TABLE events ADD COLUMN speakers_text VARCHAR(255) NULL",
    "ALTER TABLE events ADD COLUMN category_badge VARCHAR(50) NOT NULL DEFAULT 'WEBINAR'",
    "ALTER TABLE events ADD COLUMN is_live BOOLEAN NOT NULL DEFAULT FALSE",
  ];

  for (const sql of statements) {
    try {
      await conn.query(sql);
      console.log(`OK: ${sql}`);
    } catch (err: any) {
      if (err.code === 'ER_DUP_FIELDNAME' || err.message?.includes('Duplicate column')) {
        console.log(`- skipped (already exists): ${sql}`);
      } else {
        console.warn(`- warning: ${err.message}`);
      }
    }
  }

  await conn.end();
  console.log('\nDone. Schema events database updated.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
