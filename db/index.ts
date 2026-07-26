/**
 * Entry point DB untuk script CLI (seed, migrasi) yang dijalankan lewat `tsx`,
 * di luar Next.js — karena itu `.env` perlu dimuat manual.
 *
 * Pool-nya TIDAK dibuat di sini: modul ini hanya me-re-export instance tunggal
 * dari `lib/db.ts`. Sebelumnya ada dua `mysql.createPool()` terpisah (di sini
 * dan di `lib/db.ts`) sehingga satu proses membuka dua pool sekaligus dan
 * memakai dua kali jatah koneksi TiDB.
 *
 * Kode aplikasi (route handler, server component) harus import dari `@/lib/db`.
 */
import 'dotenv/config';

export { db, schema, pool, insertedId } from '../lib/db';
