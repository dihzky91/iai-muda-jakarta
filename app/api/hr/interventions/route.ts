import { db, schema } from '@/lib/db';
import { eq, desc, and, lte, isNull, SQL } from 'drizzle-orm';
import { adminRoute, ok, done, fail } from '@/lib/api';

/**
 * GET /api/hr/interventions
 * List intervention logs with optional member filter
 */
export const GET = adminRoute(
  ['superadmin', 'admin'],
  async (request, _context, user) => {
    const { searchParams } = new URL(request.url);
    const memberIdParam = searchParams.get('memberId');
    const showAll = searchParams.get('showAll') === 'true';

    // Auto-close: intervention yang scheduledDate > 30 hari lalu tanpa completedDate
    const wibNow = new Date(Date.now() + (new Date().getTimezoneOffset() + 420) * 60 * 1000);
    wibNow.setDate(wibNow.getDate() - 30);
    const y = wibNow.getFullYear();
    const m = String(wibNow.getMonth() + 1).padStart(2, '0');
    const d = String(wibNow.getDate()).padStart(2, '0');
    const cutoffDate = `${y}-${m}-${d}`;

    await db
      .update(schema.interventionLogs)
      .set({ isActive: false, completedDate: cutoffDate })
      .where(
        and(
          eq(schema.interventionLogs.isActive, true),
          isNull(schema.interventionLogs.completedDate),
          lte(schema.interventionLogs.scheduledDate, cutoffDate)
        )
      );

    let memberIdFilter: number | undefined;
    if (memberIdParam) {
      memberIdFilter = parseInt(memberIdParam, 10);
      if (isNaN(memberIdFilter)) {
        return fail('Invalid member ID', 400);
      }
    }

    const whereConditions: SQL[] = [];
    if (memberIdFilter !== undefined) {
      whereConditions.push(eq(schema.interventionLogs.memberId, memberIdFilter));
    }
    if (!showAll) {
      whereConditions.push(eq(schema.interventionLogs.isActive, true));
    }

    const baseQuery = db
      .select({
        id: schema.interventionLogs.id,
        memberId: schema.interventionLogs.memberId,
        memberName: schema.members.name,
        stage: schema.interventionLogs.stage,
        notes: schema.interventionLogs.notes,
        actionTaken: schema.interventionLogs.actionTaken,
        scheduledDate: schema.interventionLogs.scheduledDate,
        completedDate: schema.interventionLogs.completedDate,
        isActive: schema.interventionLogs.isActive,
        createdAt: schema.interventionLogs.createdAt,
        performedBy: schema.users.username,
      })
      .from(schema.interventionLogs)
      .innerJoin(schema.members, eq(schema.interventionLogs.memberId, schema.members.id))
      .leftJoin(schema.users, eq(schema.interventionLogs.performedBy, schema.users.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(schema.interventionLogs.createdAt));

    const interventions = await (memberIdFilter === undefined
      ? baseQuery.limit(50)
      : baseQuery
    );

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
