import { db } from './index';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    await db.execute(sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_banner_url VARCHAR(500)`);
    console.log('✓ Column hero_banner_url added to settings');
  } catch (err) {
    console.error('Error adding hero_banner_url column:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
