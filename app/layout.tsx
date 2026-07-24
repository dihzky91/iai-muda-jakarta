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

export async function generateMetadata(): Promise<Metadata> {
  const faviconUrl = await getFaviconUrl();

  return {
    title: 'IAI Muda Wilayah DKI Jakarta',
    description: 'Website resmi IAI Muda Wilayah DKI Jakarta — Badan kelengkapan Ikatan Akuntan Indonesia yang menaungi mahasiswa akuntansi dan akuntan muda.',
    keywords: 'IAI Muda, Ikatan Akuntan Indonesia, DKI Jakarta, akuntan muda, akuntansi, webinar, sertifikasi CA',
    icons: faviconUrl ? { icon: faviconUrl } : undefined,
    openGraph: {
      type: 'website',
      title: 'IAI Muda Wilayah DKI Jakarta',
      description: 'Badan kelengkapan Ikatan Akuntan Indonesia (IAI) Wilayah DKI Jakarta yang menaungi mahasiswa akuntansi dan akuntan muda.',
      images: ['https://imud.iaijakarta.or.id/og-image.png'],
      url: 'https://imud.iaijakarta.or.id',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'IAI Muda Wilayah DKI Jakarta',
      description: 'Membangun akuntan masa depan yang berdaya saing global.',
      images: ['https://imud.iaijakarta.or.id/og-image.png'],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="canonical" id="canonical-link" href="https://imud.iaijakarta.or.id" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
