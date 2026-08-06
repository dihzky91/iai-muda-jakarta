import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import PublicHeader from '@/src/components/PublicHeader';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

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
    const [settingsRows, genRows] = await Promise.all([
      db.select().from(schema.settings).where(eq(schema.settings.id, 1)).limit(1),
      db.select().from(schema.generations).where(eq(schema.generations.isActive, true)).limit(1),
    ]);
    const settings = settingsRows[0];
    const activeGen = genRows[0];
    const genLabel = activeGen ? `${activeGen.name.replace('Generasi ke-', 'Gen ')} (${activeGen.years})` : 'Gen 2 (2025-2026)';
    return {
      logoUrl: settings?.logoUrl || null,
      currentGenName: genLabel,
    };
  } catch {
    return {
      logoUrl: null,
      currentGenName: 'Gen 2 (2025-2026)',
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
    icons: faviconUrl ? { icon: faviconUrl } : { icon: '/favicon.ico' },
    alternates: { canonical: './' },
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

import CommandPalette from '@/src/components/CommandPalette';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerData = await getHeaderData();
  
  return (
    <html lang="id" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          <PublicHeader 
            logoUrl={headerData.logoUrl} 
            currentGenName={headerData.currentGenName} 
          />
          {children}
          <CommandPalette />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
