import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export type UserRole = 'superadmin' | 'admin' | 'editor';

export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
}

const JWT_SECRET: string = process.env.JWT_SECRET || '';
if (!JWT_SECRET) {
  throw new Error('[AUTH] JWT_SECRET environment variable is required.');
}

export function signToken(payload: JwtPayload): string {
  const options = { expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as any };
  return jwt.sign(payload as object, JWT_SECRET, options as any);
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
  if (!user) return false;
  return roles.includes(user.role);
}
