/**
 * Migration: Membuat semua tabel HR Command Center
 *
 * Tabel yang dibuat jika belum ada:
 * - member_statuses       → riwayat status anggota (Hijau/Kuning/Merah/Biru)
 * - member_academic_loads → beban akademik mingguan
 * - leave_requests        → pengajuan cuti
 * - intervention_logs     → log intervensi (SOP H+1 s/d H+21)
 * - monthly_evaluations   → evaluasi bulanan
 *
 * Run: npx tsx db/migrations/create_hr_tables.ts
 *
 * Date: 2026-07-28
 */

import { db } from '../index';
import { sql } from 'drizzle-orm';

async function tableExists(name: string): Promise<boolean> {
  const [rows] = (await db.execute(sql`
    SELECT 1 AS found
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = ${name}
    LIMIT 1
  `)) as unknown as [Array<Record<string, any>>, unknown];
  return rows.length > 0;
}

async function migrate() {
  console.log('🚀 Migration: membuat tabel HR Command Center...\n');

  // ========================================================================
  // 1. member_statuses
  // ========================================================================
  if (await tableExists('member_statuses')) {
    console.log('⏭️  member_statuses sudah ada.');
  } else {
    console.log('📦 Membuat member_statuses...');
    await db.execute(sql.raw(`
      CREATE TABLE \`member_statuses\` (
        \`id\` serial NOT NULL,
        \`member_id\` int NOT NULL,
        \`status\` enum('hijau','kuning','merah','biru') NOT NULL,
        \`reason\` text,
        \`changed_by\` int NOT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT (now()),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_member_statuses_member_created\` (\`member_id\`, \`created_at\`),
        INDEX \`idx_member_statuses_status\` (\`status\`),
        INDEX \`idx_member_statuses_changed_by\` (\`changed_by\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `));
    console.log('✅ member_statuses created.');
  }

  // ========================================================================
  // 2. member_academic_loads
  // ========================================================================
  if (await tableExists('member_academic_loads')) {
    console.log('⏭️  member_academic_loads sudah ada.');
  } else {
    console.log('📦 Membuat member_academic_loads...');
    await db.execute(sql.raw(`
      CREATE TABLE \`member_academic_loads\` (
        \`id\` serial NOT NULL,
        \`member_id\` int NOT NULL,
        \`week_start\` varchar(10) NOT NULL,
        \`load_type\` enum('uts','uas','quiz','project','sick','personal','other') NOT NULL,
        \`description\` text,
        \`intensity\` enum('low','medium','high') NOT NULL DEFAULT 'medium',
        \`created_at\` timestamp NOT NULL DEFAULT (now()),
        \`updated_at\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_member_academic_loads_member_week\` (\`member_id\`, \`week_start\`),
        INDEX \`idx_member_academic_loads_week_start\` (\`week_start\`),
        UNIQUE INDEX \`uniq_member_academic_loads_member_week\` (\`member_id\`, \`week_start\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `));
    console.log('✅ member_academic_loads created.');
  }

  // ========================================================================
  // 3. leave_requests
  // ========================================================================
  if (await tableExists('leave_requests')) {
    console.log('⏭️  leave_requests sudah ada.');
  } else {
    console.log('📦 Membuat leave_requests...');
    await db.execute(sql.raw(`
      CREATE TABLE \`leave_requests\` (
        \`id\` serial NOT NULL,
        \`member_id\` int NOT NULL,
        \`start_date\` varchar(10) NOT NULL,
        \`end_date\` varchar(10) NOT NULL,
        \`reason\` text NOT NULL,
        \`leave_type\` enum('regular','emergency') NOT NULL DEFAULT 'regular',
        \`status\` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
        \`reviewed_by\` int,
        \`reviewed_at\` timestamp,
        \`review_notes\` text,
        \`submitted_at\` timestamp NOT NULL DEFAULT (now()),
        \`created_at\` timestamp NOT NULL DEFAULT (now()),
        \`updated_at\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_leave_requests_member\` (\`member_id\`),
        INDEX \`idx_leave_requests_status\` (\`status\`),
        INDEX \`idx_leave_requests_member_status\` (\`member_id\`, \`status\`),
        INDEX \`idx_leave_requests_reviewed_by\` (\`reviewed_by\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `));
    console.log('✅ leave_requests created.');
  }

  // ========================================================================
  // 4. intervention_logs
  // ========================================================================
  if (await tableExists('intervention_logs')) {
    console.log('⏭️  intervention_logs sudah ada.');
  } else {
    console.log('📦 Membuat intervention_logs...');
    await db.execute(sql.raw(`
      CREATE TABLE \`intervention_logs\` (
        \`id\` serial NOT NULL,
        \`member_id\` int NOT NULL,
        \`stage\` enum('h1','h3','h3_h7','h7_zoom','h7_h14','h14_h21','post_h21') NOT NULL,
        \`notes\` text,
        \`action_taken\` text,
        \`performed_by\` int NOT NULL,
        \`scheduled_date\` varchar(10),
        \`completed_date\` varchar(10),
        \`is_active\` boolean NOT NULL DEFAULT true,
        \`created_at\` timestamp NOT NULL DEFAULT (now()),
        PRIMARY KEY (\`id\`),
        INDEX \`idx_intervention_logs_member\` (\`member_id\`),
        INDEX \`idx_intervention_logs_member_stage\` (\`member_id\`, \`stage\`),
        INDEX \`idx_intervention_logs_scheduled_completed\` (\`scheduled_date\`, \`completed_date\`),
        INDEX \`idx_intervention_logs_performed_by\` (\`performed_by\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `));
    console.log('✅ intervention_logs created.');
  }

  // ========================================================================
  // 5. monthly_evaluations
  // ========================================================================
  if (await tableExists('monthly_evaluations')) {
    console.log('⏭️  monthly_evaluations sudah ada.');
  } else {
    console.log('📦 Membuat monthly_evaluations...');
    await db.execute(sql.raw(`
      CREATE TABLE \`monthly_evaluations\` (
        \`id\` serial NOT NULL,
        \`member_id\` int NOT NULL,
        \`month\` varchar(7) NOT NULL,
        \`evaluation_notes\` text,
        \`action_items\` text,
        \`rating\` int,
        \`evaluated_by\` int NOT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT (now()),
        \`updated_at\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`uniq_monthly_evaluations_member_month\` (\`member_id\`, \`month\`),
        INDEX \`idx_monthly_evaluations_member\` (\`member_id\`),
        INDEX \`idx_monthly_evaluations_month\` (\`month\`),
        INDEX \`idx_monthly_evaluations_evaluated_by\` (\`evaluated_by\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `));
    console.log('✅ monthly_evaluations created.');
  }

  console.log('\n🎉 Migration selesai.');
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
