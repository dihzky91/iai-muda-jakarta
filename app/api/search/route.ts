import { db, schema } from '@/lib/db';
import { like, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ events: [], articles: [], members: [], partners: [] });
    }

    const searchTerm = `%${query}%`;

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
        .where(
          or(
            like(schema.events.title, searchTerm),
            like(schema.events.description, searchTerm),
            like(schema.events.location, searchTerm)
          )
        )
        .limit(5),

      db
        .select({
          id: schema.articles.id,
          title: schema.articles.title,
          excerpt: schema.articles.excerpt,
          category: schema.articles.category,
        })
        .from(schema.articles)
        .where(
          or(
            like(schema.articles.title, searchTerm),
            like(schema.articles.excerpt, searchTerm)
          )
        )
        .limit(5),

      db
        .select({
          id: schema.members.id,
          name: schema.members.name,
          division: schema.members.division,
          university: schema.members.university,
        })
        .from(schema.members)
        .where(
          or(
            like(schema.members.name, searchTerm),
            like(schema.members.division, searchTerm),
            like(schema.members.university, searchTerm)
          )
        )
        .limit(5),

      db
        .select({
          id: schema.partners.id,
          name: schema.partners.name,
          university: schema.partners.university,
          category: schema.partners.category,
        })
        .from(schema.partners)
        .where(
          or(
            like(schema.partners.name, searchTerm),
            like(schema.partners.university, searchTerm),
            like(schema.partners.category, searchTerm)
          )
        )
        .limit(5),
    ]);

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
