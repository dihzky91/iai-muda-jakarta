/**
 * Migration: UNIQUE constraint (name, category) pada tabel positions
 *
 * Mencegah duplikasi posisi dengan nama dan kategori yang sama.
 * Contoh: dua baris "Ketua" dengan category "Harian" tidak boleh ada.
 *
 * Sebelum menambah constraint, migration ini akan:
 * 1. Mendeteksi duplikat existing berdasarkan (name, category)
 * 2. Menampilkan duplikat dan meminta konfirmasi (atau auto-abort jika ada)
 * 3. Menambahkan UNIQUE INDEX (idempoten — cek dulu ke information_schema)
 *
 * Run: npx tsx db/migrations/add_positions_unique_constraint.ts
 *
 * Date: 2026-07-27
 */

import { db } from '../index';
import { sql } from 'drizzle-orm';

async function findDuplicates(): Promise<Array<Record<string, any>>> {
  const [rows] = (await db.execute(sql`
    SELECT p.name, p.category, COUNT(*) AS cnt, GROUP_CONCAT(p.id ORDER BY p.id) AS ids
    FROM positions p
    GROUP BY p.name, p.category
    HAVING COUNT(*) > 1
  `)) as unknown as [Array<Record<string, any>>, unknown];
  return rows;
}

async function uniqueIndexExists(): Promise<boolean> {
  const [rows] = (await db.execute(sql`
    SELECT 1 AS found
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'positions'
      AND index_name = 'uniq_positions_name_category'
    LIMIT 1
  `)) as unknown as [Array<Record<string, any>>, unknown];
  return rows.length > 0;
}

async function migrate() {
  console.log('🚀 Migration: menambah UNIQUE constraint (name, category) pada positions...\n');

  if (await uniqueIndexExists()) {
    console.log('⏭️  `uniq_positions_name_category` sudah ada — dilewati.');
    process.exit(0);
  }

  const duplicates = await findDuplicates();

  if (duplicates.length > 0) {
    console.error('❌ Duplikat (name, category) ditemukan — migration dibatalkan.\n');
    for (const dup of duplicates) {
      console.error(`   "${dup.name}" (${dup.category}) → ${dup.cnt} baris, id: ${dup.ids}`);
    }
    console.error('\nLangkah perbaikan:');
    console.error('  1. Identifikasi baris mana yang perlu dipertahankan.');
    console.error('  2. Hapus duplikat dengan query:');
    console.error('     DELETE FROM positions WHERE id NOT IN (keep_ids...)');
    console.error('  3. Jalankan migration lagi.');
    process.exit(1);
  }

  console.log('✅ Tidak ada duplikat — melanjutkan...\n');

  await db.execute(sql.raw(
    'CREATE UNIQUE INDEX `uniq_positions_name_category` ON `positions` (`name`, `category`)'
  ));

  console.log('✅ `uniq_positions_name_category` berhasil dibuat pada positions(name, category).');
  console.log('📊 ANALYZE TABLE positions...');

  await db.execute(sql.raw('ANALYZE TABLE `positions`'));

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
