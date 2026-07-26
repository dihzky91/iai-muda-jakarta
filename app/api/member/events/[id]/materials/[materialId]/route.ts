/**
 * API: DELETE /api/member/events/[id]/materials/[materialId]
 *
 * Hapus materi. Hanya pengunggahnya sendiri atau ketua panitia event.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eventMaterials, eventCommittees } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { memberRouteRaw, errorBody } from '@/lib/api';

type Params = { id: string; materialId: string };

export const DELETE = memberRouteRaw<Params>(async (_request, { params }, member) => {
  const { id, materialId: materialIdStr } = await params;
  const eventId = parseInt(id);
  const materialId = parseInt(materialIdStr);

  if (isNaN(eventId) || isNaN(materialId)) {
    return errorBody('Invalid event ID or material ID', 400);
  }

  const [material] = await db
    .select()
    .from(eventMaterials)
    .where(and(eq(eventMaterials.id, materialId), eq(eventMaterials.eventId, eventId)))
    .limit(1);

  if (!material) {
    return errorBody('Material not found', 404);
  }

  const isUploader = material.uploadedBy === member.memberId;

  const [ketuaPanitia] = await db
    .select()
    .from(eventCommittees)
    .where(
      and(
        eq(eventCommittees.eventId, eventId),
        eq(eventCommittees.memberId, member.memberId),
        eq(eventCommittees.role, 'ketua_panitia')
      )
    )
    .limit(1);

  if (!isUploader && !ketuaPanitia) {
    return errorBody('Forbidden: Only uploader or ketua_panitia can delete materials', 403);
  }

  await db.delete(eventMaterials).where(eq(eventMaterials.id, materialId));

  return NextResponse.json({ message: 'Material deleted successfully' });
}, 'Failed to delete material', 'Error deleting material:');
