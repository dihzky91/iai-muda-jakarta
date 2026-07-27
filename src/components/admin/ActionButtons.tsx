'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Trash2, MoreVertical } from 'lucide-react';

interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  editTitle?: string;
  deleteTitle?: string;
}

export default function ActionButtons({
  onEdit,
  onDelete,
  editTitle = 'Ubah',
  deleteTitle = 'Hapus',
}: ActionButtonsProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Aksi lainnya"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-xl border border-slate-100 shadow-xl shadow-slate-900/10 z-50 py-1 animate-scale-up origin-top-right"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5 text-blue-600" />
            {editTitle}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {deleteTitle}
          </button>
        </div>
      )}
    </div>
  );
}
