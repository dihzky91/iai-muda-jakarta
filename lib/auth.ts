import jwt from 'jsonwebtoken';
// Type-only: NextRequest hanya dipakai sebagai anotasi. Import biasa akan
// memuat `next/server` saat runtime, yang tidak diinginkan ketika modul ini
// dipakai script CLI (seed, migrasi) di luar Next.js.
import type { NextRequest } from 'next/server';
// Satu-satunya import bcrypt di seluruh proyek. Paket native `bcrypt` sudah
// dibuang; `bcryptjs` murni JS sehingga tidak perlu kompilasi saat deploy.
// Hash $2a$/$2b$ yang dibuat paket native tetap terverifikasi di sini.
import bcrypt from 'bcryptjs';
import { ADMIN_COOKIE, MEMBER_COOKIE, LEGACY_COOKIE } from './cookies';

// Di-re-export supaya route handler cukup import dari satu tempat.
export { ADMIN_COOKIE, MEMBER_COOKIE, LEGACY_COOKIE, sessionCookieOptions } from './cookies';

export type UserRole = 'superadmin' | 'admin' | 'editor';
export type TokenType = 'admin' | 'member';

export interface AdminJwtPayload {
  userId: number;
  username: string;
  role: UserRole;
  type: 'admin';
}

export interface MemberJwtPayload {
  memberId: number;
  email: string;
  type: 'member';
}

export type JwtPayload = AdminJwtPayload | MemberJwtPayload;

const JWT_SECRET: string = process.env.JWT_SECRET || '';
if (!JWT_SECRET) {
  throw new Error('[AUTH] JWT_SECRET environment variable is required.');
}

export function signToken(payload: AdminJwtPayload | MemberJwtPayload): string {
  const options = { expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as any };
  return jwt.sign(payload as object, JWT_SECRET, options as any);
}

export function signAdminToken(payload: Omit<AdminJwtPayload, 'type'>): string {
  return signToken({ ...payload, type: 'admin' });
}

export function signMemberToken(payload: Omit<MemberJwtPayload, 'type'>): string {
  return signToken({ ...payload, type: 'member' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function getUserFromRequest(request: NextRequest): JwtPayload | null {
  const authHeader = request.headers.get('authorization');

  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : request.cookies.get(ADMIN_COOKIE)?.value
      ?? request.cookies.get(MEMBER_COOKIE)?.value
      ?? request.cookies.get(LEGACY_COOKIE)?.value
      ?? null;

  if (!token) return null;

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function requireRole(user: JwtPayload | null, ...roles: UserRole[]): boolean {
  if (!user || user.type !== 'admin') return false;
  return roles.includes(user.role);
}

export function requireMember(user: JwtPayload | null): user is MemberJwtPayload {
  return user !== null && user.type === 'member';
}

export function requireAdmin(user: JwtPayload | null): user is AdminJwtPayload {
  return user !== null && user.type === 'admin';
}

export function isAdmin(user: JwtPayload | null): user is AdminJwtPayload {
  return user?.type === 'admin';
}

export function isMember(user: JwtPayload | null): user is MemberJwtPayload {
  return user?.type === 'member';
}

/**
 * Cost factor bcrypt untuk seluruh aplikasi.
 *
 * Sebelumnya tercecer: route admin memakai 12, helper ini 10, script test 10.
 * Disatukan ke 12 (nilai terkuat yang sudah dipakai). Hash lama tetap valid —
 * cost tersimpan di dalam string hash-nya, jadi verifikasi tidak terpengaruh.
 */
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Verify member token from request
 * Returns member authentication status and memberId if valid
 */
export async function verifyMemberToken(request: NextRequest): Promise<{
  valid: boolean;
  memberId?: number;
  email?: string;
}> {
  const user = getUserFromRequest(request);
  
  if (!user || user.type !== 'member') {
    return { valid: false };
  }

  return {
    valid: true,
    memberId: user.memberId,
    email: user.email,
  };
}

/**
 * Verify admin token from request
 * Returns admin authentication status and userId/role if valid
 */
export async function verifyAdminToken(request: NextRequest): Promise<{
  valid: boolean;
  userId?: number;
  username?: string;
  role?: UserRole;
}> {
  const user = getUserFromRequest(request);
  
  if (!user || user.type !== 'admin') {
    return { valid: false };
  }

  return {
    valid: true,
    userId: user.userId,
    username: user.username,
    role: user.role,
  };
}
