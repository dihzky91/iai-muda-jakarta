import 'dotenv/config';
import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function migrateHallOfFame() {
  console.log('🔄 Running Hall of Fame schema updates...');

  try {
    // 1. Add cabinet fields to generations if not exists
    try {
      await db.execute(sql`ALTER TABLE generations ADD COLUMN cabinet_name VARCHAR(100) NULL AFTER years`);
      console.log('✓ Added cabinet_name column to generations');
    } catch (e: any) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ cabinet_name column already exists');
      } else {
        console.log('Info:', e.message);
      }
    }

    try {
      await db.execute(sql`ALTER TABLE generations ADD COLUMN vision_mission TEXT NULL AFTER cabinet_name`);
      console.log('✓ Added vision_mission column to generations');
    } catch (e: any) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ vision_mission column already exists');
      } else {
        console.log('Info:', e.message);
      }
    }

    try {
      await db.execute(sql`ALTER TABLE generations ADD COLUMN logo_url VARCHAR(500) NULL AFTER vision_mission`);
      console.log('✓ Added logo_url column to generations');
    } catch (e: any) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ logo_url column already exists');
      } else {
        console.log('Info:', e.message);
      }
    }

    // 2. Create history_milestones table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS history_milestones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        generation_id INT NOT NULL,
        event_date VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image_url VARCHAR(500),
        impact_tag VARCHAR(100),
        sort_order INT DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        INDEX idx_milestones_generation_id (generation_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ history_milestones table ready');

    // 3. Create alumni_board table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS alumni_board (
        id INT AUTO_INCREMENT PRIMARY KEY,
        generation_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        role_name VARCHAR(255) NOT NULL,
        current_company VARCHAR(255),
        photo_url VARCHAR(500),
        quote TEXT,
        sort_order INT DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        INDEX idx_alumni_generation_id (generation_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ alumni_board table ready');

    // 4. Create wall_of_champions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS wall_of_champions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        generation_id INT NOT NULL,
        award_type ENUM('member_of_the_year', 'best_proker', 'other') DEFAULT 'other' NOT NULL,
        title VARCHAR(255) NOT NULL,
        winner_name VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        sort_order INT DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        INDEX idx_champions_generation_id (generation_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ wall_of_champions table ready');

    console.log('✅ Hall of Fame DB migration completed!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrateHallOfFame();
