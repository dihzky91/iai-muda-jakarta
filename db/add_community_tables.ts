/**
 * Migration Script: Tambah Tabel Ruang Komunitas & Notifikasi Portal
 *
 * Tabel yang dibuat:
 * - community_posts
 * - community_comments
 * - community_reactions
 * - community_mentions
 * - portal_notifications
 *
 * Run: npx tsx db/add_community_tables.ts
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';

async function main() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = parseInt(process.env.DB_PORT || '3306', 10);

  if (!host || !user || !database) {
    console.error('❌ DB_HOST / DB_USER / DB_NAME belum di-set di .env');
    process.exit(1);
  }

  const isTiDB = host.includes('tidb');

  const conn = await mysql.createConnection({
    host,
    user,
    password,
    database,
    port,
    ...(isTiDB
      ? {
          ssl: {
            rejectUnauthorized: true,
            minVersion: 'TLSv1.2' as const,
          },
        }
      : {}),
  });

  console.log('⚡ Memulai Migrasi Tabel Ruang Komunitas & Notifikasi...');

  const queries = [
    // 1. Table: community_posts
    `CREATE TABLE IF NOT EXISTS community_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      member_id INT NOT NULL,
      content TEXT NOT NULL,
      image_url VARCHAR(500) NULL,
      attachment_url VARCHAR(500) NULL,
      attachment_name VARCHAR(255) NULL,
      scope ENUM('all', 'division', 'generation') NOT NULL DEFAULT 'all',
      target_division VARCHAR(255) NULL,
      is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_posts_member_scope_created (member_id, scope, created_at),
      INDEX idx_posts_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    // 2. Table: community_comments
    `CREATE TABLE IF NOT EXISTS community_comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      parent_id INT NULL,
      member_id INT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_comments_post_parent_created (post_id, parent_id, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    // 3. Table: community_reactions
    `CREATE TABLE IF NOT EXISTS community_reactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      member_id INT NOT NULL,
      reaction_type ENUM('like', 'insightful', 'congrats', 'appreciate') NOT NULL DEFAULT 'like',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_reaction_post_member (post_id, member_id),
      INDEX idx_reaction_post (post_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    // 4. Table: community_mentions
    `CREATE TABLE IF NOT EXISTS community_mentions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      comment_id INT NULL,
      mentioned_member_id INT NOT NULL,
      author_member_id INT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_mentions_mentioned_member (mentioned_member_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    // 5. Table: portal_notifications
    `CREATE TABLE IF NOT EXISTS portal_notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      recipient_member_id INT NOT NULL,
      actor_member_id INT NOT NULL,
      type ENUM('mention', 'comment', 'reply', 'reaction') NOT NULL,
      target_post_id INT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_notif_recipient_read_created (recipient_member_id, is_read, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  ];

  for (const sql of queries) {
    try {
      await conn.query(sql);
      console.log('✅ Executed table statement successfully');
    } catch (err: any) {
      console.error('❌ Error executing SQL:', err.message);
    }
  }

  await conn.end();
  console.log('✨ Migrasi Database Ruang Komunitas Selesai!');
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
