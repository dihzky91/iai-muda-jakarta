import { db, schema } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { memberRoute, ok, done, fail } from '@/lib/api';

/**
 * GET /api/member/hr/academic-load
 * Get member's own academic loads
 */
export const GET = memberRoute(
  async (_request, _context, member) => {
    const loads = await db
      .select()
      .from(schema.memberAcademicLoads)
      .where(eq(schema.memberAcademicLoads.memberId, member.memberId))
      .orderBy(desc(schema.memberAcademicLoads.weekStart))
      .limit(10);

    return ok(loads);
  },
  'Failed to fetch academic loads'
);

/**
 * POST /api/member/hr/academic-load
 * Submit or update academic load for current week
 */
export const POST = memberRoute(
  async (request, _context, member) => {
    const body = await request.json();
    const { weekStart, loadType, description, intensity } = body;

    // Validate required fields
    if (!weekStart || !loadType) {
      return fail('weekStart and loadType are required', 400);
    }

    // Validate loadType
    const validLoadTypes = ['uts', 'uas', 'quiz', 'project', 'sick', 'personal', 'other'];
    if (!validLoadTypes.includes(loadType)) {
      return fail(`Invalid loadType. Must be one of: ${validLoadTypes.join(', ')}`, 400);
    }

    // Validate intensity
    const validIntensities = ['low', 'medium', 'high'];
    if (intensity && !validIntensities.includes(intensity)) {
      return fail(`Invalid intensity. Must be one of: ${validIntensities.join(', ')}`, 400);
    }

    // Check if load already exists for this week
    const existing = await db
      .select()
      .from(schema.memberAcademicLoads)
      .where(
        eq(schema.memberAcademicLoads.memberId, member.memberId)
      )
      .limit(100);

    const existingForWeek = existing.find(l => l.weekStart === weekStart && l.loadType === loadType);

    if (existingForWeek) {
      // Update existing load
      await db
        .update(schema.memberAcademicLoads)
        .set({
          description: description || null,
          intensity: intensity || 'medium',
          updatedAt: new Date(),
        })
        .where(eq(schema.memberAcademicLoads.id, existingForWeek.id));

      return done('Academic load updated successfully');
    } else {
      // Insert new load
      await db.insert(schema.memberAcademicLoads).values({
        memberId: member.memberId,
        weekStart,
        loadType,
        description: description || null,
        intensity: intensity || 'medium',
      });

      return done('Academic load submitted successfully');
    }
  },
  'Failed to submit academic load'
);
