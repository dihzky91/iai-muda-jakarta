import { NextRequest, NextResponse } from 'next/server';
import {
  getUserFromRequest,
  requireRole,
  requireMember,
  type AdminJwtPayload,
  type MemberJwtPayload,
  type UserRole,
} from './auth';

/**
 * Pembungkus route handler.
 *
 * Tiap handler di app/api sebelumnya mengulang blok yang sama persis:
 * ambil user → cek role → return 'Unauthorized' → bungkus semuanya dalam
 * try/catch yang mengembalikan 500 dengan pesan yang hampir seragam. Pola itu
 * tersalin di 34 tempat untuk auth dan 54 tempat untuk error handling, jadi
 * memperbaiki satu perilaku berarti menyunting puluhan berkas.
 *
 * Status dan bentuk respons DIPERTAHANKAN sama dengan sebelumnya:
 * - gagal otorisasi admin  → 403 { success: false, message: 'Unauthorized' }
 * - gagal otorisasi member → 401 { success: false, message: 'Unauthorized' }
 * - error tak tertangani   → 500 { success: false, message: <pesan error> }
 */

/** Konteks route Next.js. `params` berupa Promise sejak Next 15. */
type RouteContext<P> = { params: Promise<P> };

/** Respons gagal berbentuk seragam. */
export function fail(message: string, status: number): NextResponse {
  return NextResponse.json({ success: false, message }, { status });
}

/** Respons sukses yang membawa data. */
export function ok<T>(payload: T, extra?: Record<string, unknown>): NextResponse {
  return NextResponse.json({ success: true, data: payload, ...extra });
}

/** Respons sukses yang hanya membawa pesan (create/update/delete). */
export function done(message: string, extra?: Record<string, unknown>): NextResponse {
  return NextResponse.json({ success: true, message, ...extra });
}

/**
 * Route publik — tanpa cek auth, hanya penanganan error terpusat.
 * `fallbackMessage` dipakai kalau error yang dilempar tidak punya `.message`.
 */
export function publicRoute<P = Record<string, string>>(
  handler: (request: NextRequest, context: RouteContext<P>) => Promise<NextResponse>,
  fallbackMessage: string
) {
  return async (request: NextRequest, context: RouteContext<P>): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (err: any) {
      return fail(err?.message || fallbackMessage, 500);
    }
  };
}

/**
 * Route khusus admin. Handler baru dipanggil setelah role terverifikasi,
 * dan menerima payload admin yang sudah pasti ada — jadi tidak perlu lagi
 * pengecekan null di dalam handler.
 */
export function adminRoute<P = Record<string, string>>(
  roles: UserRole[],
  handler: (
    request: NextRequest,
    context: RouteContext<P>,
    user: AdminJwtPayload
  ) => Promise<NextResponse>,
  fallbackMessage: string,
  /**
   * Status saat otorisasi gagal. Default 403, seperti mayoritas route admin.
   * Route /api/admin/member-accounts sudah terlanjur memakai 401; nilainya
   * dipertahankan lewat opsi ini alih-alih diam-diam diubah.
   */
  unauthorizedStatus = 403
) {
  return async (request: NextRequest, context: RouteContext<P>): Promise<NextResponse> => {
    try {
      const user = getUserFromRequest(request, 'admin');
      if (!requireRole(user, ...roles)) {
        return fail('Unauthorized', unauthorizedStatus);
      }
      return await handler(request, context, user as AdminJwtPayload);
    } catch (err: any) {
      const causeMsg = err?.cause?.sqlMessage || err?.cause?.message;
      return fail(causeMsg ? `${err?.message} — ${causeMsg}` : (err?.message || fallbackMessage), 500);
    }
  };
}

/** Route khusus anggota portal. */
export function memberRoute<P = Record<string, string>>(
  handler: (
    request: NextRequest,
    context: RouteContext<P>,
    member: MemberJwtPayload
  ) => Promise<NextResponse>,
  fallbackMessage: string
) {
  return async (request: NextRequest, context: RouteContext<P>): Promise<NextResponse> => {
    try {
      const user = getUserFromRequest(request, 'member');
      if (!requireMember(user)) {
        return fail('Unauthorized', 401);
      }
      return await handler(request, context, user);
    } catch (err: any) {
      return fail(err?.message || fallbackMessage, 500);
    }
  };
}

/** Respons gagal berbentuk `{ error }` — dipakai subset route portal. */
export function errorBody(error: string, status: number): NextResponse {
  return NextResponse.json({ error }, { status });
}

/**
 * Varian `memberRoute` untuk route portal yang memakai envelope berbeda:
 * `{ error }` saat gagal dan objek telanjang (`{ events }`, `{ attendees }`)
 * saat sukses, bukan `{ success, data }`.
 *
 * Dipisah alih-alih diseragamkan karena bentuk itu sudah jadi kontrak dengan
 * komponen portal yang memakainya; menyatukannya adalah perubahan API
 * tersendiri, bukan bagian dari pembersihan ini.
 *
 * Error tak tertangani dicatat ke log sebelum dikembalikan, meniru
 * `console.error` yang sebelumnya ada di tiap route ini.
 */
export function memberRouteRaw<P = Record<string, string>>(
  handler: (
    request: NextRequest,
    context: RouteContext<P>,
    member: MemberJwtPayload
  ) => Promise<NextResponse>,
  fallbackError: string,
  logLabel: string
) {
  return async (request: NextRequest, context: RouteContext<P>): Promise<NextResponse> => {
    try {
      const user = getUserFromRequest(request, 'member');
      if (!requireMember(user)) {
        return errorBody('Unauthorized', 401);
      }
      return await handler(request, context, user);
    } catch (err: any) {
      console.error(logLabel, err);
      return errorBody(fallbackError, 500);
    }
  };
}
