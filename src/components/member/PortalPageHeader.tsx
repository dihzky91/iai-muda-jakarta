'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, type LucideIcon } from 'lucide-react';

interface PortalPageHeaderProps {
  badgeIcon?: LucideIcon;
  badgeLabel: string;
  badgeColor?: string;
  title: string;
  description: string;
  backHref?: string;
  backTitle?: string;
  rightContent?: React.ReactNode;
  children?: React.ReactNode;
}

export default function PortalPageHeader({
  badgeIcon: BadgeIcon,
  badgeLabel,
  badgeColor = 'text-cyan-300',
  title,
  description,
  backHref,
  backTitle = 'Kembali',
  rightContent,
  children,
}: PortalPageHeaderProps) {
  const [heroBannerUrl, setHeroBannerUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data?.heroBannerUrl) {
          setHeroBannerUrl(result.data.heroBannerUrl);
        } else {
          setHeroBannerUrl('/images/hero-card-asset.png');
        }
      })
      .catch(() => setHeroBannerUrl('/images/hero-card-asset.png'));
  }, []);

  const activeBanner = heroBannerUrl || '/images/hero-card-asset.png';
  const isCustomImage = activeBanner && activeBanner !== 'gradient';

  return (
    <section
      className="relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-9 text-white shadow-2xl shadow-blue-600/20 border border-blue-300/40 backdrop-blur-[20px] group transition-all"
      style={{
        background: 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 40%, #2563EB 70%, #4F46E5 100%)',
      }}
    >
      {/* Dynamic Background Image Overlay (Wayang / Batik artwork or CMS Banner) */}
      {isCustomImage && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={activeBanner}
            alt="Hero Banner Artwork"
            className="w-full h-full object-cover object-right opacity-30 mix-blend-overlay transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/70 to-indigo-900/40" />
        </div>
      )}

      {/* Decorative Ambient Light Glow Spots */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-900/30 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-200/10 rounded-full blur-2xl pointer-events-none z-0" />

      {/* Subtle Background Geometric Mesh Overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            {backHref && (
              <Link
                href={backHref}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition cursor-pointer shadow-sm"
                title={backTitle}
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-md shadow-sm">
              {BadgeIcon && <BadgeIcon className={`w-3.5 h-3.5 ${badgeColor}`} />}
              <span>{badgeLabel}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
            {title}
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
            {description}
          </p>

          {children}
        </div>

        {rightContent && <div className="shrink-0">{rightContent}</div>}
      </div>
    </section>
  );
}
