import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';

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
    : request.cookies.get('auth_token')?.value ?? null;

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

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
