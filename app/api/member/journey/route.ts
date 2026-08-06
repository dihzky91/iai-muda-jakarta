import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, inArray, desc, asc } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paramMemberId = searchParams.get('memberId');
    const paramEmail = searchParams.get('email');

    // 1. Identify target member from session or search query
    const authUser = getUserFromRequest(request);
    let targetEmail = paramEmail || (authUser && authUser.type === 'member' ? authUser.email : null);
    let targetMemberId = paramMemberId ? parseInt(paramMemberId, 10) : (authUser && authUser.type === 'member' ? authUser.memberId : null);

    // Fallback: If no auth session or params provided, select the first active member for preview
    let primaryMember: any = null;

    if (targetMemberId) {
      const found = await db.select().from(schema.members).where(eq(schema.members.id, targetMemberId)).limit(1);
      if (found.length > 0) primaryMember = found[0];
    }

    if (!primaryMember && targetEmail) {
      const found = await db.select().from(schema.members).where(eq(schema.members.email, targetEmail)).limit(1);
      if (found.length > 0) primaryMember = found[0];
    }

    if (!primaryMember) {
      // Pick first active member for demonstration
      const found = await db.select().from(schema.members).limit(1);
      if (found.length > 0) primaryMember = found[0];
    }

    if (!primaryMember) {
      return NextResponse.json({ error: 'Member tidak ditemukan' }, { status: 404 });
    }

    targetEmail = primaryMember.email || null;

    // 2. Fetch all generation records for this member (matched by email or name)
    let memberRecords: any[] = [];
    if (targetEmail) {
      memberRecords = await db.select().from(schema.members).where(eq(schema.members.email, targetEmail));
    }
    if (memberRecords.length === 0) {
      memberRecords = await db.select().from(schema.members).where(eq(schema.members.name, primaryMember.name));
    }

    const memberIds = memberRecords.map((m) => m.id);
    const genIds = memberRecords.map((m) => m.generationId);

    // 3. Fetch Generations & Positions
    const [allGenerations, allPositions] = await Promise.all([
      db.select().from(schema.generations).orderBy(asc(schema.generations.id)),
      db.select().from(schema.positions),
    ]);

    const posMap = new Map<number, string>();
    allPositions.forEach((p) => posMap.set(p.id, p.name));

    const genMap = new Map<number, any>();
    allGenerations.forEach((g) => genMap.set(g.id, g));

    // Formatted generation records
    const historyGenerations = memberRecords
      .map((m) => {
        const gen = genMap.get(m.generationId);
        const positionName = m.positionId ? posMap.get(m.positionId) || 'Staf Bidang' : 'Staf Bidang';
        return {
          memberId: m.id,
          generationId: m.generationId,
          genName: gen ? gen.name : `Generasi ke-${m.generationId}`,
          years: gen ? gen.years : 'Period',
          cabinetName: gen?.cabinetName || null,
          division: m.division || 'Umum',
          roleName: positionName,
          isActive: gen?.isActive || false,
        };
      })
      .sort((a, b) => a.generationId - b.generationId);

    // 4. Fetch Committee Roles
    let committeeList: any[] = [];
    if (memberIds.length > 0) {
      const committeeRows = await db
        .select()
        .from(schema.eventCommittees)
        .where(inArray(schema.eventCommittees.memberId, memberIds));

      if (committeeRows.length > 0) {
        const eventIds = Array.from(new Set(committeeRows.map((c) => c.eventId)));
        const eventRows = await db.select().from(schema.events).where(inArray(schema.events.id, eventIds));
        const eventMap = new Map<number, any>();
        eventRows.forEach((e) => eventMap.set(e.id, e));

        committeeList = committeeRows.map((c) => {
          const ev = eventMap.get(c.eventId);
          return {
            id: c.id,
            eventId: c.eventId,
            eventTitle: ev ? ev.title : 'Acara Organisasi',
            role: c.role,
            division: 'Panitia Pelaksana',
            eventDate: ev ? ev.date : '-',
          };
        });
      }
    }

    // 5. Fetch RSVP Attendance Count
    let rsvpCount = 0;
    if (memberIds.length > 0) {
      const rsvps = await db.select().from(schema.eventRsvps).where(inArray(schema.eventRsvps.memberId, memberIds));
      rsvpCount = rsvps.length;
    }

    // 6. Smart Narrative & Badges Engine
    const isMultiGen = historyGenerations.length > 1;
    const badges: string[] = [];

    if (isMultiGen) {
      badges.push(`Senior Member (${historyGenerations.length} Periode)`);
    } else {
      badges.push('Pengurus Aktif');
    }

    // Check leadership / BPH / Koordinator
    const hasBphRole = historyGenerations.some((g) =>
      /ketua|wakil|sekretaris|bendahara|bph/i.test(g.roleName)
    );
    const hasKoordinatorRole = historyGenerations.some((g) =>
      /koordinator/i.test(g.roleName)
    );

    if (hasBphRole) badges.push('Executive BPH');
    if (hasKoordinatorRole) badges.push('Koordinator Bidang');
    if (committeeList.length >= 2) badges.push('Panitia Handal');
    if (isMultiGen && !hasBphRole && !hasKoordinatorRole) badges.push('Loyal Contributor');

    // Build Narrative Text
    let smartNarrative = '';
    const latestRole = historyGenerations[historyGenerations.length - 1];
    const firstRole = historyGenerations[0];

    if (isMultiGen) {
      if (!hasBphRole && hasKoordinatorRole) {
        smartNarrative = `Perjalanan luar biasa! Berawal dari ${firstRole.roleName} di ${firstRole.genName}, kamu sukses dipercaya memimpin sebagai ${latestRole.roleName} (${latestRole.division}) di ${latestRole.genName}. Lompatan kepemimpinan yang sangat menginspirasi!`;
      } else if (hasBphRole) {
        smartNarrative = `Masa pengabdian yang berkesan! Jejak kepemimpinanmu di jajaran pimpinan ${latestRole.genName} menjadi fondasi penting bagi kemajuan IAI Muda Wilayah DKI Jakarta.`;
      } else {
        smartNarrative = `${historyGenerations.length} periode penuh dedikasi! Terima kasih atas konsistensi dan loyalitasmu memperkuat ${latestRole.division} IAI Muda DKI Jakarta dari ${firstRole.genName} hingga ${latestRole.genName}.`;
      }
    } else {
      smartNarrative = `Terima kasih atas kontribusi aktifmu sebagai ${latestRole.roleName} (${latestRole.division}) di ${latestRole.genName}. Setiap waktu dan tenaga yang kamu berikan sangat berarti bagi kemajuan akuntan muda DKI Jakarta!`;
    }

    return NextResponse.json({
      success: true,
      member: {
        id: primaryMember.id,
        name: primaryMember.name,
        email: primaryMember.email,
        imageUrl: primaryMember.imageUrl,
        university: primaryMember.university,
        bio: primaryMember.bio,
      },
      stats: {
        totalPeriods: historyGenerations.length,
        totalCommittees: committeeList.length,
        totalEventsAttended: rsvpCount,
        firstJoinedYear: firstRole.years,
      },
      generations: historyGenerations,
      committees: committeeList,
      badges,
      smartNarrative,
    });
  } catch (error) {
    console.error('Error fetching member journey:', error);
    return NextResponse.json({ error: 'Gagal memproses data perjalanan member' }, { status: 500 });
  }
}
