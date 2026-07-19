import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const article = await db.select().from(schema.articles).where(eq(schema.articles.id, parseInt(id))).limit(1);
    if (!article.length) {
      return NextResponse.json({ success: false, message: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: article[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch article' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin', 'editor')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { title, excerpt, content, date, author, imageUrl } = await request.json();
    const articleId = parseInt(id);

    await db.update(schema.articles).set({
      title: title || undefined,
      excerpt: excerpt !== undefined ? excerpt : undefined,
      content: content || undefined,
      date: date || undefined,
      author: author || undefined,
      imageUrl: imageUrl !== undefined ? imageUrl : undefined,
    }).where(eq(schema.articles.id, articleId));

    return NextResponse.json({ success: true, message: 'Article updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin', 'editor')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const articleId = parseInt(id);

    await db.delete(schema.articles).where(eq(schema.articles.id, articleId));

    return NextResponse.json({ success: true, message: 'Article deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to delete article' }, { status: 500 });
  }
}
