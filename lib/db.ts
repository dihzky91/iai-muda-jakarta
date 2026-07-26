import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../db/schema';

const isTiDB = process.env.DB_HOST?.includes('tidb');

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'iai_muda_jakarta',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: isTiDB ? 5 : 10, // TiDB serverless: limit koneksi lebih kecil
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    maxIdle: isTiDB ? 2 : 5, // Jumlah koneksi idle maksimal
    idleTimeout: 30000, // Tutup koneksi idle setelah 30 detik (sebelum TiDB kill di 60s)
    connectTimeout: 10000, // Timeout koneksi 10 detik
    ...(isTiDB ? {
      ssl: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2'
      }
    } : {}),
  });
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
