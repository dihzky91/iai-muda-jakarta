import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { adminRoute, publicRoute, fail, ok, done } from '@/lib/api';
import { selectMemberById, normalizeMemberPosition, resolvePositionId } from '@/lib/members';

type Params = { id: string };

export const GET = publicRoute<Params>(async (_request, { params }) => {
  const { id } = await params;
  const rows = await selectMemberById(parseInt(id));
  if (!rows.length) {
    return fail('Member not found', 404);
  }
  return ok(normalizeMemberPosition(rows[0]));
}, 'Failed to fetch member');

export const PUT = adminRoute<Params>(['superadmin', 'admin'], async (request, { params }) => {
  const { id } = await params;
  const { generationId, positionId, position, name, division, university, email, imageUrl, linkedinUrl, bio, isActive, showPublic } = await request.json();

  let resolvedPosId = positionId || undefined;
  if (position !== undefined) {
    resolvedPosId = position ? (await resolvePositionId(position, division || 'Lainnya') || undefined) : null;
  }

  await db.update(schema.members).set({
    generationId: generationId || undefined,
    positionId: resolvedPosId,
    name: name || undefined,
    division: division || undefined,
    university: university !== undefined ? university : undefined,
    email: email || undefined,
    imageUrl: imageUrl || undefined,
    linkedinUrl: linkedinUrl || undefined,
    bio: bio || undefined,
    isActive: isActive !== undefined ? isActive : undefined,
    showPublic: showPublic !== undefined ? showPublic : undefined,
  }).where(eq(schema.members.id, parseInt(id)));

  return done('Member updated successfully');
}, 'Failed to update member');

export const DELETE = adminRoute<Params>(['superadmin', 'admin'], async (_request, { params }) => {
  const { id } = await params;

  await db.delete(schema.members).where(eq(schema.members.id, parseInt(id)));

  return done('Member deleted successfully');
}, 'Failed to delete member');
