/**
 * Migration: Add Onboarding Resources and Resource Reads Tables
 * 
 * Purpose: Enable Onboarding Library functionality with:
 * - resources table for managing document metadata and files
 * - resource_reads table for tracking member reading status
 * 
 * Date: 2026-07-28
 */

import 'dotenv/config';
import { db } from '../../lib/db';
import { sql } from 'drizzle-orm';


async function migrate() {
  console.log('🚀 Starting migration: Add Onboarding Resources and Resource Reads Tables...\n');

  try {
    // 1. Create resources table
    console.log('📝 Step 1: Creating resources table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS resources (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        file_url VARCHAR(500) NOT NULL,
        file_name VARCHAR(255),
        file_type VARCHAR(50),
        file_size INT,
        category VARCHAR(50) NOT NULL DEFAULT 'onboarding',
        subcategory VARCHAR(100),
        visibility VARCHAR(20) NOT NULL DEFAULT 'pengurus',
        sort_order INT DEFAULT 0,
        download_count INT DEFAULT 0,
        uploaded_by BIGINT UNSIGNED,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Created resources table');

    // 2. Create resource_reads table
    console.log('📝 Step 2: Creating resource_reads table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS resource_reads (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        resource_id BIGINT UNSIGNED NOT NULL,
        member_id BIGINT UNSIGNED NOT NULL,
        read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        UNIQUE KEY uniq_resource_member (resource_id, member_id),
        FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created resource_reads table');

    // 3. Create indexes for resources
    console.log('📝 Step 3: Creating performance indexes...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_resources_visibility ON resources(visibility)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_resources_sort_order ON resources(sort_order)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_resources_is_active ON resources(is_active)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_resource_reads_member_id ON resource_reads(member_id)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_resource_reads_resource_id ON resource_reads(resource_id)
    `);
    console.log('✅ Created indexes');

    console.log('\n🎉 Migration completed successfully!\n');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

migrate()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Error:', err);
    process.exit(1);
  });
