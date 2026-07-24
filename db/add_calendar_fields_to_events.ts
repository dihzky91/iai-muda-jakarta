/**
 * Migration: Tambah field kalender ke tabel events
 *
 * Field baru:
 * - endDate  : varchar(20), nullable — untuk event multi-hari
 * - allDay   : boolean, default false — penanda event sepanjang hari
 * - color    : varchar(20), default 'blue' — warna chip di kalender
 *
 * Usage:
 *   tsx db/add_calendar_fields_to_events.ts
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const conn = await mysql.createConnection(url);

  console.log('Adding calendar fields to events table...');

  const statements = [
    "ALTER TABLE events ADD COLUMN end_date VARCHAR(20) NULL AFTER date",
    "ALTER TABLE events ADD COLUMN all_day BOOLEAN NOT NULL DEFAULT FALSE",
    "ALTER TABLE events ADD COLUMN color VARCHAR(20) NOT NULL DEFAULT 'blue'",
  ];

  for (const sql of statements) {
    try {
      await conn.query(sql);
      console.log(`✓ ${sql}`);
    } catch (err: any) {
      // kolom sudah ada = skip (idempotent)
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log(`- skipped (exists): ${sql}`);
      } else {
        throw err;
      }
    }
  }

  await conn.end();
  console.log('\nDone. Schema ready untuk CalendarGrid.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
