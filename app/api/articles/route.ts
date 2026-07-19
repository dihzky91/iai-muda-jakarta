import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { desc } from 'drizzle-orm';
import { getUserFromRequest, requireRole } from '@/lib/auth';

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

export async function GET(request: NextRequest) {
  try {
    const articles = await db.select().from(schema.articles).orderBy(schema.articles.date);
    return NextResponse.json({ success: true, data: articles });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!requireRole(user, 'superadmin', 'admin', 'editor')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { title, excerpt, content, date, author, imageUrl } = await request.json();

    const err = validate({
      title:   { value: title,   type: 'string', minLen: 5, maxLen: 255,  label: 'Judul artikel' },
      content: { value: content, type: 'string', minLen: 50,              label: 'Konten artikel' },
      author:  { value: author,  type: 'string', minLen: 2, maxLen: 255,  label: 'Nama penulis' },
      date:    { value: date,    type: 'string', regex: /^\d{4}-\d{2}-\d{2}$/, label: 'Tanggal (format YYYY-MM-DD)' },
    });
    if (err) return NextResponse.json({ success: false, message: err }, { status: 400 });

    const result = await db.insert(schema.articles).values({
      title,
      excerpt: excerpt || null,
      content,
      date,
      author,
      imageUrl: imageUrl || null,
    });

    return NextResponse.json({ success: true, message: 'Article created successfully', id: (result as any).insertId });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to create article' }, { status: 500 });
  }
}
