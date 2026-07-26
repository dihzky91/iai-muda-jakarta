import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { adminRoute, publicRoute, fail, ok, done } from '@/lib/api';

type Params = { id: string };

const EDITORS = ['superadmin', 'admin', 'editor'] as const;

export const GET = publicRoute<Params>(async (_request, { params }) => {
  const { id } = await params;
  const article = await db.select().from(schema.articles).where(eq(schema.articles.id, parseInt(id))).limit(1);
  if (!article.length) {
    return fail('Article not found', 404);
  }
  return ok(article[0]);
}, 'Failed to fetch article');

export const PUT = adminRoute<Params>([...EDITORS], async (request, { params }) => {
  const { id } = await params;
  const { title, excerpt, content, date, author, imageUrl } = await request.json();

  await db.update(schema.articles).set({
    title: title || undefined,
    excerpt: excerpt !== undefined ? excerpt : undefined,
    content: content || undefined,
    date: date || undefined,
    author: author || undefined,
    imageUrl: imageUrl !== undefined ? imageUrl : undefined,
  }).where(eq(schema.articles.id, parseInt(id)));

  return done('Article updated successfully');
}, 'Failed to update article');

export const DELETE = adminRoute<Params>([...EDITORS], async (_request, { params }) => {
  const { id } = await params;

  await db.delete(schema.articles).where(eq(schema.articles.id, parseInt(id)));

  return done('Article deleted successfully');
}, 'Failed to delete article');
