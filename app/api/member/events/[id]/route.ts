import { db } from '@/lib/db';
import { events, eventRsvps, eventCommittees, eventMaterials, members } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { memberRoute, fail, ok } from '@/lib/api';

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
type Params = { id: string };

export const GET = memberRoute<Params>(async (_request, { params }, user) => {
  const { id } = await params;
  const eventId = parseInt(id);
  if (isNaN(eventId)) {
    return fail('ID event tidak valid', 400);
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
    return fail('Event tidak ditemukan', 404);
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

  return ok({
  ...event,
  myRsvp: myRsvp ? { status: myRsvp.status, respondedAt: myRsvp.respondedAt } : null,
  stats,
  isCommittee,
  committeeRole: myCommittee?.committee.role,
  committees,
  materials,
  });
}, 'Failed to fetch event');
