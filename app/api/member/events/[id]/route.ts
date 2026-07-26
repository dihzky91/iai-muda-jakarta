import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events, eventRsvps, eventCommittees, eventMaterials, members } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getUserFromRequest, requireMember } from '@/lib/auth';

/**
 * Detail satu event untuk portal anggota.
 *
 * Response sudah termasuk info kepanitiaan (`isCommittee`, `committeeRole`,
 * `committees`, `materials`) supaya halaman detail tidak perlu ikut memanggil
 * /api/member/events/managed — endpoint itu menarik SELURUH event yang dikelola
 * beserta panitia dan materinya, hanya untuk mencari satu baris yang cocok.
 *
 * `committees` dan `materials` hanya diisi kalau member memang panitia event
 * ini, menyamai perilaku endpoint managed sebelumnya.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!requireMember(user)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      return NextResponse.json({ success: false, message: 'ID event tidak valid' }, { status: 400 });
    }

    const memberId = user.memberId;

    // Keempatnya saling independen dan sudah dibatasi ke satu event.
    const [eventList, allRsvps, committeeRows, materialRows] = await Promise.all([
      db.select().from(events).where(eq(events.id, eventId)).limit(1),
      db.select().from(eventRsvps).where(eq(eventRsvps.eventId, eventId)),
      db
        .select({ committee: eventCommittees, member: members })
        .from(eventCommittees)
        .innerJoin(members, eq(eventCommittees.memberId, members.id))
        .where(eq(eventCommittees.eventId, eventId)),
      db
        .select({ material: eventMaterials, uploader: members })
        .from(eventMaterials)
        .leftJoin(members, eq(eventMaterials.uploadedBy, members.id))
        .where(eq(eventMaterials.eventId, eventId)),
    ]);

    if (eventList.length === 0) {
      return NextResponse.json({ success: false, message: 'Event tidak ditemukan' }, { status: 404 });
    }

    const event = eventList[0];

    // RSVP milik member diturunkan dari daftar yang sudah diambil untuk stats,
    // jadi tidak perlu query terpisah.
    const myRsvp = allRsvps.find(r => r.memberId === memberId) || null;

    const stats = {
      totalAttending: allRsvps.filter(r => r.status === 'attending').length,
      totalNotAttending: allRsvps.filter(r => r.status === 'not_attending').length,
      totalMaybe: allRsvps.filter(r => r.status === 'maybe').length,
      totalResponded: allRsvps.length,
    };

    const myCommittee = committeeRows.find(c => c.committee.memberId === memberId);
    const isCommittee = Boolean(myCommittee);

    const committees = isCommittee
      ? committeeRows.map(c => ({
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
        }))
      : [];

    const materials = isCommittee
      ? materialRows.map(m => ({
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
        }))
      : [];

    return NextResponse.json({
      success: true,
      data: {
        ...event,
        myRsvp: myRsvp ? { status: myRsvp.status, respondedAt: myRsvp.respondedAt } : null,
        stats,
        isCommittee,
        committeeRole: myCommittee?.committee.role,
        committees,
        materials,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Failed to fetch event' }, { status: 500 });
  }
}
