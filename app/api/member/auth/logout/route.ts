import { NextRequest, NextResponse } from 'next/server';
import { MEMBER_COOKIE, LEGACY_COOKIE, sessionCookieOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logout berhasil',
    });

    // maxAge 0 = hapus. Opsi lain harus sama persis dengan saat di-set,
    // kalau tidak browser menganggapnya cookie berbeda dan yang lama tertinggal.
    response.cookies.set(MEMBER_COOKIE, '', sessionCookieOptions(0));

    // Bersihkan nama lama dari sebelum cookie admin/member dipisah.
    response.cookies.set(LEGACY_COOKIE, '', sessionCookieOptions(0));

    return response;
  } catch (err: any) {
    console.error('[Member Logout Error]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Logout gagal' }, 
      { status: 500 }
    );
  }
}
