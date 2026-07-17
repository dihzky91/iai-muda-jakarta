/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Generation, Member, Event, Article, GalleryItem } from './types';

export const initialGenerations: Generation[] = [
  {
    id: -1,
    name: 'Generasi ke-1',
    years: '2024-2025',
    isActive: false,
  },
  {
    id: -2,
    name: 'Generasi ke-2',
    years: '2025-2026',
    isActive: true,
  }
];

export const initialMembers: Member[] = [
  // --- GENERASI KE-2 (CURRENT ACTIVE) ---
  { id: -101, generationId: -2, name: 'Muhammad Farhan, S.Ak., CA', position: 'Ketua Umum', division: 'Badan Pengurus Harian (BPH)', email: 'farhan.muda@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com/in/farhan-sak' },
  { id: -102, generationId: -2, name: 'Annisa Larasati, S.Ak.', position: 'Wakil Ketua Umum', division: 'Badan Pengurus Harian (BPH)', email: 'annisa.larasati@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com/in/annisa-larasati' },
  { id: -103, generationId: -2, name: 'Reza Aditya, S.Ak.', position: 'Sekretaris Jenderal', division: 'Badan Pengurus Harian (BPH)', email: 'reza.aditya@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com/in/reza-aditya' },
  { id: -104, generationId: -2, name: 'Citra Dewi, S.Ak.', position: 'Bendahara Umum', division: 'Badan Pengurus Harian (BPH)', email: 'citra.dewi@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com/in/citra-dewi' },
  { id: -105, generationId: -2, name: 'Devan Pramudya, S.Ak.', position: 'Kepala Bidang Edukasi', division: 'Bidang Edukasi & Sertifikasi', email: 'devan.p@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com' },
  { id: -106, generationId: -2, name: 'Alya Syahira', position: 'Staf Edukasi & Kurikulum', division: 'Bidang Edukasi & Sertifikasi', email: 'alya.s@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com' },
  { id: -107, generationId: -2, name: 'Kevin Wijaya, S.Ak.', position: 'Staf Sertifikasi Profesi', division: 'Bidang Edukasi & Sertifikasi', email: 'kevin.w@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com' },
  { id: -108, generationId: -2, name: 'Gita Amalia, S.Ak.', position: 'Kepala Bidang Hubungan Masyarakat', division: 'Bidang Hubungan Masyarakat', email: 'gita.a@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com' },
  { id: -109, generationId: -2, name: 'Bimo Wicaksono', position: 'Staf Kemitraan Strategis', division: 'Bidang Hubungan Masyarakat', email: 'bimo.w@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com' },
  { id: -110, generationId: -2, name: 'Dinda Kirana', position: 'Staf Komunikasi Publik', division: 'Bidang Hubungan Masyarakat', email: 'dinda.k@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com' },
  { id: -111, generationId: -2, name: 'Faisal Riza, S.Ak.', position: 'Kepala Bidang Kewirausahaan', division: 'Bidang Kewirausahaan & Kemitraan', email: 'faisal.r@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com' },
  { id: -112, generationId: -2, name: 'Siti Rahma', position: 'Staf Pengembangan Bisnis', division: 'Bidang Kewirausahaan & Kemitraan', email: 'siti.r@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com' },
  { id: -113, generationId: -2, name: 'Arya Putra', position: 'Kepala Bidang Media & Desain', division: 'Bidang Media & Desain Kreatif', email: 'arya.p@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com' },
  { id: -114, generationId: -2, name: 'Nadia Safira', position: 'Staf Kreator Konten', division: 'Bidang Media & Desain Kreatif', email: 'nadia.s@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com' },

  // --- GENERASI KE-1 (HISTORICAL ARCHIVE) ---
  { id: -201, generationId: -1, name: 'Aditya Perkasa, S.Ak., CA', position: 'Ketua Umum', division: 'Badan Pengurus Harian (BPH)', email: 'aditya.p@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com' },
  { id: -202, generationId: -1, name: 'Ratih Pratiwi, S.Ak.', position: 'Wakil Ketua Umum', division: 'Badan Pengurus Harian (BPH)', email: 'ratih.p@iai-dki.or.id', imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&fit=crop&q=80', linkedinUrl: 'https://linkedin.com' },
  { id: -203, generationId: -1, name: 'Hafiz Pratama, S.Ak.', position: 'Sekretaris Jenderal', division: 'Badan Pengurus Harian (BPH)', imageUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&fit=crop&q=80' },
  { id: -204, generationId: -1, name: 'Mega Utami, S.Ak.', position: 'Bendahara Umum', division: 'Badan Pengurus Harian (BPH)', imageUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=300&fit=crop&q=80' },
  { id: -205, generationId: -1, name: 'Yusuf Habibi, S.Ak.', position: 'Kepala Bidang Edukasi & Kajian', division: 'Bidang Edukasi & Sertifikasi', imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&fit=crop&q=80' },
  { id: -206, generationId: -1, name: 'Laras Atika, S.Ak.', position: 'Kepala Bidang Humas', division: 'Bidang Hubungan Masyarakat', imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&fit=crop&q=80' },
];
export const initialEvents: Event[] = [
  { id: -1, title: 'Webinar PSAK 74: Standardisasi Baru Akuntansi Kontrak Asuransi', description: 'Bedah tuntas implementasi PSAK 74 bersama praktisi akuntansi senior dan Dewan Standar Akuntansi Keuangan (DSAK) IAI. Ditujukan bagi mahasiswa tingkat akhir dan akuntan muda DKI Jakarta.', date: '2026-07-15', time: '13:00', location: 'Interactive Zoom Meeting & YouTube Live IAI Muda DKI', imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&fit=crop&q=80', status: 'ongoing', registrationUrl: 'https://forms.gle/iai-muda-webinar-psak74' },
  { id: -2, title: 'IAI Muda DKI Career Talk & Networking 2026', description: 'Temukan jalur karir impianmu di Big 4 KAP, Korporasi Multinasional, BUMN, maupun Tech Startup. Sesi talkshow interaktif, review CV gratis, dan networking langsung dengan HR & praktisi.', date: '2026-08-08', time: '09:00', location: 'Aula Grha Akuntan IAI, Menteng, Jakarta Pusat', imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&fit=crop&q=80', status: 'upcoming', registrationUrl: 'https://forms.gle/iai-muda-careertalk2026' },
  { id: -3, title: 'Accounting Youth Summit & Bootcamp 2026', description: 'Bootcamp intensif 3 hari mengenai Financial Modeling, Business Valuation, dan Analisis Keuangan berbasis Python. Menghadirkan mentor bersertifikasi CFA dan Chartered Accountant.', date: '2026-09-12', time: '08:00', location: 'JS Luwansa Hotel, Kuningan & Hybrid Workshop', imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&fit=crop&q=80', status: 'upcoming', registrationUrl: 'https://forms.gle/iai-muda-bootcamp2026' },
  { id: -4, title: 'Pelatihan Chartered Accountant (CA) Try Out & Preparation', description: 'Mempersiapkan akuntan muda berprestasi DKI Jakarta untuk menempuh ujian sertifikasi CA IAI. Pembahasan soal Akuntansi Keuangan Lanjutan dan Manajemen Keuangan Strategis.', date: '2026-04-10', time: '10:00', location: 'Grha Akuntan, Menteng', imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&fit=crop&q=80', status: 'completed' },
  { id: -5, title: 'Rapat Kerja Wilayah & Upgrading Kepengurusan Gen 2', description: 'Rapat kerja akbar untuk merumuskan program kerja IAI Muda Wilayah DKI Jakarta Generasi ke-2 sekaligus sesi pembekalan kepemimpinan akuntan muda.', date: '2025-11-22', time: '09:00', location: 'Vila Bukit Sentul, Bogor', imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&fit=crop&q=80', status: 'completed' },
];

export const initialArticles: Article[] = [
  {
    id: -1,
    title: 'Menjawab Tantangan AI: Mengapa Akuntan Muda Tak Tergantikan?',
    excerpt: 'Kecerdasan Buatan (AI) dapat mengotomatisasi pembukuan dasar, namun akuntabilitas, etika profesi, dan strategic judgment tetap menjadi keunggulan utama akuntan manusia.',
    content: `Perkembangan Artificial Intelligence (AI) seperti ChatGPT, Copilot, dan sistem otomasi cloud accounting seringkali memicu kekhawatiran di kalangan mahasiswa akuntansi. Apakah profesi akuntan akan punah?\n\nKenyataannya tidaklah demikian. Teknologi memang mengeliminasi entri data repetitif, namun justru membebaskan akuntan muda untuk fokus pada peran yang lebih bernilai tinggi: interpretasi data strategis, pengelolaan risiko, kepatuhan perpajakan yang kompleks, serta audit investigatif.\n\nAkuntan masa depan adalah akuntan hibrida yang menguasai konsep akuntansi dasar sekaligus melek teknologi analisis data (seperti SQL, Python, atau PowerBI). IAI Muda Wilayah DKI Jakarta berkomitmen penuh membekali anggotanya agar siap memimpin transformasi digital ini.`,
    date: '2026-06-28',
    author: 'Muhammad Farhan',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&fit=crop&q=80'
  },
  {
    id: -2,
    title: 'Panduan Ujian Chartered Accountant (CA) untuk Mahasiswa dan Fresh Graduate',
    excerpt: 'Langkah taktis mempersiapkan diri menghadapi ujian CA IAI mulai dari pemetaan materi, manajemen waktu belajar, hingga tips menjawab studi kasus.',
    content: `Gelar Chartered Accountant (CA) dari Ikatan Akuntan Indonesia merupakan standar kompetensi tertinggi bagi akuntan profesional di Indonesia. Memperoleh gelar ini di usia muda memberikan daya saing luar biasa di bursa kerja internasional.\n\nBagi rekan-rekan mahasiswa tingkat akhir atau fresh graduate, mempersiapkan ujian CA membutuhkan konsistensi tinggi. Berikut 3 pilar sukses lulus CA:\n1. Kuasai Standar Akuntansi Keuangan (SAK) terbaru yang berbasis IFRS.\n2. Latihan studi kasus terintegrasi, khususnya terkait Pelaporan Korporat dan Manajemen Keuangan Strategis.\n3. Ikuti program bimbingan belajar resmi yang diselenggarakan IAI Wilayah DKI Jakarta.\n\nMari jadikan tahun kepengurusan ini momentum emas untuk mengantongi gelar profesional Anda!`,
    date: '2026-05-14',
    author: 'Devan Pramudya',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&fit=crop&q=80'
  }
];

export const initialGallery: GalleryItem[] = [
  {
    id: -1,
    title: 'Pelantikan & Rapat Kerja Gen-2',
    description: 'Sesi foto bersama seluruh jajaran pengurus IAI Muda Wilayah DKI Jakarta Generasi ke-2 setelah proses pelantikan resmi di Jakarta.',
    imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&fit=crop&q=80',
    date: '2025-11-22',
    category: 'Rapat Kerja (Raker)',
    photographer: 'Divisi Media',
    images: [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&fit=crop&q=80'
    ]
  },
  {
    id: -2,
    title: 'Webinar PSAK 74 Live Session',
    description: 'Antusiasme peserta dalam menyimak penjelasan narasumber mengenai implementasi standar kontrak asuransi PSAK 74.',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&fit=crop&q=80',
    date: '2026-07-15',
    category: 'Webinar & Talkshow',
    photographer: 'Humas IAI',
    images: [
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&fit=crop&q=80'
    ]
  },
  {
    id: -3,
    title: 'Accounting Class Roadshow',
    description: 'Kunjungan edukatif tim IAI Muda DKI ke universitas-universitas di Jakarta dalam rangka sosialisasi sertifikasi profesi CA.',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&fit=crop&q=80',
    date: '2026-03-05',
    category: 'Sosial & Pengabdian'
  },
  {
    id: -4,
    title: 'Networking & Coffee Morning',
    description: 'Momen akrab diskusi santai antara pengurus IAI Muda DKI dengan para profesional senior KAP Big 4.',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&fit=crop&q=80',
    date: '2026-01-18',
    category: 'Kunjungan Industri'
  }
];

