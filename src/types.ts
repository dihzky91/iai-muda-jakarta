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
  phone?: string | null;
  whatsapp?: string | null;
  bio?: string | null;
  isAlumni?: boolean;
  showPublic?: boolean; // Control visibility on public page (from DB schema line 47)
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;         // YYYY-MM-DD
  endDate?: string | null; // YYYY-MM-DD, opsional, untuk event multi-hari
  time: string;         // HH:MM
  location: string;     // e.g., "Gedung IAI, Menteng / Zoom Meeting"
  imageUrl?: string;
  status: 'ongoing' | 'upcoming' | 'completed';
  registrationUrl?: string;
  eventType?: 'public' | 'internal'; // 'public' = terbuka untuk umum, 'internal' = khusus pengurus
  allDay?: boolean;     // true = sepanjang hari
  color?: string;       // nama warna chip: 'blue' | 'emerald' | 'purple' | 'amber' | 'slate' (default 'blue')
}

// Extended Event untuk portal anggota (include RSVP info)
export interface MemberEvent extends Event {
  myRsvpStatus?: 'attending' | 'not_attending' | 'maybe' | null;
  stats?: {
    totalAttending: number;
    totalNotAttending: number;
    totalMaybe: number;
    totalResponded: number;
  };
  myRsvp?: {
    status: 'attending' | 'not_attending' | 'maybe';
    respondedAt: string;
  } | null;
}

export interface RsvpStats {
  totalAttending: number;
  totalNotAttending: number;
  totalMaybe: number;
  totalResponded: number;
}

export type RsvpStatus = 'attending' | 'not_attending' | 'maybe';

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
