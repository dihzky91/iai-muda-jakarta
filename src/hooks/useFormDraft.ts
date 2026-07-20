'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseFormDraftOptions<T> {
  key: string;
  form: T;
  isOpen: boolean;
  isSubmitting: boolean;
  onRestore?: (draft: T) => void;
  enabled?: boolean;
}

export function useFormDraft<T extends Record<string, any>>({
  key,
  form,
  isOpen,
  isSubmitting,
  onRestore,
  enabled = true,
}: UseFormDraftOptions<T>) {
  const hasRestoredRef = useRef(false);
  const lastSavedRef = useRef<string | null>(null);

  const getDraft = useCallback((): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }, [key]);

  // Restore draft once when drawer opens
  useEffect(() => {
    if (!enabled || !isOpen || hasRestoredRef.current) return;
    const draft = getDraft();
    if (draft && onRestore) {
      onRestore(draft);
    }
    hasRestoredRef.current = true;
  }, [enabled, isOpen, getDraft, onRestore]);

  // Reset restore flag when drawer closes
  useEffect(() => {
    if (!isOpen) {
      hasRestoredRef.current = false;
    }
  }, [isOpen]);

  // Autosave form changes (debounced via interval-like check every 1s)
  useEffect(() => {
    if (!enabled || !isOpen || isSubmitting) return;
    const timer = setTimeout(() => {
      const serialized = JSON.stringify(form);
      if (serialized === lastSavedRef.current) return;
      localStorage.setItem(key, serialized);
      lastSavedRef.current = serialized;
    }, 800);
    return () => clearTimeout(timer);
  }, [enabled, isOpen, isSubmitting, form, key]);

  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
    lastSavedRef.current = null;
  }, [key]);

  const hasDraft = useCallback((): boolean => {
    return getDraft() !== null;
  }, [getDraft]);

  return { clearDraft, hasDraft, getDraft };
}
