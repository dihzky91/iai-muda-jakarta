import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

async function getFaviconUrl(): Promise<string | null> {
  try {
    const { db, schema } = await import('@/lib/db');
    const { eq } = await import('drizzle-orm');
    const rows = await db.select().from(schema.settings).where(eq(schema.settings.id, 1)).limit(1);
    return rows[0]?.faviconUrl || null;
  } catch {
    return null;
  }
}

const SITE_URL = 'https://imud.iaijakarta.or.id';

export async function generateMetadata(): Promise<Metadata> {
  const faviconUrl = await getFaviconUrl();

  return {
    metadataBase: new URL(SITE_URL),
    title: 'IAI Muda Wilayah DKI Jakarta',
    description: 'Website resmi IAI Muda Wilayah DKI Jakarta — Badan kelengkapan Ikatan Akuntan Indonesia yang menaungi mahasiswa akuntansi dan akuntan muda.',
    keywords: 'IAI Muda, Ikatan Akuntan Indonesia, DKI Jakarta, akuntan muda, akuntansi, webinar, sertifikasi CA',
    icons: faviconUrl ? { icon: faviconUrl } : undefined,
    /**
     * Canonical menunjuk ke '/' — satu-satunya URL halaman publik yang benar
     * ada. Sebelumnya HomeClient menimpa tag ini di sisi klien dengan
     * /struktur, /acara, /kalender, /galeri, /artikel; kelimanya 404, jadi
     * mesin pencari diarahkan ke alamat mati.
     */
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      title: 'IAI Muda Wilayah DKI Jakarta',
      description: 'Badan kelengkapan Ikatan Akuntan Indonesia (IAI) Wilayah DKI Jakarta yang menaungi mahasiswa akuntansi dan akuntan muda.',
      images: ['/og-image.png'],
      url: SITE_URL,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'IAI Muda Wilayah DKI Jakarta',
      description: 'Membangun akuntan masa depan yang berdaya saing global.',
      images: ['/og-image.png'],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // <link rel="canonical"> tidak lagi ditulis manual di sini — Next.js yang
  // memancarkannya dari `alternates.canonical` di atas, sehingga sudah ada
  // di HTML awal dan tidak bergantung pada JavaScript.
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
