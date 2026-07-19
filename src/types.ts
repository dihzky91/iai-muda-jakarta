/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Generation {
  id: number;
  name: string;      // e.g. "Generasi ke-1", "Generasi ke-2"
  years: string;     // e.g. "2024-2025", "2025-2026"
  isActive: boolean; // Indicates if this is the current active committee
}

export interface Member {
  id: number;
  generationId: number; // References Generation
  name: string;
  position: string;     // e.g., "Ketua", "Wakil Ketua", "Kepala Bidang Edukasi", "Staf Humas"
  division: string | null; // e.g., "Badan Pengurus Harian (BPH)", "Bidang Edukasi & Sertifikasi"
  university?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  linkedinUrl?: string | null;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;         // YYYY-MM-DD
  time: string;         // HH:MM
  location: string;     // e.g., "Gedung IAI, Menteng / Zoom Meeting"
  imageUrl?: string;
  status: 'ongoing' | 'upcoming' | 'completed';
  registrationUrl?: string;
}

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  imageUrl?: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  category?: string;
  photographer?: string;
  images?: string[];
}

export interface Pillar {
  id: number;
  title: string;
  description: string;
  iconName: string;
  sortOrder: number;
}

export interface Settings {
  id: number;
  contactTitle: string;
  contactDescription: string;
  address: string;
  email: string;
  phone: string | null;
  showPhone: boolean;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  youtubeUrl?: string | null;
  divisionPhotos?: string | null;
  divisions?: string | null; // JSON array of division name strings
  footerDescription?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  updatedAt?: string;
}

