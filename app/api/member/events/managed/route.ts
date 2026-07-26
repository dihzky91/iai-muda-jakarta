/**
 * API: GET /api/member/events/managed
 *
 * Daftar event yang dikelola anggota ini (dia terdaftar sebagai panitia).
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events, eventCommittees, eventMaterials, members } from '@/db/schema';
import { eq, inArray, desc } from 'drizzle-orm';
import { memberRouteRaw } from '@/lib/api';

export const GET = memberRouteRaw(async (_request, _context, member) => {
  const memberId = member.memberId;

  const managedEvents = await db
    .select({ event: events, committee: eventCommittees })
    .from(eventCommittees)
    .innerJoin(events, eq(eventCommittees.eventId, events.id))
    .where(eq(eventCommittees.memberId, memberId))
    .orderBy(desc(events.date));

  const eventIds = [...new Set(managedEvents.map(item => item.event.id))];

  if (eventIds.length === 0) {
    return NextResponse.json({ events: [] });
  }

  // inArray, bukan or(...map(eq)) — satu predikat IN (...) alih-alih rantai OR
  // sepanjang jumlah event.
  const [allCommittees, allMaterials] = await Promise.all([
    db
      .select({ committee: eventCommittees, member: members })
      .from(eventCommittees)
      .innerJoin(members, eq(eventCommittees.memberId, members.id))
      .where(inArray(eventCommittees.eventId, eventIds)),
    db
      .select({ material: eventMaterials, uploader: members })
      .from(eventMaterials)
      .leftJoin(members, eq(eventMaterials.uploadedBy, members.id))
      .where(inArray(eventMaterials.eventId, eventIds)),
  ]);

  const enrichedEvents = managedEvents
    .filter((item, index, self) => index === self.findIndex(t => t.event.id === item.event.id))
    .map(item => {
      const committees = allCommittees
        .filter(c => c.committee.eventId === item.event.id)
        .map(c => ({
          id: c.committee.id,
          eventId: c.committee.eventId,
          memberId: c.committee.memberId,
          role: c.committee.role,
          createdAt: c.committee.createdAt?.toISOString() || '',
          member: {
            id: c.member.id,
            name: c.member.name,
            imageUrl: c.member.imageUrl,
            position: c.member.division || '',
            division: c.member.division,
          },
        }));

      const materials = allMaterials
        .filter(m => m.material.eventId === item.event.id)
        .map(m => ({
          id: m.material.id,
          eventId: m.material.eventId,
          title: m.material.title,
          fileUrl: m.material.fileUrl,
          fileType: m.material.fileType,
          uploadedBy: m.material.uploadedBy,
          createdAt: m.material.createdAt?.toISOString() || '',
          uploader: m.uploader
            ? { id: m.uploader.id, name: m.uploader.name, imageUrl: m.uploader.imageUrl }
            : undefined,
        }));

      return {
        ...item.event,
        committees,
        materials,
        isCommittee: true,
        committeeRole: committees.find(c => c.memberId === memberId)?.role,
      };
    });

  return NextResponse.json({ events: enrichedEvents });
}, 'Failed to fetch managed events', 'Error fetching managed events:');
