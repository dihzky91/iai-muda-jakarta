import { db, schema } from './index';
import { asc } from 'drizzle-orm';

async function checkTable() {
  try {
    const data = await db
      .select({
        id: schema.partners.id,
        name: schema.partners.name,
        university: schema.partners.university,
        category: schema.partners.category,
        sortOrder: schema.partners.sortOrder,
        isActive: schema.partners.isActive,
      })
      .from(schema.partners)
      .orderBy(asc(schema.partners.sortOrder));

    console.log('Partners table exists. Rows:', data.length);
    console.log(JSON.stringify(data, null, 2));
  } catch (error: any) {
    console.error('Error:', error?.code || error?.message || error);
  }
  process.exit(0);
}

checkTable();