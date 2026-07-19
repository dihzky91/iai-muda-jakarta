'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import AdminCMS from '@/src/components/AdminCMS';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [data, setData] = useState({
    generations: [] as any[],
    members: [] as any[],
    events: [] as any[],
    articles: [] as any[],
    gallery: [] as any[],
    pillars: [] as any[],
    settings: null as any,
  });

  const fetchAll = async () => {
    const fetches = await Promise.all([
      fetch('/api/generations').then(r => r.json()),
      fetch('/api/members').then(r => r.json()),
      fetch('/api/events').then(r => r.json()),
      fetch('/api/articles').then(r => r.json()),
      fetch('/api/galleries').then(r => r.json()),
      fetch('/api/pillars').then(r => r.json()),
      fetch('/api/settings').then(r => r.json()),
    ]);
    setData({
      generations: fetches[0].data || [],
      members: fetches[1].data || [],
      events: fetches[2].data || [],
      articles: fetches[3].data || [],
      gallery: fetches[4].data || [],
      pillars: fetches[5].data || [],
      settings: fetches[6].data || null,
    });
  };

  useEffect(() => { if (user) fetchAll(); }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <AdminCMS
      generations={data.generations}
      setGenerations={(val: any) => setData(prev => ({ ...prev, generations: typeof val === 'function' ? val(prev.generations) : val }))}
      members={data.members}
      setMembers={(val: any) => setData(prev => ({ ...prev, members: typeof val === 'function' ? val(prev.members) : val }))}
      events={data.events}
      setEvents={(val: any) => setData(prev => ({ ...prev, events: typeof val === 'function' ? val(prev.events) : val }))}
      articles={data.articles}
      setArticles={(val: any) => setData(prev => ({ ...prev, articles: typeof val === 'function' ? val(prev.articles) : val }))}
      gallery={data.gallery}
      setGallery={(val: any) => setData(prev => ({ ...prev, gallery: typeof val === 'function' ? val(prev.gallery) : val }))}
      pillars={data.pillars}
      setPillars={(val: any) => setData(prev => ({ ...prev, pillars: typeof val === 'function' ? val(prev.pillars) : val }))}
      settings={data.settings}
      onSettingsUpdate={(updated: any) => setData(prev => ({ ...prev, settings: updated }))}
    />
  );
}
