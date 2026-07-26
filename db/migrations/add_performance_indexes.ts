/**
 * Migration: Index performa untuk kolom FK & kolom filter
 *
 * Sebelum ini hanya `event_rsvps` dan `event_committees` yang punya index.
 * Kolom yang dipakai untuk JOIN dan WHERE di jalur paling panas (homepage,
 * direktori anggota, kalender) tidak terindeks sama sekali sehingga MySQL
 * melakukan full table scan.
 *
 * Sifatnya aditif — tidak ada kolom/tabel/data yang diubah atau dihapus.
 * Aman dijalankan berulang kali (cek dulu ke information_schema).
 *
 * Run: npx tsx db/migrations/add_performance_indexes.ts
 *
 * Date: 2026-07-26
 */

import { db } from '../index';
import { sql } from 'drizzle-orm';

type IndexSpec = {
  table: string;
  name: string;
  columns: string[];
  reason: string;
};

const INDEXES: IndexSpec[] = [
  {
    table: 'members',
    name: 'idx_members_generation_id',
    columns: ['generation_id'],
    reason: 'FK — LEFT JOIN generations di /api/member/directory',
  },
  {
    table: 'members',
    name: 'idx_members_position_id',
    columns: ['position_id'],
    reason: 'FK — LEFT JOIN positions di homepage & /api/members',
  },
  {
    table: 'members',
    name: 'idx_members_email',
    columns: ['email'],
    reason: 'Grouping riwayat generasi di /api/member/directory',
  },
  {
    table: 'members',
    name: 'idx_members_show_public',
    columns: ['show_public'],
    reason: 'WHERE show_public = true di homepage & /api/members',
  },
  {
    table: 'positions',
    name: 'idx_positions_name',
    columns: ['name'],
    reason: 'Lookup by name di resolvePositionId() (POST /api/members)',
  },
  {
    table: 'events',
    name: 'idx_events_date',
    columns: ['date'],
    reason: 'Rentang tanggal + ORDER BY di /api/calendar/events',
  },
  {
    table: 'events',
    name: 'idx_events_type_date',
    columns: ['event_type', 'date'],
    reason: 'scope=public → WHERE event_type = ? AND date BETWEEN ? AND ?',
  },
  {
    table: 'events',
    name: 'idx_events_type_status',
    columns: ['event_type', 'status'],
    reason: 'Filter /api/member/events?type=&status=',
  },
  {
    table: 'event_materials',
    name: 'idx_event_materials_event',
    columns: ['event_id'],
    reason: 'FK — selalu di-query per event',
  },
];

/**
 * Cek index yang sudah ada berdasarkan KOMBINASI KOLOM, bukan cuma namanya.
 *
 * Cek per-nama saja tidak cukup: `event_materials` sudah punya index pada
 * (event_id) bernama `idx_event_materials_event` dari migrasi terdahulu, jadi
 * membuat index bernama lain pada kolom yang sama hanya menghasilkan duplikat
 * — tidak mempercepat baca, tapi menambah beban tulis.
 *
 * Mengembalikan nama index yang cocok, atau null kalau belum ada.
 */
async function findExistingIndex(table: string, columns: string[]): Promise<string | null> {
  const [rows] = (await db.execute(sql`
    SELECT index_name AS indexName, seq_in_index AS seq, column_name AS columnName
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = ${table}
    ORDER BY index_name, seq_in_index
  `)) as unknown as [Array<Record<string, any>>, unknown];

  const byIndex = new Map<string, string[]>();
  for (const row of rows) {
    const key = String(row.indexName);
    if (!byIndex.has(key)) byIndex.set(key, []);
    byIndex.get(key)!.push(String(row.columnName));
  }

  const target = columns.join(',');
  for (const [indexName, cols] of byIndex) {
    // Index dianggap sudah menutupi kalau kolom targetnya adalah PREFIX-nya —
    // MySQL/TiDB bisa memakai index komposit untuk query pada kolom-kolom awal.
    if (cols.slice(0, columns.length).join(',') === target) return indexName;
  }
  return null;
}

async function migrate() {
  console.log('🚀 Migration: menambahkan index performa...\n');

  let created = 0;
  let skipped = 0;

  const touchedTables = new Set<string>();

  for (const spec of INDEXES) {
    const existing = await findExistingIndex(spec.table, spec.columns);
    if (existing) {
      console.log(`⏭️  ${spec.table}(${spec.columns.join(', ')}) sudah tercakup oleh \`${existing}\` — dilewati`);
      skipped++;
      continue;
    }

    // Nama tabel/index/kolom berasal dari konstanta di file ini, bukan input
    // pengguna — aman untuk di-inline lewat sql.raw().
    const columnList = spec.columns.map((c) => `\`${c}\``).join(', ');
    await db.execute(
      sql.raw(`CREATE INDEX \`${spec.name}\` ON \`${spec.table}\` (${columnList})`)
    );

    console.log(`✅ ${spec.name} pada ${spec.table}(${spec.columns.join(', ')})`);
    console.log(`   └─ ${spec.reason}`);
    created++;
    touchedTables.add(spec.table);
  }

  // Tanpa statistik, optimizer TiDB tidak akan memilih index yang baru dibuat.
  for (const table of touchedTables) {
    await db.execute(sql.raw(`ANALYZE TABLE \`${table}\``));
    console.log(`📊 ANALYZE TABLE ${table}`);
  }

  console.log(`\n🎉 Selesai. ${created} index dibuat, ${skipped} dilewati.`);

  if (created > 0) {
    console.log('\nCatatan:');
    console.log('- `idx_events_event_type` (dari migrasi lama) kini redundan karena');
    console.log('  `idx_events_type_date` sudah diawali kolom event_type.');
    console.log('  Opsional dibersihkan: DROP INDEX `idx_events_event_type` ON `events`;');
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
