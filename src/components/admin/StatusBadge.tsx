'use client';

import React from 'react';

interface StatusBadgeProps {
  status: string;
  options?: Record<string, { label: string; className: string }>;
}

const defaultEventStatuses: Record<string, { label: string; className: string }> = {
  ongoing: { label: 'Berlangsung', className: 'bg-emerald-50 text-emerald-700' },
  upcoming: { label: 'Akan Datang', className: 'bg-amber-50 text-amber-700' },
  completed: { label: 'Selesai', className: 'bg-slate-100 text-slate-600' },
};

export default function StatusBadge({ status, options = defaultEventStatuses }: StatusBadgeProps) {
  const config = options[status.toLowerCase()] || { label: status, className: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${config.className}`}>
      {config.label}
    </span>
  );
}
