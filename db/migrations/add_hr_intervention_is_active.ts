/**
 * Migration: Menambah kolom `is_active` pada tabel intervention_logs
 *
 * Kolom ini digunakan untuk auto-close intervention yang sudah lewat
 * tanpa completedDate. Default true, di-set false oleh sistem jika
 * intervention sudah stale (>30 hari tanpa completedDate).
 *
 * Jika tabel `intervention_logs` belum ada (HR tables belum di-deploy),
 * migration akan membuat tabel lengkap dengan semua kolom termasuk is_active.
 *
 * Run: npx tsx db/migrations/add_hr_intervention_is_active.ts
 *
 * Date: 2026-07-28
 */

import { db } from '../index';
import { sql } from 'drizzle-orm';

async function tableExists(): Promise<boolean> {
  const [rows] = (await db.execute(sql`
    SELECT 1 AS found
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'intervention_logs'
    LIMIT 1
  `)) as unknown as [Array<Record<string, any>>, unknown];
  return rows.length > 0;
}

async function columnExists(): Promise<boolean> {
  const [rows] = (await db.execute(sql`
    SELECT 1 AS found
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'intervention_logs'
      AND column_name = 'is_active'
    LIMIT 1
  `)) as unknown as [Array<Record<string, any>>, unknown];
  return rows.length > 0;
}

async function migrate() {
  console.log('🚀 Migration: menambah kolom is_active pada intervention_logs...\n');

  if (!(await tableExists())) {
    console.log('⚠️  Tabel `intervention_logs` belum ada — membuat tabel baru...');

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS \`intervention_logs\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`member_id\` int NOT NULL,
        \`stage\` enum('h1','h3','h3_h7','h7_zoom','h7_h14','h14_h21','post_h21') NOT NULL,
        \`notes\` text,
        \`action_taken\` text,
        \`performed_by\` int NOT NULL,
        \`scheduled_date\` varchar(10),
        \`completed_date\` varchar(10),
        \`is_active\` boolean NOT NULL DEFAULT true,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_intervention_logs_member\` (\`member_id\`),
        INDEX \`idx_intervention_logs_member_stage\` (\`member_id\`, \`stage\`),
        INDEX \`idx_intervention_logs_scheduled_completed\` (\`scheduled_date\`, \`completed_date\`),
        INDEX \`idx_intervention_logs_performed_by\` (\`performed_by\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `));

    console.log('✅ Tabel `intervention_logs` berhasil dibuat dengan kolom `is_active`.');
    console.log('🎉 Migration selesai.');
    return;
  }

  if (await columnExists()) {
    console.log('⏭️  Kolom `is_active` sudah ada — dilewati.');
    process.exit(0);
  }

  await db.execute(sql.raw(
    'ALTER TABLE `intervention_logs` ADD COLUMN `is_active` boolean NOT NULL DEFAULT true'
  ));

  console.log('✅ Kolom `is_active` berhasil ditambahkan.');
  console.log('📊 ANALYZE TABLE intervention_logs...');

  await db.execute(sql.raw('ANALYZE TABLE `intervention_logs`'));

  console.log('🎉 Migration selesai.');
}

migrate()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  });
