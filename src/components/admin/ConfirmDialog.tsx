'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ConfirmState } from '@/src/hooks/useConfirm';

interface ConfirmDialogProps {
  state: ConfirmState;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantStyles = {
  danger: 'bg-red-600 hover:bg-red-500 shadow-red-500/20',
  warning: 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20',
  primary: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20',
};

const iconStyles = {
  danger: 'bg-red-100 text-red-600',
  warning: 'bg-amber-100 text-amber-600',
  primary: 'bg-blue-100 text-blue-600',
};

export default function ConfirmDialog({ state, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!state.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 animate-scale-up">
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${iconStyles[state.variant || 'primary']}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-base font-bold text-slate-900">{state.title}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{state.message}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
            aria-label="Tutup dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {state.preview && (
          <div className="mt-5">
            {state.preview}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 px-5 py-2.5 text-xs font-bold transition-all"
          >
            {state.cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-xl text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all ${variantStyles[state.variant || 'primary']}`}
          >
            {state.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
