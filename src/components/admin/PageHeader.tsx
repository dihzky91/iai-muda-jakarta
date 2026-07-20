'use client';

import React from 'react';
import { ShieldCheck, ChevronRight, Plus } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface QuickAction {
  label: string;
  onClick: () => void;
  icon?: React.ElementType;
}

interface PageHeaderProps {
  title: string;
  description: string;
  breadcrumbs?: BreadcrumbItem[];
  quickAction?: QuickAction;
  role?: string;
  username?: string;
}

const roleLabelMap: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
};

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  quickAction,
  role,
  username,
}: PageHeaderProps) {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const displayRole = role ? roleLabelMap[role.toLowerCase()] || role : 'Admin';

  return (
    <div className="space-y-4 border-b border-slate-200 pb-6 mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
          {breadcrumbs.map((item, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {item.href && !isLast ? (
                  <a href={item.href} className="hover:text-blue-600 transition-colors">
                    {item.label}
                  </a>
                ) : (
                  <span className={isLast ? 'text-slate-800' : ''}>{item.label}</span>
                )}
                {!isLast && <ChevronRight className="h-3 w-3 text-slate-300" />}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">{today}</p>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">{title}</h2>
          <p className="text-slate-500 text-xs sm:text-sm">{description}</p>
        </div>

        <div className="flex items-center gap-3">
          {quickAction && (
            <button
              onClick={quickAction.onClick}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            >
              {quickAction.icon ? <quickAction.icon className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{quickAction.label}</span>
            </button>
          )}

          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider block">Sesi Admin</span>
              <span className="text-xs font-bold text-slate-700">
                {username ? `${displayRole} · ${username}` : displayRole}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
