'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface ListContainerProps {
  title: string;
  subtitle: string;
  onAdd: () => void;
  addLabel: string;
  children: React.ReactNode;
  filter?: React.ReactNode;
  toolbar?: React.ReactNode;
}

export default function ListContainer({ title, subtitle, onAdd, addLabel, children, filter, toolbar }: ListContainerProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{subtitle}</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
        >
          <Plus className="h-4 w-4" />
          <span>{addLabel}</span>
        </button>
      </div>

      {filter && <div>{filter}</div>}
      {toolbar && <div className="-mt-2">{toolbar}</div>}

      <div className="overflow-y-auto max-h-[600px] pr-2 space-y-4">
        {children}
      </div>
    </div>
  );
}
