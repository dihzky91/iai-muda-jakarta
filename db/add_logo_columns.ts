import { db } from './index';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    await db.execute(sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500)`);
    await db.execute(sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS favicon_url VARCHAR(500)`);
    console.log('✓ Columns logo_url and favicon_url added to settings');
  } catch (err) {
    console.error('Error adding columns:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
