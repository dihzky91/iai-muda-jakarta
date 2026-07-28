import { db, schema } from '@/lib/db';
import { eq, desc, sql, and, or, isNull, gte } from 'drizzle-orm';
import { adminRoute, ok } from '@/lib/api';

/**
 * Hitung hari Senin minggu ini dalam zona WIB (UTC+7).
 * toISOString() menghasilkan UTC, sehingga bisa salah di sekitar tengah malam.
 * Fungsi ini mengoreksi offset agar perhitungan hari selalu benar dalam WIB.
 */
function getMondayWIB(): string {
  const now = new Date();
  const wib = new Date(now.getTime() + (now.getTimezoneOffset() + 420) * 60 * 1000);
  const day = wib.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  wib.setDate(wib.getDate() + diff);
  const y = wib.getFullYear();
  const m = String(wib.getMonth() + 1).padStart(2, '0');
  const d = String(wib.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Ambil semua member aktif dengan status TERAKHIR masing-masing.
 * Dilakukan dalam dua query terpisah karena Drizzle tidak mendukung
 * subquery di dalam ON condition JOIN.
 */
async function getActiveMembersWithLatestStatus() {
  // Step 1: Semua anggota aktif (bukan alumni)
  const activeMembers = await db
    .select({
      memberId: schema.members.id,
      memberName: schema.members.name,
      memberDivision: schema.members.division,
    })
    .from(schema.members)
    .where(
      and(
        eq(schema.members.isActive, true),
        eq(schema.members.isAlumni, false)
      )
    );

  // Step 2: Status terakhir tiap anggota via WHERE subquery (didukung Drizzle)
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

  // Step 3: Gabungkan di JavaScript
  const statusMap = new Map(latestStatuses.map(s => [s.memberId, s]));

  return activeMembers.map(m => {
    const s = statusMap.get(m.memberId);
    return {
      memberId: m.memberId,
      memberName: m.memberName,
      memberDivision: m.memberDivision,
      status: s?.status ?? null,
      reason: s?.reason ?? null,
      createdAt: s?.createdAt ?? null,
    };
  });
}

/**
 * GET /api/hr/dashboard
 * HR Command Center dashboard data:
 * - Status distribution (Hijau, Kuning, Merah, Biru counts)
 * - Members needing attention (Merah/Kuning)
 * - Pending leave requests
 * - Ongoing interventions (tidak stale)
 * - Members who haven't updated academic load this week
 */
export const GET = adminRoute(
  ['superadmin', 'admin'],
  async (_request, _context, _user) => {
    const weekStartStr = getMondayWIB();

    // 1. All active members with their latest status
    const membersWithStatus = await getActiveMembersWithLatestStatus();

    // 2. Status counts — member tanpa status dianggap 'hijau'
    const statusCounts = { hijau: 0, kuning: 0, merah: 0, biru: 0 };
    for (const row of membersWithStatus) {
      const s = (row.status || 'hijau') as keyof typeof statusCounts;
      if (s in statusCounts) statusCounts[s]++;
    }

    // 3. Members needing attention (Merah and Kuning)
    const needsAttention = membersWithStatus
      .filter(s => s.status === 'merah' || s.status === 'kuning')
      .map(s => ({
        memberId: s.memberId,
        name: s.memberName,
        division: s.memberDivision,
        status: s.status!,
        reason: s.reason,
        lastUpdated: s.createdAt,
      }));

    // 4. Pending leave requests
    const pendingLeaves = await db
      .select({
        id: schema.leaveRequests.id,
        memberId: schema.leaveRequests.memberId,
        memberName: schema.members.name,
        startDate: schema.leaveRequests.startDate,
        endDate: schema.leaveRequests.endDate,
        reason: schema.leaveRequests.reason,
        leaveType: schema.leaveRequests.leaveType,
        submittedAt: schema.leaveRequests.submittedAt,
      })
      .from(schema.leaveRequests)
      .innerJoin(schema.members, eq(schema.leaveRequests.memberId, schema.members.id))
      .where(eq(schema.leaveRequests.status, 'pending'))
      .orderBy(desc(schema.leaveRequests.submittedAt))
      .limit(10);

    // 5. Ongoing interventions — exclude stale entries (>30 hari tanpa completedDate)
    const thirtyDaysAgo = new Date();
    const wibNow = new Date(thirtyDaysAgo.getTime() + (thirtyDaysAgo.getTimezoneOffset() + 420) * 60 * 1000);
    wibNow.setDate(wibNow.getDate() - 30);
    const y = wibNow.getFullYear();
    const m = String(wibNow.getMonth() + 1).padStart(2, '0');
    const d = String(wibNow.getDate()).padStart(2, '0');
    const cutoffDate = `${y}-${m}-${d}`;

    const ongoingInterventions = await db
      .select({
        id: schema.interventionLogs.id,
        memberId: schema.interventionLogs.memberId,
        memberName: schema.members.name,
        stage: schema.interventionLogs.stage,
        scheduledDate: schema.interventionLogs.scheduledDate,
        notes: schema.interventionLogs.notes,
      })
      .from(schema.interventionLogs)
      .innerJoin(schema.members, eq(schema.interventionLogs.memberId, schema.members.id))
      .where(
        and(
          eq(schema.interventionLogs.isActive, true),
          isNull(schema.interventionLogs.completedDate),
          or(
            isNull(schema.interventionLogs.scheduledDate),
            gte(schema.interventionLogs.scheduledDate, cutoffDate)
          )
        )
      )
      .orderBy(schema.interventionLogs.scheduledDate)
      .limit(10);

    // 6. Members who haven't updated academic load this week
    const membersWithLoad = await db
      .select({ memberId: schema.memberAcademicLoads.memberId })
      .from(schema.memberAcademicLoads)
      .where(eq(schema.memberAcademicLoads.weekStart, weekStartStr));

    const memberIdsWithLoad = new Set(membersWithLoad.map(m => m.memberId));

    const noAcademicLoadUpdate = membersWithStatus
      .filter(m => !memberIdsWithLoad.has(m.memberId))
      .map(m => ({
        memberId: m.memberId,
        name: m.memberName,
        division: m.memberDivision,
      }));

    return ok({
      statusCounts,
      needsAttention,
      pendingLeaves,
      ongoingInterventions,
      noAcademicLoadUpdate: noAcademicLoadUpdate.slice(0, 20),
    });
  },
  'Failed to fetch HR dashboard data'
);
