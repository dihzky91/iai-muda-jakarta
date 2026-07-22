/**
 * Migration: Add Member Portal Tables & Columns
 * 
 * Purpose: Enable member portal functionality with:
 * - member_accounts table for authentication
 * - Additional columns in members table (phone, whatsapp, isAlumni, showPublic)
 * 
 * Run: npx drizzle-kit push
 * 
 * Date: 2026-07-22
 */

import { db } from '../index';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('🚀 Starting migration: Add Member Portal Tables & Columns...\n');

  try {
    // 1. Add new columns to members table
    console.log('📝 Step 1: Adding columns to members table...');
    
    await db.execute(sql`
      ALTER TABLE members 
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20) DEFAULT NULL,
      ADD COLUMN IF NOT EXISTS is_alumni BOOLEAN DEFAULT FALSE NOT NULL,
      ADD COLUMN IF NOT EXISTS show_public BOOLEAN DEFAULT TRUE NOT NULL
    `);
    
    console.log('✅ Added columns: phone, whatsapp, is_alumni, show_public\n');

    // 2. Create member_accounts table
    console.log('📝 Step 2: Creating member_accounts table...');
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS member_accounts (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        member_id BIGINT UNSIGNED NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      )
    `);
    
    console.log('✅ Created member_accounts table with foreign key to members\n');

    // 3. Create index for performance
    console.log('📝 Step 3: Creating indexes...');
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_members_show_public ON members(show_public)
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_member_accounts_member_id ON member_accounts(member_id)
    `);
    
    console.log('✅ Created indexes for optimized queries\n');

    console.log('🎉 Migration completed successfully!\n');
    console.log('Summary:');
    console.log('- Added 4 columns to members table');
    console.log('- Created member_accounts table');
    console.log('- Added indexes for performance');
    console.log('\nNext step: Update db/schema.ts to reflect these changes');
    
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Error:', err);
    process.exit(1);
  });
