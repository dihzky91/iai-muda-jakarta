/**
 * Konstanta & opsi cookie sesi.
 *
 * Modul ini SENGAJA tanpa dependency apa pun. `proxy.ts` (middleware) hanya
 * butuh nama cookie; kalau ia mengimpornya dari `lib/auth`, seluruh isi
 * lib/auth ikut ter-bundle ke middleware — termasuk `jsonwebtoken` yang
 * memakai crypto Node, dan `throw` di level modul saat JWT_SECRET kosong.
 * Middleware jalan di setiap request /admin dan /portal, jadi bundle-nya
 * harus tetap kecil dan bebas dependency runtime.
 */

/** Nama cookie sesi, terpisah per area. */
export const ADMIN_COOKIE = 'admin_token';
export const MEMBER_COOKIE = 'member_token';

/**
 * Nama lama dari sebelum cookie admin dan member dipisah. Keduanya memakai
 * nama ini, sehingga login ke portal menimpa sesi admin di browser yang sama
 * dan sebaliknya — dan gate di proxy.ts tidak bisa membedakan tipe token.
 * Masih dibersihkan saat logout supaya tidak menggantung di browser.
 */
export const LEGACY_COOKIE = 'auth_token';

/** Opsi cookie sesi yang dipakai kedua area — satu definisi, tidak tercecer. */
export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // 'lax', bukan 'strict': dengan 'strict' cookie tidak ikut terkirim saat
    // pengguna membuka tautan portal dari luar (email, chat), sehingga gate di
    // proxy.ts memantulkan mereka ke login walau sesinya masih hidup.
    sameSite: 'lax' as const,
    // Wajib eksplisit. Tanpa ini browser memakai default-path = direktori URL
    // yang men-set cookie, bukan seluruh situs.
    path: '/',
    maxAge: maxAgeSeconds,
  };
}
