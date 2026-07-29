export interface CategoryOption {
  id: string;
  hashtag: string;
  label: string;
  description: string;
  badgeClass: string;
  activeTabClass: string;
}

/**
 * Daftar kategori/hashtag resmi komunitas.
 * Anda dapat dengan mudah mengubah, menambah, atau menghapus daftar ini kapan saja.
 */
export const COMMUNITY_CATEGORIES: CategoryOption[] = [
  {
    id: 'umum',
    hashtag: '#DiskusiUmum',
    label: 'Diskusi Umum',
    description: 'Bincang santai, kabar harian, dan obrolan umum pengurus',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
    activeTabClass: 'bg-slate-800 text-white shadow-sm',
  },
  {
    id: 'pengumuman',
    hashtag: '#Pengumuman',
    label: 'Pengumuman',
    description: 'Informasi resmi & pengumuman penting organisasi',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    activeTabClass: 'bg-blue-600 text-white shadow-sm',
  },
  {
    id: 'event_sharing',
    hashtag: '#EventSharing',
    label: 'Acara & Sharing',
    description: 'Dokumentasi kegiatan, info workshop, dan insight acara IAI Muda',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    activeTabClass: 'bg-purple-600 text-white shadow-sm',
  },
];

export function getCategoryById(id: string | null | undefined): CategoryOption {
  if (!id) return COMMUNITY_CATEGORIES[0];
  const found = COMMUNITY_CATEGORIES.find((c) => c.id === id);
  if (found) return found;

  // Formatting otomatis jika ada custom category / tag baru di masa depan
  const formattedHashtag = id.startsWith('#')
    ? id
    : `#${id.charAt(0).toUpperCase() + id.slice(1).replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())}`;

  return {
    id,
    hashtag: formattedHashtag,
    label: id,
    description: '',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    activeTabClass: 'bg-indigo-600 text-white shadow-sm',
  };
}
