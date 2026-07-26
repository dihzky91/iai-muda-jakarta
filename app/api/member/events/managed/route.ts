/**
 * API: GET /api/member/events/managed
 * 
 * Get list of events yang saya kelola (events where I'm a committee member)
 * For Portal Anggota - Event Management (A1)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events, eventCommittees, eventMaterials, members } from '@/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { verifyMemberToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify member authentication
    const authResult = await verifyMemberToken(request);
    if (!authResult.valid || !authResult.memberId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const memberId = authResult.memberId;

    // Get all events where this member is a committee
    const managedEvents = await db
      .select({
        event: events,
        committee: eventCommittees,
      })
      .from(eventCommittees)
      .innerJoin(events, eq(eventCommittees.eventId, events.id))
      .where(eq(eventCommittees.memberId, memberId))
      .orderBy(desc(events.date));

    // Group by event and get committees + materials for each
    const eventIds = [...new Set(managedEvents.map(item => item.event.id))];
    
    if (eventIds.length === 0) {
      return NextResponse.json({ events: [] });
    }

    // Get all committees for these events
    const allCommittees = await db
      .select({
        committee: eventCommittees,
        member: members,
      })
      .from(eventCommittees)
      .innerJoin(members, eq(eventCommittees.memberId, members.id))
      .where(
        or(...eventIds.map(id => eq(eventCommittees.eventId, id)))
      );

    // Get all materials for these events
    const allMaterials = await db
      .select({
        material: eventMaterials,
        uploader: members,
      })
      .from(eventMaterials)
      .leftJoin(members, eq(eventMaterials.uploadedBy, members.id))
      .where(
        or(...eventIds.map(id => eq(eventMaterials.eventId, id)))
      );

    // Build response with full data
    const enrichedEvents = managedEvents
      .filter((item, index, self) => 
        // Remove duplicates
        index === self.findIndex(t => t.event.id === item.event.id)
      )
      .map(item => {
        const eventCommittees = allCommittees
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

        const eventMaterialsList = allMaterials
          .filter(m => m.material.eventId === item.event.id)
          .map(m => ({
            id: m.material.id,
            eventId: m.material.eventId,
            title: m.material.title,
            fileUrl: m.material.fileUrl,
            fileType: m.material.fileType,
            uploadedBy: m.material.uploadedBy,
            createdAt: m.material.createdAt?.toISOString() || '',
            uploader: m.uploader ? {
              id: m.uploader.id,
              name: m.uploader.name,
              imageUrl: m.uploader.imageUrl,
            } : undefined,
          }));

        // Find current user's role
        const myCommittee = eventCommittees.find(c => c.memberId === memberId);

        return {
          ...item.event,
          committees: eventCommittees,
          materials: eventMaterialsList,
          isCommittee: true,
          committeeRole: myCommittee?.role,
        };
      });

    return NextResponse.json({ events: enrichedEvents });

  } catch (error) {
    console.error('Error fetching managed events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch managed events' },
      { status: 500 }
    );
  }
}
