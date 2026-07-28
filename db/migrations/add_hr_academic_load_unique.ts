/**
 * Migration: UNIQUE constraint (member_id, week_start) pada member_academic_loads
 *
 * Mencegah duplikasi: 1 member hanya boleh punya 1 record academic load per minggu.
 *
 * Sebelum menambah constraint, migration akan:
 * 1. Cek apakah tabel sudah ada; jika belum, buat tabel dengan constraint included
 * 2. Mendeteksi duplikat existing berdasarkan (member_id, week_start)
 * 3. Jika ada duplikat, hapus duplikat dengan menyisakan record terbaru
 * 4. Menambahkan UNIQUE INDEX (idempoten)
 *
 * Run: npx tsx db/migrations/add_hr_academic_load_unique.ts
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
      AND table_name = 'member_academic_loads'
    LIMIT 1
  `)) as unknown as [Array<Record<string, any>>, unknown];
  return rows.length > 0;
}

async function findDuplicates(): Promise<Array<Record<string, any>>> {
  const [rows] = (await db.execute(sql`
    SELECT mal.member_id, mal.week_start, COUNT(*) AS cnt, GROUP_CONCAT(mal.id ORDER BY mal.id) AS ids
    FROM member_academic_loads mal
    GROUP BY mal.member_id, mal.week_start
    HAVING COUNT(*) > 1
  `)) as unknown as [Array<Record<string, any>>, unknown];
  return rows;
}

async function uniqueIndexExists(): Promise<boolean> {
  const [rows] = (await db.execute(sql`
    SELECT 1 AS found
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'member_academic_loads'
      AND index_name = 'uniq_member_academic_loads_member_week'
    LIMIT 1
  `)) as unknown as [Array<Record<string, any>>, unknown];
  return rows.length > 0;
}

async function migrate() {
  console.log('🚀 Migration: menambah UNIQUE constraint (member_id, week_start) pada member_academic_loads...\n');

  if (!(await tableExists())) {
    console.log('⚠️  Tabel `member_academic_loads` belum ada — membuat tabel baru...');

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS \`member_academic_loads\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`member_id\` int NOT NULL,
        \`week_start\` varchar(10) NOT NULL,
        \`load_type\` enum('uts','uas','quiz','project','sick','personal','other') NOT NULL,
        \`description\` text,
        \`intensity\` enum('low','medium','high') NOT NULL DEFAULT 'medium',
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_member_academic_loads_member_week\` (\`member_id\`, \`week_start\`),
        INDEX \`idx_member_academic_loads_week_start\` (\`week_start\`),
        UNIQUE INDEX \`uniq_member_academic_loads_member_week\` (\`member_id\`, \`week_start\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `));

    console.log('✅ Tabel `member_academic_loads` berhasil dibuat dengan UNIQUE constraint.');
    console.log('🎉 Migration selesai.');
    return;
  }

  if (await uniqueIndexExists()) {
    console.log('⏭️  `uniq_member_academic_loads_member_week` sudah ada — dilewati.');
    process.exit(0);
  }

  const duplicates = await findDuplicates();

  if (duplicates.length > 0) {
    console.log(`⚠️  Ditemukan ${duplicates.length} grup duplikat — membersihkan...\n`);

    for (const dup of duplicates) {
      const ids = (dup.ids as string).split(',').map(Number);
      // Simpan record dengan ID terbesar (terbaru), hapus sisanya
      const keepId = Math.max(...ids);
      const deleteIds = ids.filter(id => id !== keepId);

      console.log(`   Member ${dup.member_id}, week ${dup.week_start}: keep id=${keepId}, delete ids=[${deleteIds.join(',')}]`);

      await db.execute(sql.raw(
        `DELETE FROM member_academic_loads WHERE id IN (${deleteIds.join(',')})`
      ));
    }

    console.log('✅ Duplikat berhasil dibersihkan.\n');
  }

  await db.execute(sql.raw(
    'CREATE UNIQUE INDEX `uniq_member_academic_loads_member_week` ON `member_academic_loads` (`member_id`, `week_start`)'
  ));

  console.log('✅ `uniq_member_academic_loads_member_week` berhasil dibuat.');
  console.log('📊 ANALYZE TABLE member_academic_loads...');

  await db.execute(sql.raw('ANALYZE TABLE `member_academic_loads`'));

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
