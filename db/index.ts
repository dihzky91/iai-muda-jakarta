import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import 'dotenv/config';

const isTiDB = process.env.DB_HOST?.includes('tidb');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'iai_muda_jakarta',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: isTiDB ? 5 : 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  maxIdle: isTiDB ? 2 : 5,
  idleTimeout: 30000,
  connectTimeout: 10000,
  ...(isTiDB ? { 
    ssl: { 
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2'
    } 
  } : {}),
});

export const db = drizzle(pool, { schema, mode: 'default' });
export { schema };
