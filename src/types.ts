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
  visibleToAlumni?: boolean; // untuk event internal, apakah visible ke alumni?
  allDay?: boolean;     // true = sepanjang hari
  color?: string;       // nama warna chip: 'blue' | 'emerald' | 'purple' | 'amber' | 'slate' (default 'blue')
  generationId?: number | null; // generasi kepengurusan penyelenggara, ada di tabel events
  isFeatured?: boolean;
  skpText?: string | null;
  skpSubtitle?: string | null;
  hasCertificate?: boolean;
  priceText?: string | null;
  speakersText?: string | null;
  categoryBadge?: string | null;
  isLive?: boolean;
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

// Event Committee (panitia event)
export interface EventCommittee {
  id: number;
  eventId: number;
  memberId: number;
  role: string; // 'ketua_panitia', 'acara', 'humasi', 'dokumentasi', etc
  createdAt: string;
  member?: Member; // populated dari join
}

// Event Material (materi/file event)
export interface EventMaterial {
  id: number;
  eventId: number;
  title: string;
  fileUrl: string;
  fileType?: string | null; // 'slide', 'notulensi', 'sertifikat', 'foto'
  uploadedBy?: number | null;
  createdAt: string;
  uploader?: Member; // populated dari join
}

// Extended Event dengan committee & materials untuk managed events
export interface ManagedEvent extends Event {
  committees?: EventCommittee[];
  materials?: EventMaterial[];
  isCommittee?: boolean; // apakah current user adalah committee
  committeeRole?: string; // role current user di event ini
}

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  imageUrl?: string;
  category?: 'public' | 'internal' | 'agenda';
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

/**
 * Kategori galeri (editable dari CMS).
 * Tabel: gallery_categories di DB.
 * Dipakai untuk dropdown & filter chip di GalleryManager.
 */
export interface GalleryCategory {
  id: number;
  name: string;
  slug: string;
  color: string;       // 'blue' | 'amber' | 'emerald' | 'pink' | 'purple' | 'slate' | ...
  sortOrder: number;
  isActive: boolean;
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
  instagramUrl: string | null;
  linkedinUrl: string | null;
  youtubeUrl: string | null;
  divisionPhotos: string | null;
  divisions: string | null;
  footerDescription: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  heroBannerUrl?: string | null;
}

export type ResourceVisibility = 'pengurus' | 'alumni' | 'both';

export interface Resource {
  id: number;
  title: string;
  description: string | null;
  fileUrl: string;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  category: string;
  subcategory: string | null;
  visibility: ResourceVisibility;
  sortOrder: number;
  downloadCount: number;
  uploadedBy?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Included in portal view
  isRead?: boolean;
  readAt?: string | null;
}

export interface OnboardingProgress {
  total: number;
  readCount: number;
  percentage: number;
}

export interface Partner {
  id: number;
  name: string;
  university?: string | null;
  logoUrl?: string | null;
  category: 'hima' | 'organisasi' | 'corporate' | 'media';
  websiteUrl?: string | null;
  contactPerson?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}



