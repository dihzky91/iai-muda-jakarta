import { db, schema, insertedId } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';
import { adminRoute, publicRoute, fail, ok, done } from '@/lib/api';
import { selectMembers, normalizeMemberPosition, resolvePositionId } from '@/lib/members';

function validate(fields: Record<string, { value: unknown; minLen?: number; maxLen?: number; type?: string; regex?: RegExp; label: string }>) {
  for (const [, rule] of Object.entries(fields)) {
    const val = rule.value;
    if (val === undefined || val === null || val === '') {
      return `${rule.label} wajib diisi.`;
    }
    if (rule.type === 'string' && typeof val !== 'string') {
      return `${rule.label} harus berupa teks.`;
    }
    if (typeof val === 'string') {
      if (rule.minLen && val.trim().length < rule.minLen) {
        return `${rule.label} minimal ${rule.minLen} karakter.`;
      }
      if (rule.maxLen && val.trim().length > rule.maxLen) {
        return `${rule.label} maksimal ${rule.maxLen} karakter.`;
      }
      if (rule.regex && !rule.regex.test(val)) {
        return `${rule.label} formatnya tidak valid.`;
      }
    }
  }
  return null;
}

/**
 * Bukan adminRoute: endpoint ini terbuka untuk publik, tapi hasilnya menyempit
 * jadi anggota yang show_public saja bila pemanggilnya bukan admin.
 */
export const GET = publicRoute(async (request) => {
  const { searchParams } = new URL(request.url);
  const generationId = searchParams.get('generationId') ? parseInt(searchParams.get('generationId')!) : undefined;

  const user = getUserFromRequest(request);
  const isAdmin = user?.type === 'admin' && ['superadmin', 'admin', 'editor'].includes(user.role);

  const rows = await selectMembers({ generationId, publicOnly: !isAdmin });
  return ok(rows.map(normalizeMemberPosition));
}, 'Failed to fetch members');

export const POST = adminRoute(['superadmin', 'admin'], async (request, _context, user) => {
  const { generationId, positionId, position, name, division, university, email, imageUrl, linkedinUrl, bio, isActive } = await request.json();

  const err = validate({
    name:        { value: name,        type: 'string', minLen: 2, maxLen: 255, label: 'Nama anggota' },
    generationId:{ value: generationId,                                        label: 'ID Generasi' },
    ...(email ? { email: { value: email, type: 'string', regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, label: 'Email' } } : {}),
  });
  if (err) return fail(err, 400);

  let resolvedPosId = positionId || null;
  if (!resolvedPosId && position) {
    resolvedPosId = await resolvePositionId(position, division);
  }

  const result = await db.insert(schema.members).values({
    generationId,
    positionId: resolvedPosId,
    name,
    division: division || null,
    university: university || null,
    email: email || null,
    imageUrl: imageUrl || null,
    linkedinUrl: linkedinUrl || null,
    bio: bio || null,
    isActive: isActive !== false,
  });

  const memberId = insertedId(result);

  // Auto-insert default status 'hijau' untuk member baru
  try {
    await db.insert(schema.memberStatuses).values({
      memberId,
      status: 'hijau',
      reason: 'Status awal',
      changedBy: user.userId,
    });
  } catch (e: any) {
    console.error('Member created but status insert failed:', {
      memberId,
      sqlMessage: e?.cause?.sqlMessage || e?.cause?.message || e?.message,
      code: e?.cause?.code || e?.code,
      errno: e?.cause?.errno,
    });
    // tetap return success — member sudah terlanjur dibuat
    return done('Member created, but status insert failed', {
      id: memberId,
      statusError: e?.cause?.sqlMessage || e?.cause?.message || e?.message,
    });
  }

  return done('Member created successfully', { id: memberId });
}, 'Failed to create member');
