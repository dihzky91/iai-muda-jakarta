import { db, schema } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';
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

    // Get latest status for each member via subquery
    const latestStatuses = await db
      .select({
        memberId: schema.memberStatuses.memberId,
        status: schema.memberStatuses.status,
        reason: schema.memberStatuses.reason,
        createdAt: schema.memberStatuses.createdAt,
      })
      .from(schema.memberStatuses)
      .where(
        sql`(${schema.memberStatuses.memberId}, ${schema.memberStatuses.createdAt}) IN (
          SELECT ms2.member_id, MAX(ms2.created_at)
          FROM member_statuses ms2
          GROUP BY ms2.member_id
        )`
      );

    const statusMap = new Map(
      latestStatuses.map(s => [
        s.memberId,
        { status: s.status, reason: s.reason, lastUpdated: s.createdAt },
      ])
    );

    const membersWithStatus = members.map(member => ({
      ...member,
      currentStatus: statusMap.get(member.id) || null,
    }));

    return ok(membersWithStatus);
  },
  'Failed to fetch HR members'
);
