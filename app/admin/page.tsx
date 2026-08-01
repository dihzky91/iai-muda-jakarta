'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import AdminCMS from '@/src/components/AdminCMS';
import { DEFAULT_SETTINGS } from '@/src/constants/defaults';
import type { Generation, Member, Event, Article, GalleryItem, Pillar, Settings, Partner } from '@/src/types';

/** Seluruh data CMS yang dipegang halaman ini. */
interface AdminData {
  generations: Generation[];
  members: Member[];
  events: Event[];
  articles: Article[];
  gallery: GalleryItem[];
  pillars: Pillar[];
  partners: Partner[];
  settings: Settings | null;
}

const EMPTY_DATA: AdminData = {
  generations: [],
  members: [],
  events: [],
  articles: [],
  gallery: [],
  pillars: [],
  partners: [],
  settings: null,
};

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AdminData>(EMPTY_DATA);

  /**
   * Bikin setter bergaya React.Dispatch untuk satu key di `data`.
   *
   * Sebelumnya tiap prop punya lambda `(val: any) => ...` yang identik —
   * tujuh salinan, tujuh `any`. Di sini tipenya terikat ke AdminData[K],
   * jadi salah pasang prop ketahuan saat kompilasi.
   */
  const makeSetter = useCallback(
    <K extends keyof AdminData>(key: K): React.Dispatch<React.SetStateAction<AdminData[K]>> =>
      (val) =>
        setData(prev => ({
          ...prev,
          [key]: typeof val === 'function'
            ? (val as (p: AdminData[K]) => AdminData[K])(prev[key])
            : val,
        })),
    []
  );

  const fetchAll = useCallback(async () => {
    const [generations, members, events, articles, galleries, pillars, partners, settings] =
      await Promise.all([
        fetch('/api/generations').then(r => r.json()),
        fetch('/api/members').then(r => r.json()),
        fetch('/api/events').then(r => r.json()),
        fetch('/api/articles').then(r => r.json()),
        fetch('/api/galleries').then(r => r.json()),
        fetch('/api/pillars').then(r => r.json()),
        fetch('/api/admin/partners').then(r => r.json()),
        fetch('/api/settings').then(r => r.json()),
      ]);

    setData({
      generations: generations.data || [],
      members: members.data || [],
      events: events.data || [],
      articles: articles.data || [],
      gallery: galleries.data || [],
      pillars: pillars.data || [],
      partners: partners.data || [],
      settings: settings.data || null,
    });
  }, []);

  useEffect(() => { if (user) fetchAll(); }, [user, fetchAll]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/admin/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <AdminCMS
      generations={data.generations}
      setGenerations={makeSetter('generations')}
      members={data.members}
      setMembers={makeSetter('members')}
      events={data.events}
      setEvents={makeSetter('events')}
      articles={data.articles}
      setArticles={makeSetter('articles')}
      gallery={data.gallery}
      setGallery={makeSetter('gallery')}
      pillars={data.pillars}
      setPillars={makeSetter('pillars')}
      partners={data.partners}
      setPartners={makeSetter('partners')}
      settings={data.settings ?? DEFAULT_SETTINGS}
      onSettingsUpdate={(updated: Settings) => setData(prev => ({ ...prev, settings: updated }))}
    />
  );
}

