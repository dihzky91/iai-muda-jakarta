import test from 'node:test';
import assert from 'node:assert/strict';
import type { NextRequest } from 'next/server';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const { signAdminToken, signMemberToken, getUserFromRequest } = await import('../lib/auth');

function createRequest(cookies: Record<string, string>, authHeader?: string) {
  return {
    headers: {
      get: (name: string) => (name.toLowerCase() === 'authorization' ? authHeader ?? null : null),
    },
    cookies: {
      get: (name: string) => {
        const value = cookies[name];
        return value ? { value } : null;
      },
    },
  } as unknown as NextRequest;
}

test('member routes prefer member cookie over admin cookie', () => {
  const memberToken = signMemberToken({ memberId: 7, email: 'member@example.com' });
  const adminToken = signAdminToken({ userId: 1, username: 'admin', role: 'admin' });

  const request = createRequest({ member_token: memberToken, admin_token: adminToken });
  const user = getUserFromRequest(request, 'member');

  assert.ok(user);
  assert.equal(user.type, 'member');
  assert.equal(user.memberId, 7);
});

test('admin routes ignore member cookie and use admin cookie', () => {
  const memberToken = signMemberToken({ memberId: 7, email: 'member@example.com' });
  const adminToken = signAdminToken({ userId: 1, username: 'admin', role: 'admin' });

  const request = createRequest({ member_token: memberToken, admin_token: adminToken });
  const user = getUserFromRequest(request, 'admin');

  assert.ok(user);
  assert.equal(user.type, 'admin');
  assert.equal(user.userId, 1);
});
