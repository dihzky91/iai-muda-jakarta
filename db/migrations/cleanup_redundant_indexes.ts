/**
 * ⚠️  Migration OPSIONAL: Hapus index redundan
 *
 * Index redundan adalah index yang kolom depannya sudah tercakup oleh
 * index komposit lain. Index seperti ini tidak pernah dipakai optimizer
 * (terlihat dari `EXPLAIN`) tetapi tetap memperlambat tulis dan memakan
 * storage — jadi aman dan disarankan untuk dibersihkan.
 *
 * Index yang akan di-drop:
 *
 * | # | Index                    | Table        | Alasan redundan                               |
 * |---|--------------------------|--------------|-----------------------------------------------|
 * | 1 | `idx_events_event_type`  | `events`     | Prefix dari `idx_events_type_date(event_type, date)` |
 * | 2 | `idx_positions_name`     | `positions`  | Prefix dari `uniq_positions_name_category(name, category)` |
 * | 3 | `idx_event_rsvps_event_id` | `event_rsvps` | Prefix dari `uniq_event_member_rsvp(event_id, member_id)` |
 *
 * Cara verifikasi di database:
 *   SELECT index_name, seq_in_index, column_name
 *   FROM information_schema.statistics
 *   WHERE table_schema = DATABASE() AND table_name = 'events'
 *   ORDER BY index_name, seq_in_index;
 *
 *   -- Hasil: idx_events_event_type (event_type) vs idx_events_type_date (event_type, date)
 *   -- Kolom pertama sama → idx_events_event_type redundant.
 *
 * ⚠️  REVIEW SEBELUM RUN DI PRODUKSI:
 *   1. Pastikan index komposit sudah ada:
 *        SHOW CREATE TABLE events;
 *        SHOW CREATE TABLE positions;
 *        SHOW CREATE TABLE event_rsvps;
 *   2. Print this file dan minta review lead developer.
 *   3. Jalankan di staging dulu, pantau query performance.
 *   4. Jika ragu, skip index tertentu dengan menghapus entry dari array REDUNDANT_INDEXES.
 *
 * Run: npx tsx db/migrations/cleanup_redundant_indexes.ts
 *
 * Date: 2026-07-27
 */

import { db } from '../index';
import { sql } from 'drizzle-orm';

type IndexSpec = {
  table: string;
  name: string;
  columns: string[];
  coveredBy: string;
};

const REDUNDANT_INDEXES: IndexSpec[] = [
  {
    table: 'events',
    name: 'idx_events_event_type',
    columns: ['event_type'],
    coveredBy: 'idx_events_type_date(event_type, date)',
  },
  {
    table: 'positions',
    name: 'idx_positions_name',
    columns: ['name'],
    coveredBy: 'uniq_positions_name_category(name, category)',
  },
  {
    table: 'event_rsvps',
    name: 'idx_event_rsvps_event_id',
    columns: ['event_id'],
    coveredBy: 'uniq_event_member_rsvp(event_id, member_id)',
  },
];

async function indexExists(table: string, indexName: string): Promise<boolean> {
  const [rows] = (await db.execute(sql`
    SELECT 1 AS found
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = ${table}
      AND index_name = ${indexName}
    LIMIT 1
  `)) as unknown as [Array<Record<string, any>>, unknown];
  return rows.length > 0;
}

async function migrate() {
  console.log('⚠️  Migration OPSIONAL: membersihkan index redundan...\n');
  console.log('Daftar index yang akan di-drop:\n');

  for (const spec of REDUNDANT_INDEXES) {
    const exists = await indexExists(spec.table, spec.name);
    const status = exists ? '⏳ ADA' : '❌ TIDAK ADA (dilewati)';
    console.log(`  ${spec.table}.${spec.name}`);
    console.log(`    Kolom: (${spec.columns.join(', ')})`);
    console.log(`    Redundan karena: ${spec.coveredBy}`);
    console.log(`    Status: ${status}\n`);
  }

  let dropped = 0;
  let skipped = 0;

  for (const spec of REDUNDANT_INDEXES) {
    const exists = await indexExists(spec.table, spec.name);
    if (!exists) {
      skipped++;
      continue;
    }

    console.log(`🗑️  DROP INDEX ${spec.name} ON ${spec.table}...`);
    await db.execute(sql.raw(
      `DROP INDEX \`${spec.name}\` ON \`${spec.table}\``
    ));
    console.log(`✅ ${spec.name} berhasil dihapus`);
    dropped++;
  }

  console.log(`\n🎉 Selesai. ${dropped} index di-drop, ${skipped} dilewati.`);

  if (dropped > 0) {
    console.log('\n📊 ANALYZE TABLE untuk optimizer...');
    const touched = new Set(REDUNDANT_INDEXES.map((s) => s.table));
    for (const table of touched) {
      await db.execute(sql.raw(`ANALYZE TABLE \`${table}\``));
      console.log(`  ANALYZE TABLE ${table} ✅`);
    }
  }
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
