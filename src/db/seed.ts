import { db, schema } from './index';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Clear existing data (order matters for FK constraints)
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
    await db.execute(sql`TRUNCATE TABLE members`);
    await db.execute(sql`TRUNCATE TABLE events`);
    await db.execute(sql`TRUNCATE TABLE positions`);
    await db.execute(sql`TRUNCATE TABLE generations`);
    await db.execute(sql`TRUNCATE TABLE users`);
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

    // Insert generations
    await db.insert(schema.generations).values([
      {
        slug: 'gen-1',
        name: 'Generasi ke-1',
        years: '2024-2025',
        isActive: false,
      },
      {
        slug: 'gen-2',
        name: 'Generasi ke-2',
        years: '2025-2026',
        isActive: true,
      },
    ]);

    console.log('✓ Generations inserted');

    // Insert positions
    const positions = [
      { name: 'Ketua Umum', category: 'Badan Pengurus Harian (BPH)', sortOrder: 1 },
      { name: 'Wakil Ketua Umum', category: 'Badan Pengurus Harian (BPH)', sortOrder: 2 },
      { name: 'Sekretaris Jenderal', category: 'Badan Pengurus Harian (BPH)', sortOrder: 3 },
      { name: 'Bendahara Umum', category: 'Badan Pengurus Harian (BPH)', sortOrder: 4 },
      { name: 'Kepala Bidang Edukasi', category: 'Bidang Edukasi & Sertifikasi', sortOrder: 5 },
      { name: 'Kepala Bidang Hubungan Masyarakat', category: 'Bidang Hubungan Masyarakat', sortOrder: 6 },
      { name: 'Kepala Bidang Kewirausahaan', category: 'Bidang Kewirausahaan & Kemitraan', sortOrder: 7 },
      { name: 'Kepala Bidang Media & Desain', category: 'Bidang Media & Desain Kreatif', sortOrder: 8 },
    ];

    await db.insert(schema.positions).values(positions);
    console.log('✓ Positions inserted');

    // Insert events
    const events = [
      {
        title: 'Webinar PSAK 74: Standardisasi Baru Akuntansi Kontrak Asuransi',
        description: 'Bedah tuntas implementasi PSAK 74 bersama praktisi akuntansi senior dan Dewan Standar Akuntansi Keuangan (DSAK) IAI. Ditujukan bagi mahasiswa tingkat akhir dan akuntan muda DKI Jakarta.',
        date: '2026-07-15',
        time: '13:00',
        location: 'Interactive Zoom Meeting & YouTube Live IAI Muda DKI',
        imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&fit=crop&q=80',
        status: 'ongoing' as const,
        registrationUrl: 'https://forms.gle/iai-muda-webinar-psak74',
        generationId: 2,
      },
      {
        title: 'IAI Muda DKI Career Talk & Networking 2026',
        description: 'Temukan jalur karir impianmu di Big 4 KAP, Korporasi Multinasional, BUMN, maupun Tech Startup. Sesi talkshow interaktif, review CV gratis, dan networking langsung dengan HR & praktisi.',
        date: '2026-08-08',
        time: '09:00',
        location: 'Aula Grha Akuntan IAI, Menteng, Jakarta Pusat',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&fit=crop&q=80',
        status: 'upcoming' as const,
        registrationUrl: 'https://forms.gle/iai-muda-careertalk2026',
        generationId: 2,
      },
      {
        title: 'Accounting Youth Summit & Bootcamp 2026',
        description: 'Bootcamp intensif 3 hari mengenai Financial Modeling, Business Valuation, dan Analisis Keuangan berbasis Python. Menghadirkan mentor bersertifikasi CFA dan Chartered Accountant.',
        date: '2026-09-12',
        time: '08:00',
        location: 'JS Luwansa Hotel, Kuningan & Hybrid Workshop',
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&fit=crop&q=80',
        status: 'upcoming' as const,
        registrationUrl: 'https://forms.gle/iai-muda-bootcamp2026',
        generationId: 2,
      },
      {
        title: 'Pelatihan Chartered Accountant (CA) Try Out & Preparation',
        description: 'Mempersiapkan akuntan muda berprestasi DKI Jakarta untuk menempuh ujian sertifikasi CA IAI. Pembahasan soal Akuntansi Keuangan Lanjutan dan Manajemen Keuangan Strategis.',
        date: '2026-04-10',
        time: '10:00',
        location: 'Grha Akuntan, Menteng',
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&fit=crop&q=80',
        status: 'completed' as const,
        generationId: 2,
      },
    ];

    await db.insert(schema.events).values(events);
    console.log('✓ Events inserted');

    // Insert members for Gen 2
    const memberData = [
      { generationId: 2, positionId: 1, name: 'Muhammad Farhan, S.Ak., CA', division: 'Badan Pengurus Harian (BPH)', email: 'farhan@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com/in/farhan' },
      { generationId: 2, positionId: 2, name: 'Annisa Larasati, S.Ak.', division: 'Badan Pengurus Harian (BPH)', email: 'annisa@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com/in/annisa' },
      { generationId: 2, positionId: 3, name: 'Reza Aditya, S.Ak.', division: 'Badan Pengurus Harian (BPH)', email: 'reza@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com/in/reza' },
      { generationId: 2, positionId: 4, name: 'Citra Dewi, S.Ak.', division: 'Badan Pengurus Harian (BPH)', email: 'citra@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com/in/citra' },
      { generationId: 2, positionId: 5, name: 'Devan Pramudya, S.Ak.', division: 'Bidang Edukasi & Sertifikasi', email: 'devan@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&fit=crop&q=80' },
      { generationId: 2, positionId: 6, name: 'Gita Amalia, S.Ak.', division: 'Bidang Hubungan Masyarakat', email: 'gita@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&fit=crop&q=80' },
      { generationId: 2, positionId: 7, name: 'Faisal Riza, S.Ak.', division: 'Bidang Kewirausahaan & Kemitraan', email: 'faisal@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&fit=crop&q=80' },
      { generationId: 2, positionId: 8, name: 'Arya Putra', division: 'Bidang Media & Desain Kreatif', email: 'arya@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=300&fit=crop&q=80' },
    ];

    await db.insert(schema.members).values(memberData);
    console.log('✓ Members inserted');

    // Seed default superadmin user
    const defaultPassword = process.env.SUPERADMIN_PASSWORD || 'admin123';
    const passwordHash = await bcrypt.hash(defaultPassword, 12);
    await db.insert(schema.users).values({
      username: 'superadmin',
      passwordHash,
      role: 'superadmin',
    });
    console.log(`✓ Superadmin created — username: superadmin / password: ${defaultPassword}`);
    if (!process.env.SUPERADMIN_PASSWORD) {
      console.log('⚠️  PERINGATAN: Gunakan env SUPERADMIN_PASSWORD untuk set password yang aman!');
    }

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
