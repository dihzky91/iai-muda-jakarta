import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resources, resourceReads, members } from '@/db/schema';
import { eq, and, inArray, asc, desc } from 'drizzle-orm';
import { memberRoute } from '@/lib/api';

/**
 * GET /api/member/onboarding
 * Get onboarding resources for current member + read status + progress
 */
export const GET = memberRoute(async (_request, _context, memberPayload) => {
  // 1. Fetch current member details to check status & isAlumni
  const [currentMember] = await db
    .select({
      id: members.id,
      name: members.name,
      isAlumni: members.isAlumni,
      isActive: members.isActive,
    })
    .from(members)
    .where(eq(members.id, memberPayload.memberId))
    .limit(1);

  if (!currentMember) {
    return NextResponse.json(
      { success: false, message: 'Member profile not found' },
      { status: 404 }
    );
  }

  if (!currentMember.isActive) {
    return NextResponse.json(
      { success: false, message: 'Akun anggota Anda tidak aktif' },
      { status: 403 }
    );
  }

  // Permission Gate: Only active pengurus (isAlumni = false) are allowed access to onboarding page
  if (currentMember.isAlumni) {
    return NextResponse.json(
      {
        success: false,
        message: 'Halaman ini hanya untuk pengurus aktif',
        isAlumni: true,
      },
      { status: 403 }
    );
  }

  // 2. Fetch active onboarding resources for pengurus (visibility: 'pengurus' | 'both')
  const resourceList = await db
    .select()
    .from(resources)
    .where(
      and(
        eq(resources.category, 'onboarding'),
        eq(resources.isActive, true),
        inArray(resources.visibility, ['pengurus', 'both'])
      )
    )
    .orderBy(asc(resources.sortOrder), desc(resources.createdAt));

  // 3. Fetch read records for this member
  const memberReads = await db
    .select()
    .from(resourceReads)
    .where(eq(resourceReads.memberId, currentMember.id));

  const readMap = new Map<number, Date>();
  for (const readRecord of memberReads) {
    readMap.set(readRecord.resourceId, readRecord.readAt);
  }

  // 4. Combine resource data with read status
  const formattedResources = resourceList.map((item) => {
    const readAt = readMap.get(item.id);
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      fileUrl: item.fileUrl,
      fileName: item.fileName,
      fileType: item.fileType,
      fileSize: item.fileSize,
      category: item.category,
      subcategory: item.subcategory,
      visibility: item.visibility,
      sortOrder: item.sortOrder,
      downloadCount: item.downloadCount,
      isActive: item.isActive,
      createdAt: item.createdAt?.toISOString() || '',
      updatedAt: item.updatedAt?.toISOString() || '',
      isRead: !!readAt,
      readAt: readAt ? readAt.toISOString() : null,
    };
  });

  // 5. Calculate progress
  const total = formattedResources.length;
  const readCount = formattedResources.filter((r) => r.isRead).length;
  const percentage = total > 0 ? Math.round((readCount / total) * 100) : 0;

  return NextResponse.json({
    success: true,
    data: {
      resources: formattedResources,
      progress: {
        total,
        readCount,
        percentage,
      },
      member: {
        id: currentMember.id,
        name: currentMember.name,
        isAlumni: currentMember.isAlumni,
      },
    },
  });
}, 'Failed to fetch onboarding documents');
