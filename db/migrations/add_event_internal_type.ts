/**
 * Migration: Add Event Internal Type & RSVP Table
 *
 * Purpose: Enable Portal Anggota event features:
 * - eventType column in events table ('public' | 'internal')
 * - event_rsvps table for RSVP tracking (A2)
 *
 * Run: npx tsx db/migrations/add_event_internal_type.ts
 *      (or: npx drizzle-kit push)
 *
 * Date: 2026-07-23
 */

import { db } from '../index';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('🚀 Starting migration: Add Event Internal Type & RSVP Table...\n');

  try {
    // 1. Add eventType column to events table
    console.log('📝 Step 1: Adding eventType column to events table...');

    await db.execute(sql`
      ALTER TABLE events
      ADD COLUMN IF NOT EXISTS event_type VARCHAR(20) DEFAULT 'public' NOT NULL
    `);

    console.log('✅ Added column: event_type (default: public)\n');

    // 2. Create event_rsvps table
    console.log('📝 Step 2: Creating event_rsvps table...');

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS event_rsvps (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        event_id BIGINT UNSIGNED NOT NULL,
        member_id BIGINT UNSIGNED NOT NULL,
        status VARCHAR(20) DEFAULT 'attending' NOT NULL,
        responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        UNIQUE KEY uniq_event_member (event_id, member_id),
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Created event_rsvps table with foreign keys to events & members\n');

    // 3. Create indexes for performance
    console.log('📝 Step 3: Creating indexes...');

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type)
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON event_rsvps(event_id)
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_event_rsvps_member_id ON event_rsvps(member_id)
    `);

    console.log('✅ Created indexes for optimized queries\n');

    console.log('🎉 Migration completed successfully!\n');
    console.log('Summary:');
    console.log('- Added event_type column to events table');
    console.log('- Created event_rsvps table');
    console.log('- Added 3 indexes for performance');
    console.log('\nNext steps:');
    console.log('1. Update db/schema.ts to reflect these changes');
    console.log('2. Run: npx drizzle-kit push (if using Drizzle migrations)');
    console.log('3. Test API: GET /api/member/events');

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
