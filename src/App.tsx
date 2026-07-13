/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import OrganizationalStructure from './components/OrganizationalStructure';
import EventsList from './components/EventsList';
import ArticlesSection from './components/ArticlesSection';
import AdminCMS from './components/AdminCMS';
import GallerySection from './components/GallerySection';

import { 
  initialGenerations, 
  initialMembers, 
  initialEvents, 
  initialArticles,
  initialGallery
} from './data';

import { Generation, Member, Event, Article, GalleryItem } from './types';
import { useGenerations, useEvents, useMembers } from './hooks/useApi';
import { 
  Award, Shield, Calendar, Landmark, Mail, Phone, MapPin, 
  Linkedin, Instagram, Youtube, ArrowRight, MessageSquare, BookOpen, Send, CheckCircle2
} from 'lucide-react';

export default function App() {
  // Navigation tabs: 'beranda' | 'struktur' | 'acara' | 'artikel' | 'admin'
  const [currentTab, setCurrentTab] = useState<string>('beranda');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  // Fetch data from API database
  const { generations: dbGenerations, loading: genLoading, error: genError } = useGenerations();
  const { events: dbEvents, loading: eventsLoading, error: eventsError } = useEvents();
  const { members: dbMembers, loading: membersLoading, error: membersError } = useMembers();

  // Single source of truth: API database.
  // State is populated from API responses; fallback to static data only while loading.
  const [generations, setGenerations] = useState<Generation[]>(initialGenerations);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery);

  // Replace local state with DB data once loaded
  useEffect(() => {
    if (!genLoading && !genError && dbGenerations && dbGenerations.length > 0) {
      setGenerations(dbGenerations);
    }
  }, [dbGenerations, genLoading, genError]);

  useEffect(() => {
    if (!membersLoading && !membersError && dbMembers && dbMembers.length > 0) {
      setMembers(dbMembers);
    }
  }, [dbMembers, membersLoading, membersError]);

  useEffect(() => {
    if (!eventsLoading && !eventsError && dbEvents && dbEvents.length > 0) {
      setEvents(dbEvents);
    }
  }, [dbEvents, eventsLoading, eventsError]);

  // Derived properties: Active Generation info
  const activeGen = useMemo(() => {
    return generations.find(g => g.isActive) || generations[0];
  }, [generations]);

  // Filter members of active generation
  const activeGenMembers = useMemo(() => {
    return members.filter(m => m.generationId === activeGen?.id);
  }, [members, activeGen]);

  // Filter active events for Beranda
  const activeEventsCount = useMemo(() => {
    return events.filter(e => e.status === 'ongoing' || e.status === 'upcoming').length;
  }, [events]);

  // Upcoming featured event for homepage spotlight
  const featuredEvent = useMemo(() => {
    return events.find(e => e.status === 'ongoing') || events.find(e => e.status === 'upcoming');
  }, [events]);

  // Simulated email contact list subscription
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setNewsletterSubscribed(false);
      setNewsletterEmail('');
    }, 4000);
  };

  if (isAdminMode && currentTab === 'admin') {
    return (
      <AdminCMS 
        generations={generations}
        setGenerations={setGenerations}
        members={members}
        setMembers={setMembers}
        events={events}
        setEvents={setEvents}
        articles={articles}
        setArticles={setArticles}
        gallery={gallery}
        setGallery={setGallery}
        setIsAdminMode={setIsAdminMode}
        setCurrentTab={setCurrentTab}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between" id="app-root-layout">
      
      {/* DB connection error banner */}
      {(genError || eventsError || membersError) && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs font-semibold text-amber-800">
          ⚠️ Gagal terhubung ke database — menampilkan data bawaan.{' '}
          {genError || eventsError || membersError}
        </div>
      )}

      {/* Dynamic Header Component */}
      <Header 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        isAdminMode={isAdminMode} 
        setIsAdminMode={setIsAdminMode}
        currentGenName={activeGen?.name || 'Generasi ke-2'}
      />

      {/* Main Content Body */}
      <main className="flex-grow pb-16">
        
        {/* --- PUBLIC END-USER VIEWS --- */}
        <>
            {currentTab === 'beranda' && (
              <div className="space-y-24" id="beranda-subview">
                
                {/* 1. Hero Spotlight */}
                <Hero 
                  memberCount={activeGenMembers.length}
                  activeGenYears={activeGen?.years || '2025-2026'}
                  onExploreStructure={() => setCurrentTab('struktur')}
                  onExploreEvents={() => setCurrentTab('acara')}
                />

                {/* 2. Core Pillars of Organization */}
                <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="core-pillars">
                  <div className="text-center max-w-3xl mx-auto space-y-4">
                    <h2 className="font-display text-3xl font-extrabold text-slate-900">
                      Pilar Utama IAI Muda DKI Jakarta
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base">
                      Menyelaraskan nilai luhur profesi akuntansi dengan kelincahan inovasi digital kaum muda.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    {/* Pillar 1 */}
                    <div className="p-8 rounded-3xl bg-white border border-slate-100 space-y-4 shadow-sm hover:shadow-md transition-all">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
                        <Shield className="h-6 w-6" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-slate-900">Integritas Standar Tinggi</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        Menjaga integritas profesional dan etika luhur sesuai dengan kode etik Ikatan Akuntan Indonesia (IAI) sejak dini sebagai fondasi utama berkarir.
                      </p>
                    </div>

                    {/* Pillar 2 */}
                    <div className="p-8 rounded-3xl bg-white border border-slate-100 space-y-4 shadow-sm hover:shadow-md transition-all">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit">
                        <Landmark className="h-6 w-6" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-slate-900">Literasi Finansial & Teknologi</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        Mendorong penguasaan alat analisis data cerdas (data analytics), kecerdasan buatan, dan teknologi audit terkini guna mendukung digitalisasi keuangan.
                      </p>
                    </div>

                    {/* Pillar 3 */}
                    <div className="p-8 rounded-3xl bg-white border border-slate-100 space-y-4 shadow-sm hover:shadow-md transition-all">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit">
                        <Award className="h-6 w-6" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-slate-900">Sinergi & Jaringan Karir</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        Membangun jembatan networking kokoh antara universitas, akuntan korporasi, KAP Big 4, regulator keuangan, dan komunitas global.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 3. Event Spotlight / Countdown Banner */}
                {featuredEvent && (
                  <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="featured-webinar-spotlight">
                    <div className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-8 md:p-12 relative overflow-hidden shadow-lg shadow-indigo-500/10">
                      {/* Subtle decor glow */}
                      <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                      
                      <div className="md:grid md:grid-cols-12 md:gap-8 items-center relative z-10 space-y-6 md:space-y-0">
                        <div className="md:col-span-7 space-y-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-40 animate-ping" />
                            SOROTAN ACARA TERBARU
                          </span>
                          <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                            {featuredEvent.title}
                          </h3>
                          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                            {featuredEvent.description}
                          </p>
                          <div className="flex flex-wrap gap-4 text-xs font-mono text-indigo-200 pt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-white" />
                              {featuredEvent.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-emerald-300" />
                              {featuredEvent.location}
                            </span>
                          </div>
                        </div>

                        <div className="md:col-span-5 flex justify-start md:justify-end">
                          <button
                            id="homepage-spotlight-register"
                            onClick={() => setCurrentTab('acara')}
                            className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-blue-700 shadow-md hover:bg-slate-50 transition-all cursor-pointer"
                          >
                            Daftar Sekarang Secara Gratis
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* 4. Contact & Interactive Location Section */}
                <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-slate-200 pt-20" id="homepage-contact">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* Left info */}
                    <div className="lg:col-span-5 space-y-6">
                      <h2 className="font-display text-3xl font-extrabold text-slate-900">Hubungi IAI Wilayah DKI Jakarta</h2>
                      <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                        Punya pertanyaan mengenai sertifikasi CA, kemitraan webinar, atau ingin bergabung dengan kepengurusan generasi berikutnya? Kami siap menyambut Anda.
                      </p>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Alamat Grha Akuntan</h4>
                            <p className="text-sm text-slate-600">Jl. Sindanglaya No. 1, Menteng, Jakarta Pusat, DKI Jakarta 10310</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email Resmi</h4>
                            <p className="text-sm text-slate-600 font-medium">iaimuda.dki@iai.or.id / dki@iaiglobal.or.id</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Phone className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Hotline Hubungan Publik</h4>
                            <p className="text-sm text-slate-600 font-medium">(021) 3190-4232 ext. 202</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right form / Simulated interactive map or direct message */}
                    <div className="lg:col-span-7 bg-white border border-slate-100 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
                      <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        <span>Kirim Pesan Langsung ke Hub Kami</span>
                      </h3>

                      {newsletterSubscribed ? (
                        <div className="py-12 text-center space-y-4 animate-scale-up" id="contact-success-notification">
                          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                          <div>
                            <h4 className="text-base font-bold text-slate-900">Pesan Anda Terkirim!</h4>
                            <p className="text-xs text-slate-500">
                              Staf Humas IAI Muda DKI Jakarta akan menghubungi Anda dalam waktu 1x24 jam kerja.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleNewsletterSubmit} className="space-y-4" id="direct-message-form">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700">Nama</label>
                              <input 
                                type="text" 
                                required
                                placeholder="Nama Anda..." 
                                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700">Email</label>
                              <input 
                                type="email" 
                                required
                                placeholder="anda@email.com..." 
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Isi Pesan / Pertanyaan</label>
                            <textarea 
                              rows={3} 
                              required
                              placeholder="Bagaimana cara saya bergabung dengan kepengurusan?..." 
                              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 text-xs shadow-md shadow-blue-500/10 hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Send className="h-3.5 w-3.5" />
                            Kirim Pesan Ke Humas
                          </button>
                        </form>
                      )}
                    </div>

                  </div>
                </section>

              </div>
            )}

            {currentTab === 'struktur' && (
              <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <OrganizationalStructure 
                  generations={generations} 
                  members={members} 
                />
              </div>
            )}

            {currentTab === 'acara' && (
              <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <EventsList 
                  events={events} 
                />
              </div>
            )}

            {currentTab === 'galeri' && (
              <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <GallerySection 
                  galleryItems={gallery} 
                />
              </div>
            )}

            {currentTab === 'artikel' && (
              <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <ArticlesSection 
                  articles={articles} 
                />
              </div>
            )}
          </>

      </main>

      {/* --- PREMIUM BRAND FOOTER --- */}
      <footer className="border-t border-slate-200 bg-white text-slate-600 py-12" id="application-footer">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-md shadow-blue-500/10">
                <Landmark className="h-4.5 w-4.5" />
              </div>
              <span className="font-display font-bold text-slate-900 text-base">
                IAI Muda Wilayah DKI Jakarta
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Badan kelengkapan Ikatan Akuntan Indonesia (IAI) Wilayah DKI Jakarta yang menaungi mahasiswa akuntansi dan akuntan muda di bawah usia 30 tahun guna membangun akuntan masa depan yang berdaya saing global.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tautan Cepat</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => { setCurrentTab('beranda'); setIsAdminMode(false); }} className="hover:text-blue-600 transition-colors font-medium">Beranda Utama</button>
              </li>
              <li>
                <button onClick={() => { setCurrentTab('struktur'); setIsAdminMode(false); }} className="hover:text-blue-600 transition-colors font-medium">Struktur Komite</button>
              </li>
              <li>
                <button onClick={() => { setCurrentTab('acara'); setIsAdminMode(false); }} className="hover:text-blue-600 transition-colors font-medium">Agenda Webinar</button>
              </li>
              <li>
                <button onClick={() => { setCurrentTab('galeri'); setIsAdminMode(false); }} className="hover:text-blue-600 transition-colors font-medium">Galeri Kegiatan</button>
              </li>
              <li>
                <button onClick={() => { setCurrentTab('artikel'); setIsAdminMode(false); }} className="hover:text-blue-600 transition-colors font-medium">Artikel & Opini</button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ikuti Kami (Sosial Media)</h4>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-xl transition-all shadow-sm" title="Instagram">
                <Instagram className="h-4.5 w-4.5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-xl transition-all shadow-sm" title="LinkedIn">
                <Linkedin className="h-4.5 w-4.5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-xl transition-all shadow-sm" title="YouTube">
                <Youtube className="h-4.5 w-4.5" />
              </a>
            </div>
            <p className="text-[10px] text-slate-400 pt-2 font-mono">
              © 2026 IAI Muda DKI Jakarta. <br />All rights reserved.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
