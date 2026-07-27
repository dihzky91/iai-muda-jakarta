import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import PublicHeader from '@/src/components/PublicHeader';

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

async function getHeaderData(): Promise<{ logoUrl: string | null; currentGenName: string }> {
  try {
    const { db, schema } = await import('@/lib/db');
    const { eq } = await import('drizzle-orm');
    const rows = await db.select().from(schema.settings).where(eq(schema.settings.id, 1)).limit(1);
    const settings = rows[0];
    return {
      logoUrl: settings?.logoUrl || null,
      currentGenName: 'Gen 2 (2024-2026)',
    };
  } catch {
    return {
      logoUrl: null,
      currentGenName: 'Gen 2',
    };
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerData = await getHeaderData();
  
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <Providers>
          <PublicHeader 
            logoUrl={headerData.logoUrl} 
            currentGenName={headerData.currentGenName} 
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
