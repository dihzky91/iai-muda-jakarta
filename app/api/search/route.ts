import { db, schema } from '@/lib/db';
import { sql, or, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ events: [], articles: [], members: [], partners: [] });
    }

    const qLower = query.toLowerCase();
    const words = qLower.split(/\s+/).filter(Boolean);

    if (words.length === 0) {
      return NextResponse.json({ events: [], articles: [], members: [], partners: [] });
    }

    const eventConditions = words.map((w) => {
      const term = `%${w}%`;
      return or(
        sql`LOWER(${schema.events.title}) LIKE ${term}`,
        sql`LOWER(${schema.events.description}) LIKE ${term}`,
        sql`LOWER(${schema.events.location}) LIKE ${term}`
      );
    });

    const articleConditions = words.map((w) => {
      const term = `%${w}%`;
      return or(
        sql`LOWER(${schema.articles.title}) LIKE ${term}`,
        sql`LOWER(${schema.articles.excerpt}) LIKE ${term}`,
        sql`LOWER(${schema.articles.author}) LIKE ${term}`
      );
    });

    const memberConditions = words.map((w) => {
      const term = `%${w}%`;
      return or(
        sql`LOWER(${schema.members.name}) LIKE ${term}`,
        sql`LOWER(${schema.members.division}) LIKE ${term}`,
        sql`LOWER(${schema.members.university}) LIKE ${term}`
      );
    });

    const partnerConditions = words.map((w) => {
      const term = `%${w}%`;
      return or(
        sql`LOWER(${schema.partners.name}) LIKE ${term}`,
        sql`LOWER(${schema.partners.university}) LIKE ${term}`,
        sql`LOWER(${schema.partners.category}) LIKE ${term}`
      );
    });

    const [events, articles, members, partners] = await Promise.all([
      db
        .select({
          id: schema.events.id,
          title: schema.events.title,
          description: schema.events.description,
          date: schema.events.date,
          status: schema.events.status,
        })
        .from(schema.events)
        .where(and(...eventConditions))
        .limit(10),

      db
        .select({
          id: schema.articles.id,
          title: schema.articles.title,
          excerpt: schema.articles.excerpt,
          category: schema.articles.category,
        })
        .from(schema.articles)
        .where(and(...articleConditions))
        .limit(10),

      db
        .select({
          id: schema.members.id,
          name: schema.members.name,
          division: schema.members.division,
          university: schema.members.university,
        })
        .from(schema.members)
        .where(and(...memberConditions))
        .limit(10),

      db
        .select({
          id: schema.partners.id,
          name: schema.partners.name,
          university: schema.partners.university,
          category: schema.partners.category,
        })
        .from(schema.partners)
        .where(and(...partnerConditions))
        .limit(10),
    ]);

    // Sort by relevance: items matching query in title/name come first
    events.sort((a, b) => (b.title.toLowerCase().includes(qLower) ? 1 : 0) - (a.title.toLowerCase().includes(qLower) ? 1 : 0));
    articles.sort((a, b) => (b.title.toLowerCase().includes(qLower) ? 1 : 0) - (a.title.toLowerCase().includes(qLower) ? 1 : 0));
    members.sort((a, b) => (b.name.toLowerCase().includes(qLower) ? 1 : 0) - (a.name.toLowerCase().includes(qLower) ? 1 : 0));
    partners.sort((a, b) => (b.name.toLowerCase().includes(qLower) ? 1 : 0) - (a.name.toLowerCase().includes(qLower) ? 1 : 0));

    return NextResponse.json({
      events,
      articles,
      members,
      partners,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ events: [], articles: [], members: [], partners: [] }, { status: 500 });
  }
}
