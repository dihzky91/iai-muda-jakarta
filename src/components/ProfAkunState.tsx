'use client';

import React from 'react';

export type ProfAkunPose =
  | 'waving'
  | 'pointing'
  | 'thinking'
  | 'reading'
  | 'laptop'
  | 'megaphone'
  | 'tablet'
  | 'guiding'
  | 'default';

interface ProfAkunStateProps {
  pose?: ProfAkunPose;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  imageSize?: number;
}

const POSE_IMAGES: Record<ProfAkunPose, string> = {
  waving: '/images/prof-akun-waving.png',
  pointing: '/images/prof-akun-pointing.png',
  thinking: '/images/prof-akun-thinking.png',
  reading: '/images/prof-akun-reading.png',
  laptop: '/images/prof-akun-laptop.png',
  megaphone: '/images/prof-akun-megaphone.png',
  tablet: '/images/prof-akun-tablet.png',
  guiding: '/images/prof-akun-guiding.png',
  default: '/images/prof-akun-waving.png',
};

export default function ProfAkunState({
  pose = 'thinking',
  title,
  description,
  action,
  className = '',
  imageSize = 160,
}: ProfAkunStateProps) {
  const imgSrc = POSE_IMAGES[pose] || POSE_IMAGES.default;

  return (
    <div className={`flex flex-col items-center justify-center text-center p-6 ${className}`}>
      <div className="relative mb-4 transition-transform duration-300 hover:scale-105 select-none">
        {/* Ground shadow for free standing 3D character */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-slate-900/15 rounded-full blur-[3px]" />
        <img
          src={imgSrc}
          alt={`Prof Akun (${pose})`}
          style={{ width: imageSize, height: imageSize }}
          className="relative z-10 object-contain filter drop-shadow-md"
        />
      </div>
      {title && <h3 className="text-lg font-bold text-[#0D1B3D] mb-1">{title}</h3>}
      {description && <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
