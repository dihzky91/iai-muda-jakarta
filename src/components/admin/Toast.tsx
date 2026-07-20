'use client';

import React from 'react';
import { Check, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { ToastMessage } from '@/src/hooks/useToast';

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
  duration?: number;
}

const toastStyles = {
  success: 'bg-emerald-600 border-emerald-500/20',
  error: 'bg-red-600 border-red-500/20',
  warning: 'bg-amber-600 border-amber-500/20',
  info: 'bg-blue-600 border-blue-500/20',
};

const iconMap = {
  success: Check,
  error: X,
  warning: AlertTriangle,
  info: Info,
};

function ProgressBar({ duration }: { duration: number }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-2xl overflow-hidden">
      <div
        className="h-full bg-white/70 origin-left"
        style={{
          animation: `shrink ${duration}ms linear forwards`,
        }}
      />
    </div>
  );
}

export default function Toast({ toasts, onRemove, duration = 4000 }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map(toast => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={`relative flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold text-white shadow-2xl border animate-slide-in-right overflow-hidden ${toastStyles[toast.type]}`}
            role="status"
            aria-live="polite"
          >
            <Icon className="h-5 w-5 bg-white/20 p-0.5 rounded-full flex-shrink-0" aria-hidden="true" />
            <span className="max-w-xs">{toast.message}</span>
            <button
              onClick={() => onRemove(toast.id)}
              className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="Tutup notifikasi"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            <ProgressBar duration={duration} />
          </div>
        );
      })}
    </div>
  );
}
