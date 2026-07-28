import { db, schema } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { adminRoute, ok, done, fail } from '@/lib/api';

/**
 * GET /api/hr/interventions
 * List intervention logs with optional member filter
 */
export const GET = adminRoute(
  ['superadmin', 'admin'],
  async (request, _context, _user) => {
    const { searchParams } = new URL(request.url);
    const memberIdParam = searchParams.get('memberId');

    let interventions;

    if (memberIdParam) {
      const memberId = parseInt(memberIdParam, 10);
      if (isNaN(memberId)) {
        return fail('Invalid member ID', 400);
      }

      interventions = await db
        .select({
          id: schema.interventionLogs.id,
          memberId: schema.interventionLogs.memberId,
          memberName: schema.members.name,
          stage: schema.interventionLogs.stage,
          notes: schema.interventionLogs.notes,
          actionTaken: schema.interventionLogs.actionTaken,
          scheduledDate: schema.interventionLogs.scheduledDate,
          completedDate: schema.interventionLogs.completedDate,
          createdAt: schema.interventionLogs.createdAt,
          performedBy: schema.users.username,
        })
        .from(schema.interventionLogs)
        .innerJoin(schema.members, eq(schema.interventionLogs.memberId, schema.members.id))
        .leftJoin(schema.users, eq(schema.interventionLogs.performedBy, schema.users.id))
        .where(eq(schema.interventionLogs.memberId, memberId))
        .orderBy(desc(schema.interventionLogs.createdAt));
    } else {
      interventions = await db
        .select({
          id: schema.interventionLogs.id,
          memberId: schema.interventionLogs.memberId,
          memberName: schema.members.name,
          stage: schema.interventionLogs.stage,
          notes: schema.interventionLogs.notes,
          actionTaken: schema.interventionLogs.actionTaken,
          scheduledDate: schema.interventionLogs.scheduledDate,
          completedDate: schema.interventionLogs.completedDate,
          createdAt: schema.interventionLogs.createdAt,
          performedBy: schema.users.username,
        })
        .from(schema.interventionLogs)
        .innerJoin(schema.members, eq(schema.interventionLogs.memberId, schema.members.id))
        .leftJoin(schema.users, eq(schema.interventionLogs.performedBy, schema.users.id))
        .orderBy(desc(schema.interventionLogs.createdAt))
        .limit(50);
    }

    return ok(interventions);
  },
  'Failed to fetch intervention logs'
);

/**
 * POST /api/hr/interventions
 * Create new intervention log
 */
export const POST = adminRoute(
  ['superadmin', 'admin'],
  async (request, _context, user) => {
    const body = await request.json();
    const { memberId, stage, notes, actionTaken, scheduledDate, completedDate } = body;

    // Validate required fields
    if (!memberId || !stage) {
      return fail('memberId and stage are required', 400);
    }

    const validStages = ['h1', 'h3', 'h3_h7', 'h7_zoom', 'h7_h14', 'h14_h21', 'post_h21'];
    if (!validStages.includes(stage)) {
      return fail(`Invalid stage. Must be one of: ${validStages.join(', ')}`, 400);
    }

    // Insert intervention log
    await db.insert(schema.interventionLogs).values({
      memberId: parseInt(memberId, 10),
      stage,
      notes: notes || null,
      actionTaken: actionTaken || null,
      performedBy: user.userId,
      scheduledDate: scheduledDate || null,
      completedDate: completedDate || null,
    });

    return done('Intervention log created successfully');
  },
  'Failed to create intervention log'
);
