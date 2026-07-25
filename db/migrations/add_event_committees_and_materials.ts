/**
 * Migration: Add event_committees and event_materials tables + visibleToAlumni field
 * 
 * Purpose: Support Portal Event Menu feature (A1 + A2)
 * - event_committees: Mapping pengurus ke event (panitia)
 * - event_materials: Upload materi event (slide, notulensi, sertifikat)
 * - visibleToAlumni: Flag untuk event internal yang bisa dilihat alumni
 * 
 * Date: 2026-07-25
 */

import { db } from '../index';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('🚀 Starting migration: add_event_committees_and_materials');

  try {
    // 1. Add visibleToAlumni field to events table
    console.log('Adding visibleToAlumni field to events table...');
    try {
      await db.execute(sql`
        ALTER TABLE events 
        ADD COLUMN visible_to_alumni BOOLEAN NOT NULL DEFAULT FALSE 
        AFTER event_type
      `);
      console.log('✅ Added visibleToAlumni field');
    } catch (err: any) {
      if (err.cause?.code === 'ER_DUP_FIELDNAME' || err.cause?.errno === 1060) {
        console.log('⚠️  Field visibleToAlumni already exists, skipping');
      } else {
        throw err;
      }
    }

    // 2. Create event_committees table
    console.log('Creating event_committees table...');
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS event_committees (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          event_id BIGINT UNSIGNED NOT NULL,
          member_id BIGINT UNSIGNED NOT NULL,
          role VARCHAR(100) NOT NULL COMMENT 'ketua_panitia, acara, humasi, etc',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
          FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
          UNIQUE KEY uniq_event_member_role (event_id, member_id, role),
          INDEX idx_event_committees_event (event_id),
          INDEX idx_event_committees_member (member_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Created event_committees table');
    } catch (err: any) {
      if (err.cause?.code === 'ER_TABLE_EXISTS_ERROR' || err.message?.includes('already exists')) {
        console.log('⚠️  Table event_committees already exists, skipping');
      } else {
        throw err;
      }
    }

    // 3. Create event_materials table
    console.log('Creating event_materials table...');
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS event_materials (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          event_id BIGINT UNSIGNED NOT NULL,
          title VARCHAR(255) NOT NULL,
          file_url VARCHAR(500) NOT NULL,
          file_type VARCHAR(50) NULL COMMENT 'slide, notulensi, sertifikat, foto',
          uploaded_by BIGINT UNSIGNED NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
          FOREIGN KEY (uploaded_by) REFERENCES members(id) ON DELETE SET NULL,
          INDEX idx_event_materials_event (event_id),
          INDEX idx_event_materials_uploader (uploaded_by)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Created event_materials table');
    } catch (err: any) {
      if (err.cause?.code === 'ER_TABLE_EXISTS_ERROR' || err.message?.includes('already exists')) {
        console.log('⚠️  Table event_materials already exists, skipping');
      } else {
        throw err;
      }
    }

    console.log('');
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log('   - Added visibleToAlumni field to events');
    console.log('   - Created event_committees table');
    console.log('   - Created event_materials table');
    console.log('');
    console.log('🔍 Verify with:');
    console.log('   DESCRIBE events;');
    console.log('   DESCRIBE event_committees;');
    console.log('   DESCRIBE event_materials;');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

migrate()
  .then(() => {
    console.log('Migration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script error:', error);
    process.exit(1);
  });
