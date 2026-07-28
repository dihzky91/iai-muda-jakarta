// './index' harus lebih dulu — di situ `dotenv/config` dimuat, dan
// '../lib/auth' butuh JWT_SECRET sudah tersedia saat dievaluasi.
import { db, schema } from './index';
import { sql, eq } from 'drizzle-orm';
import { hashPassword } from '../lib/auth';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Clear existing data (order matters for FK constraints)
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
    await db.execute(sql`TRUNCATE TABLE members`);
    await db.execute(sql`TRUNCATE TABLE events`);
    await db.execute(sql`TRUNCATE TABLE articles`);
    await db.execute(sql`TRUNCATE TABLE galleries`);
    await db.execute(sql`TRUNCATE TABLE pillars`);
    await db.execute(sql`TRUNCATE TABLE positions`);
    await db.execute(sql`TRUNCATE TABLE generations`);
    await db.execute(sql`TRUNCATE TABLE users`);
    await db.execute(sql`TRUNCATE TABLE settings`);
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

    // Insert pillars
    const pillars = [
      {
        title: 'Integritas Standar Tinggi',
        description: 'Menjaga integritas profesional dan etika luhur sesuai dengan kode etik Ikatan Akuntan Indonesia (IAI) sejak dini sebagai fondasi utama berkarir.',
        iconName: 'Shield',
        sortOrder: 1,
      },
      {
        title: 'Literasi Finansial & Teknologi',
        description: 'Mendorong penguasaan alat analisis data cerdas (data analytics), kecerdasan buatan, dan teknologi audit terkini guna mendukung digitalisasi keuangan.',
        iconName: 'Landmark',
        sortOrder: 2,
      },
      {
        title: 'Sinergi & Jaringan Karir',
        description: 'Membangun jembatan networking kokoh antara universitas, akuntan korporasi, KAP Big 4, regulator keuangan, dan komunitas global.',
        iconName: 'Award',
        sortOrder: 3,
      },
    ];

    await db.insert(schema.pillars).values(pillars);
    console.log('✓ Pillars inserted');

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

    // Insert articles
    const articles = [
      {
        title: 'Menjawab Tantangan AI: Mengapa Akuntan Muda Tak Tergantikan?',
        excerpt: 'Kecerdasan Buatan (AI) dapat mengotomatisasi pembukuan dasar, namun akuntabilitas, etika profesi, dan strategic judgment tetap menjadi keunggulan utama akuntan manusia.',
        content: 'Perkembangan Artificial Intelligence (AI) seperti ChatGPT, Copilot, dan sistem otomasi cloud accounting seringkali memicu kekhawatiran di kalangan mahasiswa akuntansi. Apakah profesi akuntan akan punah?\n\nKenyataannya tidaklah demikian. Teknologi memang mengeliminasi entri data repetitif, namun justru membebaskan akuntan muda untuk fokus pada peran yang lebih bernilai tinggi: interpretasi data strategis, pengelolaan risiko, kepatuhan perpajakan yang kompleks, serta audit investigatif.\n\nAkuntan masa depan adalah akuntan hibrida yang menguasai konsep akuntansi dasar sekaligus melek teknologi analisis data (seperti SQL, Python, atau PowerBI). IAI Muda Wilayah DKI Jakarta berkomitmen penuh membekali anggotanya agar siap memimpin transformasi digital ini.',
        date: '2026-06-28',
        author: 'Muhammad Farhan',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&fit=crop&q=80',
      },
      {
        title: 'Panduan Ujian Chartered Accountant (CA) untuk Mahasiswa dan Fresh Graduate',
        excerpt: 'Langkah taktis mempersiapkan diri menghadapi ujian CA IAI mulai dari pemetaan materi, manajemen waktu belajar, hingga tips menjawab studi kasus.',
        content: 'Gelar Chartered Accountant (CA) dari Ikatan Akuntan Indonesia merupakan standar kompetensi tertinggi bagi akuntan profesional di Indonesia. Memperoleh gelar ini di usia muda memberikan daya saing luar biasa di bursa kerja internasional.\n\nBagi rekan-rekan mahasiswa tingkat akhir atau fresh graduate, mempersiapkan ujian CA membutuhkan konsistensi tinggi. Berikut 3 pilar sukses lulus CA:\n1. Kuasai Standar Akuntansi Keuangan (SAK) terbaru yang berbasis IFRS.\n2. Latihan studi kasus terintegrasi, khususnya terkait Pelaporan Korporat dan Manajemen Keuangan Strategis.\n3. Ikuti program bimbingan belajar resmi yang diselenggarakan IAI Wilayah DKI Jakarta.\n\nMari jadikan tahun kepengurusan ini momentum emas untuk mengantongi gelar profesional Anda!',
        date: '2026-05-14',
        author: 'Devan Pramudya',
        imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&fit=crop&q=80',
      },
    ];

    await db.insert(schema.articles).values(articles);
    console.log('✓ Articles inserted');

    // Insert galleries
    const galleries = [
      {
        title: 'Pelantikan & Rapat Kerja Gen-2',
        description: 'Sesi foto bersama seluruh jajaran pengurus IAI Muda Wilayah DKI Jakarta Generasi ke-2 setelah proses pelantikan resmi di Jakarta.',
        imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&fit=crop&q=80',
        date: '2025-11-22',
        category: 'Rapat Kerja (Raker)',
        photographer: 'Divisi Media',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&fit=crop&q=80',
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&fit=crop&q=80'
        ]),
      },
      {
        title: 'Webinar PSAK 74 Live Session',
        description: 'Antusiasme peserta dalam menyimak penjelasan narasumber mengenai implementasi standar kontrak asuransi PSAK 74.',
        imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&fit=crop&q=80',
        date: '2026-07-15',
        category: 'Webinar & Talkshow',
        photographer: 'Humas IAI',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&fit=crop&q=80',
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&fit=crop&q=80'
        ]),
      },
      {
        title: 'Accounting Class Roadshow',
        description: 'Kunjungan edukatif tim IAI Muda DKI ke universitas-universitas di Jakarta dalam rangka sosialisasi sertifikasi profesi CA.',
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&fit=crop&q=80',
        date: '2026-03-05',
        category: 'Sosial & Pengabdian',
      },
      {
        title: 'Networking & Coffee Morning',
        description: 'Momen akrab diskusi santai antara pengurus IAI Muda DKI dengan para profesional senior KAP Big 4.',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&fit=crop&q=80',
        date: '2026-01-18',
        category: 'Kunjungan Industri',
      },
    ];

    await db.insert(schema.galleries).values(galleries);
    console.log('✓ Galleries inserted');

    // Insert members for Gen 2
    const memberData = [
      { generationId: 2, positionId: 1, name: 'Muhammad Farhan, S.Ak., CA', division: 'Badan Pengurus Harian (BPH)', university: 'Universitas Indonesia', email: 'farhan@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com/in/farhan' },
      { generationId: 2, positionId: 2, name: 'Annisa Larasati, S.Ak.', division: 'Badan Pengurus Harian (BPH)', university: 'Universitas Gadjah Mada', email: 'annisa@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com/in/annisa' },
      { generationId: 2, positionId: 3, name: 'Reza Aditya, S.Ak.', division: 'Badan Pengurus Harian (BPH)', university: 'Universitas Padjadjaran', email: 'reza@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com/in/reza' },
      { generationId: 2, positionId: 4, name: 'Citra Dewi, S.Ak.', division: 'Badan Pengurus Harian (BPH)', university: 'Binus University', email: 'citra@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com/in/citra' },
      { generationId: 2, positionId: 5, name: 'Devan Pramudya, S.Ak.', division: 'Bidang Edukasi & Sertifikasi', university: 'Universitas Trisakti', email: 'devan@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&fit=crop&q=80' },
      { generationId: 2, positionId: 6, name: 'Gita Amalia, S.Ak.', division: 'Bidang Hubungan Masyarakat', university: 'Universitas Diponegoro', email: 'gita@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&fit=crop&q=80' },
      { generationId: 2, positionId: 7, name: 'Faisal Riza, S.Ak.', division: 'Bidang Kewirausahaan & Kemitraan', university: 'Universitas Airlangga', email: 'faisal@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&fit=crop&q=80' },
      { generationId: 2, positionId: 8, name: 'Arya Putra', division: 'Bidang Media & Desain Kreatif', university: 'Universitas Sebelas Maret', email: 'arya@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=300&fit=crop&q=80' },
    ];

    await db.insert(schema.members).values(memberData);
    console.log('✓ Members inserted');

    // Insert default status 'hijau' untuk seeded members
    const seededMembers = await db
      .select({ id: schema.members.id })
      .from(schema.members)
      .where(eq(schema.members.generationId, 2));

    await db.insert(schema.memberStatuses).values(
      seededMembers.map(m => ({
        memberId: m.id,
        status: 'hijau' as const,
        reason: 'Status awal',
        changedBy: 1,
      }))
    );
    console.log('✓ Default member statuses inserted');

    // Seed default superadmin user
    const defaultPassword = process.env.SUPERADMIN_PASSWORD || 'admin123';
    const passwordHash = await hashPassword(defaultPassword);
    await db.insert(schema.users).values({
      username: 'superadmin',
      passwordHash,
      role: 'superadmin',
    });
    console.log(`✓ Superadmin created — username: superadmin / password: ${defaultPassword}`);
    if (!process.env.SUPERADMIN_PASSWORD) {
      console.log('⚠️  PERINGATAN: Gunakan env SUPERADMIN_PASSWORD untuk set password yang aman!');
    }

    // Insert default settings
    await db.insert(schema.settings).values({
      id: 1,
      contactTitle: 'Hubungi IAI Wilayah DKI Jakarta',
      contactDescription: 'Punya pertanyaan mengenai kemitraan webinar, atau ingin bergabung dengan kepengurusan generasi berikutnya? Kami siap menyambut Anda.',
      address: 'Jl. Menteng Raya No. 29, Menteng, Jakarta Pusat, DKI Jakarta 10310',
      email: 'iaimuda.dki@iai.or.id / dki@iaiglobal.or.id',
      phone: '(021) 3190-4232 ext. 202',
      showPhone: true,
      instagramUrl: 'https://instagram.com/iai_muda_dki',
      linkedinUrl: 'https://linkedin.com/company/iai-muda-dki',
      youtubeUrl: 'https://youtube.com/@iai_muda_dki',
      divisions: JSON.stringify([
        'Badan Pengurus Harian (BPH)',
        'Bidang Edukasi & Sertifikasi',
        'Bidang Hubungan Masyarakat',
        'Bidang Kewirausahaan & Kemitraan',
        'Bidang Media & Desain Kreatif',
      ]),
      footerDescription: 'IAI Muda Wilayah DKI Jakarta merupakan badan kelengkapan Ikatan Akuntan Indonesia (IAI) Wilayah DKI Jakarta yang menjadi wadah pengembangan kompetensi, kolaborasi, dan jejaring profesional bagi generasi akuntan muda.',
    });
    console.log('✓ Default settings inserted');

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
