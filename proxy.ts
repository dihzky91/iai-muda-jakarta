import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Dari lib/cookies, BUKAN lib/auth — lib/auth menarik jsonwebtoken ke dalam
// bundle middleware yang jalan di setiap request /admin dan /portal.
import { ADMIN_COOKIE, MEMBER_COOKIE } from '@/lib/cookies';

/**
 * Gate routing untuk area yang butuh login.
 *
 * PENTING — ini BUKAN batas keamanan. Yang diperiksa hanya keberadaan cookie,
 * bukan tanda tangan JWT-nya (verifikasi jwt tidak tersedia di runtime edge).
 * Siapa pun bisa memasang cookie berisi sampah dan lolos ke sini; yang
 * menahannya adalah route handler di /api/* yang memanggil getUserFromRequest()
 * lalu memverifikasi token sungguhan. Middleware ini murni supaya pengunjung
 * yang belum login tidak mendarat di halaman kosong.
 *
 * Cookie admin dan member sengaja bernama beda, jadi gate di bawah tidak bisa
 * ditembus token area lain. Waktu keduanya masih bernama `auth_token`, sesi
 * member lolos pemeriksaan /admin dan sebaliknya.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminToken = request.cookies.get(ADMIN_COOKIE)?.value;
  const memberToken = request.cookies.get(MEMBER_COOKIE)?.value;

  // --- Area admin ---
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  if (pathname === '/admin/login' && adminToken) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // --- Area portal anggota ---
  // Sebelumnya /portal/* tidak masuk matcher sama sekali, jadi proteksinya
  // hanya redirect di useEffect tiap halaman — baru jalan setelah shell terkirim.
  if (pathname.startsWith('/portal') && pathname !== '/portal/login') {
    if (!memberToken) {
      return NextResponse.redirect(new URL('/portal/login', request.url));
    }
  }

  if (pathname === '/portal/login' && memberToken) {
    return NextResponse.redirect(new URL('/portal/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/portal/:path*'],
};
