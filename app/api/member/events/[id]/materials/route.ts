/**
 * API: /api/member/events/[id]/materials
 * 
 * GET: List materials for an event
 * POST: Upload material (only for committee members)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eventMaterials, eventCommittees, members } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyMemberToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
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

    // Get materials with uploader info
    const materials = await db
      .select({
        material: eventMaterials,
        uploader: members,
      })
      .from(eventMaterials)
      .leftJoin(members, eq(eventMaterials.uploadedBy, members.id))
      .where(eq(eventMaterials.eventId, eventId));

    const formattedMaterials = materials.map(m => ({
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

    return NextResponse.json({ materials: formattedMaterials });

  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch materials' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: 'Invalid event ID' },
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

    // Check if member is committee for this event
    const [committee] = await db
      .select()
      .from(eventCommittees)
      .where(
        and(
          eq(eventCommittees.eventId, eventId),
          eq(eventCommittees.memberId, memberId)
        )
      )
      .limit(1);

    if (!committee) {
      return NextResponse.json(
        { error: 'Forbidden: Only committee members can upload materials' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, fileUrl, fileType } = body;

    if (!title || !fileUrl) {
      return NextResponse.json(
        { error: 'Title and fileUrl are required' },
        { status: 400 }
      );
    }

    // Insert material
    const [material] = await db
      .insert(eventMaterials)
      .values({
        eventId,
        title,
        fileUrl,
        fileType: fileType || null,
        uploadedBy: memberId,
      })
      .$returningId();

    // Get the created material with uploader info
    const [createdMaterial] = await db
      .select({
        material: eventMaterials,
        uploader: members,
      })
      .from(eventMaterials)
      .leftJoin(members, eq(eventMaterials.uploadedBy, members.id))
      .where(eq(eventMaterials.id, material.id));

    return NextResponse.json({
      message: 'Material uploaded successfully',
      material: {
        id: createdMaterial.material.id,
        eventId: createdMaterial.material.eventId,
        title: createdMaterial.material.title,
        fileUrl: createdMaterial.material.fileUrl,
        fileType: createdMaterial.material.fileType,
        uploadedBy: createdMaterial.material.uploadedBy,
        createdAt: createdMaterial.material.createdAt?.toISOString() || '',
        uploader: createdMaterial.uploader ? {
          id: createdMaterial.uploader.id,
          name: createdMaterial.uploader.name,
          imageUrl: createdMaterial.uploader.imageUrl,
        } : undefined,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading material:', error);
    return NextResponse.json(
      { error: 'Failed to upload material' },
      { status: 500 }
    );
  }
}
