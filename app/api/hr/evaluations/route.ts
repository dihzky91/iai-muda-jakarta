import { db, schema } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { adminRoute, ok, done, fail } from '@/lib/api';

/**
 * GET /api/hr/evaluations
 * List monthly evaluations with optional filters
 */
export const GET = adminRoute(
  ['superadmin', 'admin'],
  async (request, _context, _user) => {
    const { searchParams } = new URL(request.url);
    const memberIdParam = searchParams.get('memberId');
    const monthParam = searchParams.get('month'); // YYYY-MM format

    let evaluations;

    if (memberIdParam) {
      const memberId = parseInt(memberIdParam, 10);
      if (isNaN(memberId)) {
        return fail('Invalid member ID', 400);
      }

      evaluations = await db
        .select({
          id: schema.monthlyEvaluations.id,
          memberId: schema.monthlyEvaluations.memberId,
          memberName: schema.members.name,
          month: schema.monthlyEvaluations.month,
          evaluationNotes: schema.monthlyEvaluations.evaluationNotes,
          actionItems: schema.monthlyEvaluations.actionItems,
          rating: schema.monthlyEvaluations.rating,
          evaluatedBy: schema.users.username,
          createdAt: schema.monthlyEvaluations.createdAt,
        })
        .from(schema.monthlyEvaluations)
        .innerJoin(schema.members, eq(schema.monthlyEvaluations.memberId, schema.members.id))
        .leftJoin(schema.users, eq(schema.monthlyEvaluations.evaluatedBy, schema.users.id))
        .where(eq(schema.monthlyEvaluations.memberId, memberId))
        .orderBy(desc(schema.monthlyEvaluations.month));
    } else if (monthParam) {
      evaluations = await db
        .select({
          id: schema.monthlyEvaluations.id,
          memberId: schema.monthlyEvaluations.memberId,
          memberName: schema.members.name,
          month: schema.monthlyEvaluations.month,
          evaluationNotes: schema.monthlyEvaluations.evaluationNotes,
          actionItems: schema.monthlyEvaluations.actionItems,
          rating: schema.monthlyEvaluations.rating,
          evaluatedBy: schema.users.username,
          createdAt: schema.monthlyEvaluations.createdAt,
        })
        .from(schema.monthlyEvaluations)
        .innerJoin(schema.members, eq(schema.monthlyEvaluations.memberId, schema.members.id))
        .leftJoin(schema.users, eq(schema.monthlyEvaluations.evaluatedBy, schema.users.id))
        .where(eq(schema.monthlyEvaluations.month, monthParam))
        .orderBy(schema.members.name);
    } else {
      evaluations = await db
        .select({
          id: schema.monthlyEvaluations.id,
          memberId: schema.monthlyEvaluations.memberId,
          memberName: schema.members.name,
          month: schema.monthlyEvaluations.month,
          evaluationNotes: schema.monthlyEvaluations.evaluationNotes,
          actionItems: schema.monthlyEvaluations.actionItems,
          rating: schema.monthlyEvaluations.rating,
          evaluatedBy: schema.users.username,
          createdAt: schema.monthlyEvaluations.createdAt,
        })
        .from(schema.monthlyEvaluations)
        .innerJoin(schema.members, eq(schema.monthlyEvaluations.memberId, schema.members.id))
        .leftJoin(schema.users, eq(schema.monthlyEvaluations.evaluatedBy, schema.users.id))
        .orderBy(desc(schema.monthlyEvaluations.month))
        .limit(50);
    }

    return ok(evaluations);
  },
  'Failed to fetch evaluations'
);

/**
 * POST /api/hr/evaluations
 * Create or update monthly evaluation
 */
export const POST = adminRoute(
  ['superadmin', 'admin'],
  async (request, _context, user) => {
    const body = await request.json();
    const { memberId, month, evaluationNotes, actionItems, rating } = body;

    // Validate required fields
    if (!memberId || !month) {
      return fail('memberId and month are required', 400);
    }

    // Validate month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return fail('Invalid month format. Use YYYY-MM', 400);
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return fail('Rating must be between 1 and 5', 400);
    }

    const memberIdInt = parseInt(memberId, 10);

    // Check if evaluation already exists for this member/month
    const existing = await db
      .select()
      .from(schema.monthlyEvaluations)
      .where(
        eq(schema.monthlyEvaluations.memberId, memberIdInt)
      )
      .limit(100);

    const existingForMonth = existing.find(e => e.month === month);

    if (existingForMonth) {
      // Update existing evaluation
      await db
        .update(schema.monthlyEvaluations)
        .set({
          evaluationNotes: evaluationNotes || null,
          actionItems: actionItems || null,
          rating: rating || null,
          evaluatedBy: user.userId,
          updatedAt: new Date(),
        })
        .where(eq(schema.monthlyEvaluations.id, existingForMonth.id));

      return done('Evaluation updated successfully');
    } else {
      // Insert new evaluation
      await db.insert(schema.monthlyEvaluations).values({
        memberId: memberIdInt,
        month,
        evaluationNotes: evaluationNotes || null,
        actionItems: actionItems || null,
        rating: rating || null,
        evaluatedBy: user.userId,
      });

      return done('Evaluation created successfully');
    }
  },
  'Failed to save evaluation'
);
