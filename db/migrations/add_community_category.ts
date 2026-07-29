import { db } from '../index';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Checking and adding category column to community_posts table...');
  try {
    await db.execute(sql`ALTER TABLE community_posts ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'umum'`);
    console.log('Added category column successfully!');
  } catch (err: any) {
    if (err?.message?.includes('Duplicate column name') || err?.code === 'ER_DUP_FIELDNAME') {
      console.log('Category column already exists.');
    } else {
      console.error('Error adding category column:', err);
    }
  }

  try {
    await db.execute(sql`CREATE INDEX idx_posts_category ON community_posts(category)`);
    console.log('Added idx_posts_category index successfully!');
  } catch (err: any) {
    console.log('Index idx_posts_category might already exist or handled.');
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
