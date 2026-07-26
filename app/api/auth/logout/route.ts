import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, LEGACY_COOKIE, sessionCookieOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out' });

  // maxAge 0 = hapus. Opsi lain (path, secure, sameSite) harus sama persis
  // dengan saat cookie di-set, kalau tidak browser menganggapnya cookie lain
  // dan yang lama tetap tertinggal.
  response.cookies.set(ADMIN_COOKIE, '', sessionCookieOptions(0));

  // Bersihkan juga nama lama, supaya sesi dari versi sebelumnya tidak
  // menggantung di browser setelah pemisahan nama cookie.
  response.cookies.set(LEGACY_COOKIE, '', sessionCookieOptions(0));

  return response;
}
