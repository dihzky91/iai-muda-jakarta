import { drizzle } from 'drizzle-orm/mysql2';
import type { MySqlRawQueryResult } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../db/schema';

const isTiDB = process.env.DB_HOST?.includes('tidb');

function createPool() {
  const p = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'iai_muda_jakarta',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: isTiDB ? 5 : 10, // TiDB serverless: limit koneksi melebih kecil
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 2000,
    maxIdle: isTiDB ? 2 : 5, // Jumlah koneksi idle maksimal
    idleTimeout: 15000, // Tutup koneksi idle setelah 15 detik (sebelum DB server kill koneksi)
    connectTimeout: 10000, // Timeout koneksi 10 detik
    ...(isTiDB ? {
      ssl: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2'
      }
    } : {}),
  });

  (p as any).setMaxListeners(30);
  (p as any).on('error', (err: any) => {
    console.warn('[MySQL Pool Warning]', err?.code || err?.message);
  });

  return p;
}

/**
 * Pool disimpan di globalThis supaya hot-reload Next.js (dev) tidak membuat
 * pool baru setiap kali modul ini dievaluasi ulang. Tanpa ini, satu sesi dev
 * bisa menumpuk puluhan koneksi dan menabrak limit TiDB serverless.
 *
 * CATATAN: ini satu-satunya tempat pool dibuat. `db/index.ts` hanya
 * me-re-export dari sini — jangan bikin pool kedua di mana pun.
 */
const globalForDb = globalThis as unknown as {
  __mysqlPool?: mysql.Pool;
};

const pool = globalForDb.__mysqlPool ?? createPool();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__mysqlPool = pool;
}

export const db = drizzle(pool, { schema, mode: 'default' });
export { schema, pool };

/**
 * Ambil id baris hasil INSERT.
 *
 * `db.insert(...)` pada driver mysql2 mengembalikan TUPLE
 * `[ResultSetHeader, FieldPacket[]]`, bukan objek. Jadi `result.insertId`
 * bernilai `undefined` — id-nya ada di `result[0].insertId`.
 *
 * Seluruh route sebelumnya menulis `(result as any).insertId`; cast itu
 * membungkam TypeScript sekaligus menyembunyikan bahwa nilainya selalu
 * undefined, sehingga setiap endpoint create mengembalikan `id: undefined`
 * dan `resolvePositionId()` gagal menautkan jabatan yang baru dibuat.
 */
export function insertedId(result: MySqlRawQueryResult): number {
  return result[0].insertId;
}

let eventsSchemaChecked = false;

/**
 * Memastikan kolom-kolom baru pada tabel events.
 * (Di-bypass untuk performa cepat & menghindari DDL lock di TiDB/MySQL).
 */
export async function ensureEventsSchema() {
  return;
}
