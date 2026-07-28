import { db, schema } from '@/lib/db';
import { eq, desc, sql } from 'drizzle-orm';
import { adminRoute, ok } from '@/lib/api';

/**
 * GET /api/hr/members
 * List all members with their current status
 */
export const GET = adminRoute(
  ['superadmin', 'admin'],
  async (_request, _context, _user) => {
    // Get all active members with their generation and position
    const members = await db
      .select({
        id: schema.members.id,
        name: schema.members.name,
        email: schema.members.email,
        division: schema.members.division,
        university: schema.members.university,
        imageUrl: schema.members.imageUrl,
        generationName: schema.generations.name,
        positionName: schema.positions.name,
        isActive: schema.members.isActive,
        isAlumni: schema.members.isAlumni,
      })
      .from(schema.members)
      .leftJoin(schema.generations, eq(schema.members.generationId, schema.generations.id))
      .leftJoin(schema.positions, eq(schema.members.positionId, schema.positions.id))
      .orderBy(schema.members.name);

    // Get latest status for each member
    const allStatuses = await db
      .select({
        memberId: schema.memberStatuses.memberId,
        status: schema.memberStatuses.status,
        reason: schema.memberStatuses.reason,
        createdAt: schema.memberStatuses.createdAt,
      })
      .from(schema.memberStatuses)
      .orderBy(desc(schema.memberStatuses.createdAt));

    // Map latest status per member
    const statusMap = new Map();
    for (const status of allStatuses) {
      if (!statusMap.has(status.memberId)) {
        statusMap.set(status.memberId, {
          status: status.status,
          reason: status.reason,
          lastUpdated: status.createdAt,
        });
      }
    }

    // Combine members with their status
    const membersWithStatus = members.map(member => ({
      ...member,
      currentStatus: statusMap.get(member.id) || null,
    }));

    return ok(membersWithStatus);
  },
  'Failed to fetch HR members'
);
