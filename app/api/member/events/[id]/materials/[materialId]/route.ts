/**
 * API: DELETE /api/member/events/[id]/materials/[materialId]
 * 
 * Delete a material (only uploader or ketua_panitia can delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { eventMaterials, eventCommittees } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyMemberToken } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; materialId: string }> }
) {
  try {
    const { id, materialId: materialIdStr } = await params;
    const eventId = parseInt(id);
    const materialId = parseInt(materialIdStr);

    if (isNaN(eventId) || isNaN(materialId)) {
      return NextResponse.json(
        { error: 'Invalid event ID or material ID' },
        { status: 400 }
      );
    }

    // Verify member authentication
    const authResult = await verifyMemberToken(request);
    if (!authResult.valid || !authResult.memberId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const memberId = authResult.memberId;

    // Get the material
    const [material] = await db
      .select()
      .from(eventMaterials)
      .where(
        and(
          eq(eventMaterials.id, materialId),
          eq(eventMaterials.eventId, eventId)
        )
      )
      .limit(1);

    if (!material) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      );
    }

    // Check permission: uploader can delete their own material
    const isUploader = material.uploadedBy === memberId;

    // Or ketua_panitia can delete any material
    const [ketuaPanitia] = await db
      .select()
      .from(eventCommittees)
      .where(
        and(
          eq(eventCommittees.eventId, eventId),
          eq(eventCommittees.memberId, memberId),
          eq(eventCommittees.role, 'ketua_panitia')
        )
      )
      .limit(1);

    const isKetuaPanitia = !!ketuaPanitia;

    if (!isUploader && !isKetuaPanitia) {
      return NextResponse.json(
        { error: 'Forbidden: Only uploader or ketua_panitia can delete materials' },
        { status: 403 }
      );
    }

    // Delete the material
    await db
      .delete(eventMaterials)
      .where(eq(eventMaterials.id, materialId));

    return NextResponse.json({
      message: 'Material deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting material:', error);
    return NextResponse.json(
      { error: 'Failed to delete material' },
      { status: 500 }
    );
  }
}
