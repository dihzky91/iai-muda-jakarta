import { db } from './index';
import { sql } from 'drizzle-orm';

async function checkTable() {
  try {
    const result = await db.execute(sql`DESCRIBE members`);
    console.log('Members table structure:');
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkTable();
