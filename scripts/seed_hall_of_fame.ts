import 'dotenv/config';
import { db, schema } from '../lib/db';
import { eq } from 'drizzle-orm';

async function seedHallOfFame() {
  console.log('🌱 Seeding Hall of Fame data...');

  try {
    // 1. Update generations metadata
    await db.update(schema.generations)
      .set({
        cabinetName: 'Kabinet Perintis',
        visionMission: 'Membangun fondasi tata kelola dan jejaring awal akuntan muda di DKI Jakarta.',
      })
      .where(eq(schema.generations.id, 1));

    await db.update(schema.generations)
      .set({
        cabinetName: 'Kabinet Akselerasi',
        visionMission: 'Mengakselerasi digitalisasi, kepemimpinan, dan kompetensi global akuntan muda DKI Jakarta.',
      })
      .where(eq(schema.generations.id, 2));

    console.log('✓ Generations metadata updated');

    // 2. Clear existing Hall of Fame tables
    await db.delete(schema.historyMilestones);
    await db.delete(schema.alumniBoard);
    await db.delete(schema.wallOfChampions);

    // 3. Seed History Milestones
    await db.insert(schema.historyMilestones).values([
      // Gen 1 Milestones
      {
        generationId: 1,
        eventDate: '15 Oktober 2024',
        title: 'Musyawarah Wilayah I & Deklarasi IAI Muda DKI Jakarta',
        description: 'Peresmian pembentukan Badan Kelengkapan IAI Muda Wilayah DKI Jakarta yang dihadiri pengurus IAI Wilayah DKI Jakarta dan perwakilan HIMA Akuntansi se-DKI Jakarta.',
        imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&fit=crop&q=80',
        impactTag: '120+ Pendiri & Perwakilan HIMA',
        sortOrder: 1,
      },
      {
        generationId: 1,
        eventDate: '20 Desember 2024',
        title: 'Peluncuran Program Mentoring Sertifikasi CA Pertama',
        description: 'Inisiasi program bimbingan belajar dan tryout perdana bagi mahasiswa akuntansi DKI Jakarta untuk persiapan ujian Chartered Accountant (CA).',
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&fit=crop&q=80',
        impactTag: '250+ Peserta Mentoring',
        sortOrder: 2,
      },
      // Gen 2 Milestones
      {
        generationId: 2,
        eventDate: '22 November 2025',
        title: 'Pelantikan Pengurus Gen-2 & Rapat Kerja Wilayah',
        description: 'Pelantikan resmi kepengurusan Generasi ke-2 di Grha Akuntan IAI Menteng dengan pengesahan 15 program kerja unggulan tahun berjalan.',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&fit=crop&q=80',
        impactTag: '80+ Pengurus Dilantik',
        sortOrder: 1,
      },
      {
        generationId: 2,
        eventDate: '15 Juli 2026',
        title: 'Webinar Nasional PSAK 74 & Digital Accounting Summit',
        description: 'Webinar akbar bedah standar baru akuntansi asuransi PSAK 74 bersama praktisi DSAK IAI dan mitra audit Big 4 KAP.',
        imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&fit=crop&q=80',
        impactTag: '1,500+ Registrasi Peserta',
        sortOrder: 2,
      },
      {
        generationId: 2,
        eventDate: '1 Agustus 2026',
        title: 'Peluncuran Official Member Portal & Command Palette',
        description: 'Transformasi digital penuh dengan merilis Member Portal IAI Muda DKI Jakarta yang dilengkapi fitur jejaring HIMA, Komunitas, dan HR Command Center.',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&fit=crop&q=80',
        impactTag: 'Portal Digital Terintegrasi',
        sortOrder: 3,
      },
    ]);
    console.log('✓ History Milestones seeded');

    // 4. Seed Alumni Board / Leadership Legacy
    await db.insert(schema.alumniBoard).values([
      // Gen 1 Demisioner Leaders
      {
        generationId: 1,
        name: 'Bintang Ramadhan, S.Ak., CA',
        roleName: 'Ketua Umum (Demisioner Gen-1)',
        currentCompany: 'Senior Auditor di KAP EY Indonesia',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80',
        quote: 'Integritas dan keberanian melangkah adalah fondasi utama akuntan muda dalam memimpin perubahan.',
        sortOrder: 1,
      },
      {
        generationId: 1,
        name: 'Nabila Putri, S.Ak.',
        roleName: 'Sekretaris Umum (Demisioner Gen-1)',
        currentCompany: 'Financial Controller di GoTo Group',
        photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&fit=crop&q=80',
        quote: 'Tata kelola yang tertata adalah kunci keberlanjutan sebuah organisasi profesional.',
        sortOrder: 2,
      },
      {
        generationId: 1,
        name: 'Daffa Pratama, S.Ak.',
        roleName: 'Bendahara Umum (Demisioner Gen-1)',
        currentCompany: 'Tax Specialist di PwC Indonesia',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&fit=crop&q=80',
        quote: 'Akuntabilitas finansial membentuk kepercayaan publik terhadap regenerasi akuntan.',
        sortOrder: 3,
      },
      // Gen 2 Current Leaders (Active Leaders)
      {
        generationId: 2,
        name: 'Muhammad Farhan, S.Ak., CA',
        roleName: 'Ketua Umum (Gen-2)',
        currentCompany: 'Assurance Professional & Chair IAI Muda DKI',
        photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&fit=crop&q=80',
        quote: 'Membangun sinergi berkelanjutan antara akademisi, praktisi, dan akuntan muda berdaya saing global.',
        sortOrder: 1,
      },
      {
        generationId: 2,
        name: 'Annisa Larasati, S.Ak.',
        roleName: 'Wakil Ketua Umum (Gen-2)',
        currentCompany: 'ESG & Sustainability Analyst',
        photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&fit=crop&q=80',
        quote: 'Empowering youth accountants to master sustainability and global reporting standards.',
        sortOrder: 2,
      },
    ]);
    console.log('✓ Alumni Board seeded');

    // 5. Seed Wall of Champions
    await db.insert(schema.wallOfChampions).values([
      {
        generationId: 1,
        awardType: 'member_of_the_year',
        title: '🏆 Member of the Year 2024',
        winnerName: 'Reza Aditya, S.Ak.',
        description: 'Apresiasi atas dedikasi luar biasa dalam pengembangan kurikulum Mentoring CA & sinergi kampus.',
        imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&fit=crop&q=80',
        sortOrder: 1,
      },
      {
        generationId: 1,
        awardType: 'best_proker',
        title: '🚀 Best Program Kerja 2024',
        winnerName: 'Mentoring Try Out CA Perdana',
        description: 'Program kerja dengan tingkat kelulusan tryout tertinggi dan kepuasan peserta 98%.',
        imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&fit=crop&q=80',
        sortOrder: 2,
      },
      {
        generationId: 2,
        awardType: 'best_proker',
        title: '🚀 Best Program Kerja 2025/2026',
        winnerName: 'IAI Muda DKI Career Talk & Networking',
        description: 'Menghubungkan 500+ mahasiswa akuntansi dengan 12 Kantor Akuntan Publik (KAP) papan atas.',
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&fit=crop&q=80',
        sortOrder: 1,
      },
    ]);
    console.log('✓ Wall of Champions seeded');

    console.log('✅ Hall of Fame seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    process.exit(0);
  }
}

seedHallOfFame();
