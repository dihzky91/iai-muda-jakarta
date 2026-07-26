/**
 * API: /api/member/events/[id]/materials
 *
 * GET  : daftar materi sebuah event (semua anggota portal)
 * POST : unggah materi (hanya panitia event tersebut)
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eventMaterials, eventCommittees, members } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { memberRouteRaw, errorBody } from '@/lib/api';

type Params = { id: string };

/** Bentuk materi yang dikirim ke klien. */
function formatMaterial(material: typeof eventMaterials.$inferSelect, uploader: typeof members.$inferSelect | null) {
  return {
    id: material.id,
    eventId: material.eventId,
    title: material.title,
    fileUrl: material.fileUrl,
    fileType: material.fileType,
    uploadedBy: material.uploadedBy,
    createdAt: material.createdAt?.toISOString() || '',
    uploader: uploader
      ? { id: uploader.id, name: uploader.name, imageUrl: uploader.imageUrl }
      : undefined,
  };
}

export const GET = memberRouteRaw<Params>(async (_request, { params }) => {
  const { id } = await params;
  const eventId = parseInt(id);

  if (isNaN(eventId)) {
    return errorBody('Invalid event ID', 400);
  }

  const materials = await db
    .select({ material: eventMaterials, uploader: members })
    .from(eventMaterials)
    .leftJoin(members, eq(eventMaterials.uploadedBy, members.id))
    .where(eq(eventMaterials.eventId, eventId));

  return NextResponse.json({
    materials: materials.map(m => formatMaterial(m.material, m.uploader)),
  });
}, 'Failed to fetch materials', 'Error fetching materials:');

export const POST = memberRouteRaw<Params>(async (request, { params }, member) => {
  const { id } = await params;
  const eventId = parseInt(id);

  if (isNaN(eventId)) {
    return errorBody('Invalid event ID', 400);
  }

  const [committee] = await db
    .select()
    .from(eventCommittees)
    .where(
      and(
        eq(eventCommittees.eventId, eventId),
        eq(eventCommittees.memberId, member.memberId)
      )
    )
    .limit(1);

  if (!committee) {
    return errorBody('Forbidden: Only committee members can upload materials', 403);
  }

  const { title, fileUrl, fileType } = await request.json();

  if (!title || !fileUrl) {
    return errorBody('Title and fileUrl are required', 400);
  }

  const [inserted] = await db
    .insert(eventMaterials)
    .values({
      eventId,
      title,
      fileUrl,
      fileType: fileType || null,
      uploadedBy: member.memberId,
    })
    .$returningId();

  const [created] = await db
    .select({ material: eventMaterials, uploader: members })
    .from(eventMaterials)
    .leftJoin(members, eq(eventMaterials.uploadedBy, members.id))
    .where(eq(eventMaterials.id, inserted.id));

  return NextResponse.json(
    {
      message: 'Material uploaded successfully',
      material: formatMaterial(created.material, created.uploader),
    },
    { status: 201 }
  );
}, 'Failed to upload material', 'Error uploading material:');
