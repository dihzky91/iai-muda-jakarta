import { db, schema, insertedId } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';
import { adminRoute, publicRoute, fail, ok, done } from '@/lib/api';

let categoryColumnChecked = false;
async function ensureCategoryColumn() {
  if (categoryColumnChecked) return;
  try {
    await db.execute(sql`ALTER TABLE articles ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'public'`);
  } catch (_e) {
    // Column already exists or table alter ignored
  }
  categoryColumnChecked = true;
}

function validate(fields: Record<string, { value: unknown; minLen?: number; maxLen?: number; type?: string; enum?: string[]; regex?: RegExp; label: string }>) {
  for (const [, rule] of Object.entries(fields)) {
    const val = rule.value;
    if (val === undefined || val === null || val === '') {
      return `${rule.label} wajib diisi.`;
    }
    if (rule.type === 'string' && typeof val !== 'string') {
      return `${rule.label} harus berupa teks.`;
    }
    if (typeof val === 'string') {
      if (rule.minLen && val.trim().length < rule.minLen) {
        return `${rule.label} minimal ${rule.minLen} karakter.`;
      }
      if (rule.maxLen && val.trim().length > rule.maxLen) {
        return `${rule.label} maksimal ${rule.maxLen} karakter.`;
      }
      if (rule.regex && !rule.regex.test(val)) {
        return `${rule.label} formatnya tidak valid.`;
      }
    }
  }
  return null;
}

export const GET = publicRoute(async (request) => {
  await ensureCategoryColumn();

  const url = new URL(request.url);
  const categoryParam = url.searchParams.get('category');

  let articles;
  if (categoryParam) {
    articles = await db
      .select()
      .from(schema.articles)
      .where(eq(schema.articles.category, categoryParam))
      .orderBy(schema.articles.date);
  } else {
    articles = await db.select().from(schema.articles).orderBy(schema.articles.date);
  }

  return ok(articles);
}, 'Failed to fetch articles');

export const POST = adminRoute(['superadmin', 'admin', 'editor'], async (request) => {
  await ensureCategoryColumn();

  const { title, excerpt, content, date, author, imageUrl, category } = await request.json();

  const err = validate({
    title:   { value: title,   type: 'string', minLen: 5, maxLen: 255,  label: 'Judul artikel' },
    content: { value: content, type: 'string', minLen: 50,              label: 'Konten artikel' },
    author:  { value: author,  type: 'string', minLen: 2, maxLen: 255,  label: 'Nama penulis' },
    date:    { value: date,    type: 'string', regex: /^\d{4}-\d{2}-\d{2}$/, label: 'Tanggal (format YYYY-MM-DD)' },
  });
  if (err) return fail(err, 400);

  const validCategory = ['public', 'internal', 'agenda'].includes(category) ? category : 'public';

  const result = await db.insert(schema.articles).values({
    title,
    excerpt: excerpt || null,
    content,
    date,
    author,
    imageUrl: imageUrl || null,
    category: validCategory,
  });

  return done('Article created successfully', { id: insertedId(result) });
}, 'Failed to create article');
