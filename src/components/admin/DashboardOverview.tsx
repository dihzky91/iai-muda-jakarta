'use client';

import React, { useMemo } from 'react';
import {
  Calendar, Users, BookOpen, Image as ImageIcon, History, ShieldCheck, UserCheck,
  TrendingUp, ArrowUpRight,
} from 'lucide-react';
import { Generation, Member, Event, Article, GalleryItem, Pillar } from '@/src/types';

interface DashboardOverviewProps {
  events: Event[];
  members: Member[];
  articles: Article[];
  gallery: GalleryItem[];
  generations: Generation[];
  pillars: Pillar[];
  usersCount?: number;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  href?: string;
}

const StatCard = ({ icon: Icon, label, value, color, href }: StatCardProps) => {
  const content = (
    <div className={`rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all group ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between">
        <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center text-white shadow-sm`}>
          <Icon className="h-5 w-5" />
        </div>
        {href && (
          <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-extrabold text-slate-900 font-display">{value}</p>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded-2xl">
        {content}
      </a>
    );
  }

  return content;
};

function getMonthKey(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' });
}

function SimpleBarChart({ data, label }: { data: { label: string; value: number; color: string }[]; label: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const height = 160;
  const barWidth = 28;
  const gap = 16;
  const totalWidth = data.length * (barWidth + gap) + gap;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-bold text-slate-900">{label}</h3>
      </div>
      <div className="overflow-x-auto">
        <svg width={totalWidth} height={height + 32} className="mx-auto">
          {/* Y-axis grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <g key={i}>
              <line
                x1={gap}
                y1={height - ratio * height + 8}
                x2={totalWidth - gap}
                y2={height - ratio * height + 8}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
              />
              <text
                x={gap - 4}
                y={height - ratio * height + 12}
                textAnchor="end"
                className="text-[10px] fill-slate-400 font-medium"
              >
                {Math.round(max * ratio)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const barHeight = (d.value / max) * (height - 24);
            const x = gap + i * (barWidth + gap);
            const y = height - barHeight + 8;
            return (
              <g key={d.label}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={6}
                  className={d.color}
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-slate-600"
                >
                  {d.value}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={height + 24}
                  textAnchor="middle"
                  className="text-[10px] font-semibold fill-slate-500"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function DashboardOverview({
  events,
  members,
  articles,
  gallery,
  generations,
  pillars,
  usersCount = 0,
}: DashboardOverviewProps) {
  const stats = useMemo(() => [
    { icon: Calendar, label: 'Agenda Acara', value: events.length, color: 'bg-blue-600', href: '#events' },
    { icon: Users, label: 'Pengurus Aktif', value: members.length, color: 'bg-emerald-600', href: '#members' },
    { icon: BookOpen, label: 'Artikel & Berita', value: articles.length, color: 'bg-indigo-600', href: '#articles' },
    { icon: ImageIcon, label: 'Foto Galeri', value: gallery.length, color: 'bg-amber-600', href: '#gallery' },
    { icon: History, label: 'Generasi', value: generations.length, color: 'bg-cyan-600', href: '#generations' },
    { icon: ShieldCheck, label: 'Pilar Organisasi', value: pillars.length, color: 'bg-rose-600', href: '#pillars' },
    { icon: UserCheck, label: 'User Terdaftar', value: usersCount, color: 'bg-violet-600', href: '#users' },
  ], [events.length, members.length, articles.length, gallery.length, generations.length, pillars.length, usersCount]);

  const eventChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(e => {
      const key = getMonthKey(e.date);
      if (key) counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-6)
      .map(([label, value]) => ({ label, value, color: 'fill-blue-500' }));
  }, [events]);

  const articleChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach(a => {
      const key = getMonthKey(a.date);
      if (key) counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-6)
      .map(([label, value]) => ({ label, value, color: 'fill-indigo-500' }));
  }, [articles]);

  const activeGeneration = useMemo(() => generations.find(g => g.isActive), [generations]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-slate-200 pb-6 mb-8">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Ringkasan Dashboard</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Pantau ringkasan aktivitas portal, data kepengurusan, dan konten terbaru.
        </p>
      </div>

      {/* Quick alert for active generation */}
      <div className={`rounded-2xl border p-4 flex items-start gap-3 ${activeGeneration ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'}`}>
        <History className={`h-5 w-5 shrink-0 mt-0.5 ${activeGeneration ? 'text-blue-600' : 'text-amber-600'}`} />
        <div>
          <h4 className={`text-sm font-bold ${activeGeneration ? 'text-blue-900' : 'text-amber-900'}`}>
            {activeGeneration ? `Kepengurusan Aktif: ${activeGeneration.name}` : 'Generasi Belum Diaktifkan'}
          </h4>
          <p className={`text-xs mt-0.5 ${activeGeneration ? 'text-blue-700' : 'text-amber-700'}`}>
            {activeGeneration
              ? `Periode ${activeGeneration.years} sedang aktif. Total ${members.filter(m => m.generationId === activeGeneration.id).length} pengurus terdaftar di generasi ini.`
              : 'Tidak ada generasi yang ditandai sebagai aktif. Aktifkan generasi di menu Masa Transisi.'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Statistik Portal</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {stats.map(s => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {eventChartData.length > 0 ? (
          <SimpleBarChart data={eventChartData} label="Agenda Acara per Bulan" />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Agenda Acara per Bulan</h3>
            </div>
            <p className="text-xs text-slate-400 py-8 text-center">Belum ada data agenda untuk ditampilkan.</p>
          </div>
        )}

        {articleChartData.length > 0 ? (
          <SimpleBarChart data={articleChartData} label="Artikel per Bulan" />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Artikel per Bulan</h3>
            </div>
            <p className="text-xs text-slate-400 py-8 text-center">Belum ada data artikel untuk ditampilkan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
