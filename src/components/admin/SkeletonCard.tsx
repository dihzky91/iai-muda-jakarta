'use client';

import React from 'react';

interface SkeletonCardProps {
  count?: number;
}

export default function SkeletonCard({ count = 6 }: SkeletonCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3 animate-pulse"
        >
          <div className="flex items-start gap-3">
            <div className="h-16 w-16 rounded-xl bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3.5 w-3/4 rounded bg-slate-200" />
              <div className="h-2.5 w-1/2 rounded bg-slate-200" />
              <div className="h-2 w-2/3 rounded bg-slate-200" />
            </div>
          </div>
          <div className="h-8 w-full rounded-lg bg-slate-200" />
        </div>
      ))}
    </div>
  );
}
