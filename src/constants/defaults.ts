/**
 * Default values shared between server (API fallback) and client (initial state).
 * Single source of truth — edit di sini, berlaku di keduanya.
 */
import type { Settings } from '../types';

export const DEFAULT_DIVISIONS: string[] = [
  'Badan Pengurus Harian (BPH)',
  'Bidang Edukasi & Sertifikasi',
  'Bidang Hubungan Masyarakat',
  'Bidang Kewirausahaan & Kemitraan',
  'Bidang Media & Desain Kreatif',
];

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  contactTitle: 'Hubungi IAI Wilayah DKI Jakarta',
  contactDescription:
    'Punya pertanyaan mengenai kemitraan webinar, atau ingin bergabung dengan kepengurusan generasi berikutnya? Kami siap menyambut Anda.',
  address: 'Jl. Menteng Raya No. 29, Menteng, Jakarta Pusat, DKI Jakarta 10310',
  email: 'iaimuda.dki@iai.or.id / dki@iaiglobal.or.id',
  phone: '(021) 3190-4232 ext. 202',
  showPhone: true,
  instagramUrl: 'https://instagram.com/iai_muda_dki',
  linkedinUrl: 'https://linkedin.com/company/iai-muda-dki',
  youtubeUrl: 'https://youtube.com/@iai_muda_dki',
  divisionPhotos: '{}',
  divisions: JSON.stringify(DEFAULT_DIVISIONS),
  footerDescription:
    'IAI Muda Wilayah DKI Jakarta merupakan badan kelengkapan Ikatan Akuntan Indonesia (IAI) Wilayah DKI Jakarta yang menjadi wadah pengembangan kompetensi, kolaborasi, dan jejaring profesional bagi generasi akuntan muda.',
  logoUrl: null,
  faviconUrl: null,
};
