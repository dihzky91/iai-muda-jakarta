'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="py-14 text-center space-y-4 animate-fade-in">
      <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-slate-50 border border-slate-100 text-slate-300 shadow-sm">
        <Icon className="h-10 w-10" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-700">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">{description}</p>
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
