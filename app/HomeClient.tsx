'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Award, Shield, Calendar, Landmark, Mail, Phone, MapPin,
  Linkedin, Instagram, Youtube, ArrowRight, MessageSquare, Send, CheckCircle2
} from 'lucide-react';
import Header from '@/src/components/Header';
import Hero from '@/src/components/Hero';
import OrganizationalStructure from '@/src/components/OrganizationalStructure';
import EventsList from '@/src/components/EventsList';
import ArticlesSection from '@/src/components/ArticlesSection';
import GallerySection from '@/src/components/GallerySection';
import { SkeletonBanner, SkeletonCardGrid, SkeletonPillars, SkeletonStructure } from '@/src/components/SkeletonLoader';
import type { Generation, Member, Event, Article, GalleryItem, Settings, Pillar } from '@/src/types';

interface HomeClientProps {
  settings: Settings | null;
  pillars: Pillar[];
  events: Event[];
  members: Member[];
  generations: Generation[];
  articles: Article[];
  galleries: GalleryItem[];
}

export default function HomeClient({ settings: serverSettings, pillars: serverPillars, events: serverEvents, members: serverMembers, generations: serverGenerations, articles: serverArticles, galleries: serverGalleries }: HomeClientProps) {
  const [currentTab, setCurrentTab] = useState<string>('beranda');

  const defaultSettings: Settings = { id: 1, contactTitle: 'Hubungi IAI Wilayah DKI Jakarta', contactDescription: 'Kami siap mendengar aspirasi dan pertanyaan Anda seputar program IAI Muda DKI Jakarta.', address: 'Grha Akuntan, Jl. Sindanglaya No. 7, Menteng, Jakarta Pusat 10310', email: 'imud@iaijakarta.or.id', phone: null, showPhone: false, instagramUrl: null, linkedinUrl: null, youtubeUrl: null, divisionPhotos: null, divisions: null, footerDescription: null };

  const [generations, setGenerations] = useState<Generation[]>(serverGenerations);
  const [members, setMembers] = useState<Member[]>(serverMembers);
  const [events, setEvents] = useState<Event[]>(serverEvents);
  const [articles, setArticles] = useState<Article[]>(serverArticles);
  const [gallery, setGallery] = useState<GalleryItem[]>(serverGalleries);
  const [pillars, setPillars] = useState<Pillar[]>(serverPillars);
  const [settings, setSettings] = useState<Settings>(serverSettings || defaultSettings);

  useEffect(() => { setGenerations(serverGenerations); }, [serverGenerations]);
  useEffect(() => { setMembers(serverMembers); }, [serverMembers]);
  useEffect(() => { setEvents(serverEvents); }, [serverEvents]);
  useEffect(() => { setArticles(serverArticles); }, [serverArticles]);
  useEffect(() => { setGallery(serverGalleries); }, [serverGalleries]);
  useEffect(() => { setPillars(serverPillars); }, [serverPillars]);
  useEffect(() => { if (serverSettings) setSettings(serverSettings); }, [serverSettings]);

  const activeGen = useMemo(() => generations.find((g) => g.isActive) ?? generations[0], [generations]);
  const activeGenMembers = useMemo(() => members.filter((m) => m.generationId === activeGen?.id), [members, activeGen]);
  const featuredEvent = useMemo(() => events.find((e) => e.status === 'ongoing') ?? events.find((e) => e.status === 'upcoming'), [events]);
  const hasDbError = false;
  const isLoading = false;

  useEffect(() => {
    const titles: Record<string, string> = {
      beranda: 'IAI Muda Wilayah DKI Jakarta',
      struktur: 'Kepengurusan — IAI Muda DKI Jakarta',
      acara: 'Agenda & Webinar — IAI Muda DKI Jakarta',
      galeri: 'Galeri Kegiatan — IAI Muda DKI Jakarta',
      artikel: 'Artikel & Opini — IAI Muda DKI Jakarta',
    };
    document.title = titles[currentTab] || 'IAI Muda Wilayah DKI Jakarta';

    const descriptions: Record<string, string> = {
      beranda: 'Website resmi IAI Muda Wilayah DKI Jakarta — Badan kelengkapan Ikatan Akuntan Indonesia yang menaungi mahasiswa akuntansi dan akuntan muda.',
      struktur: 'Lihat susunan kepengurusan IAI Muda Wilayah DKI Jakarta.',
      acara: 'Jadwal agenda, webinar, dan acara terbaru IAI Muda DKI Jakarta.',
      galeri: 'Dokumentasi galeri kegiatan IAI Muda Wilayah DKI Jakarta.',
      artikel: 'Artikel dan opini akuntansi terkini dari IAI Muda DKI Jakarta.',
    };
    const desc = descriptions[currentTab] || descriptions.beranda;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', desc);

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', document.title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', desc);

    const defaultOgImage = 'https://imud.iaijakarta.or.id/og-image.png';
    const images: Record<string, string> = {
      beranda: defaultOgImage,
      struktur: 'https://imud.iaijakarta.or.id/images/seo-struktur.png',
      acara: 'https://imud.iaijakarta.or.id/images/seo-acara.png',
      galeri: 'https://imud.iaijakarta.or.id/images/seo-galeri.png',
      artikel: 'https://imud.iaijakarta.or.id/images/seo-artikel.png',
    };
    const currentImage = images[currentTab] || defaultOgImage;

    let ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', currentImage);

    let twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) twitterImage.setAttribute('content', currentImage);

    const baseUrl = 'https://imud.iaijakarta.or.id';
    const paths: Record<string, string> = {
      beranda: '',
      struktur: '/struktur',
      acara: '/acara',
      galeri: '/galeri',
      artikel: '/artikel',
    };
    const currentPath = paths[currentTab] !== undefined ? paths[currentTab] : `/${currentTab}`;
    const canonicalLink = document.getElementById('canonical-link') || document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `${baseUrl}${currentPath}`);
    } else {
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('id', 'canonical-link');
      link.setAttribute('href', `${baseUrl}${currentPath}`);
      document.head.appendChild(link);
    }
  }, [currentTab]);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;

    setContactLoading(true);
    setContactError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage,
        }),
      });
      const result = await res.json();

      if (result.success) {
        setContactSent(true);
        setContactName('');
        setContactEmail('');
        setContactMessage('');
        setTimeout(() => setContactSent(false), 5000);
      } else {
        setContactError(result.message || 'Gagal mengirim pesan. Coba lagi.');
      }
    } catch {
      setContactError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between" id="app-root-layout">

      {hasDbError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs font-semibold text-amber-800">
          ⚠️ Tidak dapat memuat data terbaru. Menampilkan data cadangan — silakan muat ulang halaman jika masalah berlanjut.
        </div>
      )}

      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentGenName={activeGen?.name || 'Generasi ke-2'}
        logoUrl={settings.logoUrl}
      />

      <main className="flex-grow pb-16">

        <>
          {currentTab === 'beranda' && (
            isLoading ? (
              <div className="space-y-16 py-12" id="beranda-loading-skeleton">
                <SkeletonBanner />
                <SkeletonPillars />
                <SkeletonCardGrid count={3} />
              </div>
            ) : (
              <div className="space-y-24" id="beranda-subview">

                <Hero
                  memberCount={activeGenMembers.length}
                  activeGenYears={activeGen?.years || '2025-2026'}
                  onExploreStructure={() => setCurrentTab('struktur')}
                  onExploreEvents={() => setCurrentTab('acara')}
                />

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
                    {pillars.length > 0 ? pillars.map((pillar, i) => {
                      const iconColors = [
                        { bg: 'bg-emerald-50', text: 'text-emerald-600' },
                        { bg: 'bg-blue-50', text: 'text-blue-600' },
                        { bg: 'bg-indigo-50', text: 'text-indigo-600' },
                      ];
                      const color = iconColors[i % iconColors.length];
                      const IconMap: Record<string, React.ReactNode> = {
                        Shield: <Shield className="h-6 w-6" />,
                        Landmark: <Landmark className="h-6 w-6" />,
                        Award: <Award className="h-6 w-6" />,
                      };
                      return (
                        <div key={pillar.id} className="p-8 rounded-3xl bg-white border border-slate-100 space-y-4 shadow-sm hover:shadow-md transition-all">
                          <div className={`p-3 ${color.bg} ${color.text} rounded-xl w-fit`}>
                            {IconMap[pillar.iconName] || <Shield className="h-6 w-6" />}
                          </div>
                          <h3 className="font-display font-bold text-lg text-slate-900">{pillar.title}</h3>
                          <p className="text-slate-500 text-sm leading-relaxed">{pillar.description}</p>
                        </div>
                      );
                    }) : (
                      <>
                        <div className="p-8 rounded-3xl bg-white border border-slate-100 space-y-4 shadow-sm hover:shadow-md transition-all">
                          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
                            <Shield className="h-6 w-6" />
                          </div>
                          <h3 className="font-display font-bold text-lg text-slate-900">Integritas Standar Tinggi</h3>
                          <p className="text-slate-500 text-sm leading-relaxed">Menjaga integritas profesional dan etika luhur sesuai dengan kode etik IAI sejak dini sebagai fondasi utama berkarir.</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-white border border-slate-100 space-y-4 shadow-sm hover:shadow-md transition-all">
                          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit">
                            <Landmark className="h-6 w-6" />
                          </div>
                          <h3 className="font-display font-bold text-lg text-slate-900">Literasi Finansial & Teknologi</h3>
                          <p className="text-slate-500 text-sm leading-relaxed">Mendorong penguasaan alat analisis data cerdas dan teknologi audit terkini guna mendukung digitalisasi keuangan.</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-white border border-slate-100 space-y-4 shadow-sm hover:shadow-md transition-all">
                          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit">
                            <Award className="h-6 w-6" />
                          </div>
                          <h3 className="font-display font-bold text-lg text-slate-900">Sinergi & Jaringan Karir</h3>
                          <p className="text-slate-500 text-sm leading-relaxed">Membangun jembatan networking antara universitas, akuntan korporasi, KAP Big 4, dan regulator keuangan.</p>
                        </div>
                      </>
                    )}
                  </div>
                </section>

                {featuredEvent && (
                  <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="featured-webinar-spotlight">
                    <div className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-8 md:p-12 relative overflow-hidden shadow-lg shadow-indigo-500/10">
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

                <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-slate-200 pt-20" id="homepage-contact">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    <div className="lg:col-span-5 space-y-6">
                      <h2 className="font-display text-3xl font-extrabold text-slate-900">{settings.contactTitle}</h2>
                      <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                        {settings.contactDescription}
                      </p>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Alamat Grha Akuntan</h4>
                            <p className="text-sm text-slate-600">{settings.address}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email Resmi</h4>
                            <p className="text-sm text-slate-600 font-medium">{settings.email}</p>
                          </div>
                        </div>

                        {settings.showPhone && settings.phone && (
                          <div className="flex items-start gap-3 animate-fade-in">
                            <Phone className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                            <div>
                              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Hotline Hubungan Publik</h4>
                              <p className="text-sm text-slate-600 font-medium">{settings.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-7 bg-white border border-slate-100 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
                      <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        <span>Kirim Pesan Langsung ke Hub Kami</span>
                      </h3>

                      {contactSent ? (
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
                        <form onSubmit={handleContactSubmit} className="space-y-4" id="direct-message-form">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700">Nama</label>
                              <input
                                type="text"
                                required
                                placeholder="Nama Anda..."
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700">Email</label>
                              <input
                                type="email"
                                required
                                placeholder="anda@email.com..."
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
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
                              value={contactMessage}
                              onChange={(e) => setContactMessage(e.target.value)}
                              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                            />
                          </div>

                          {contactError && (
                            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                              ⚠️ {contactError}
                            </p>
                          )}

                          <button
                            type="submit"
                            disabled={contactLoading}
                            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 text-xs shadow-md shadow-blue-500/10 hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {contactLoading ? (
                              <>
                                <div className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                Mengirim...
                              </>
                            ) : (
                              <>
                                <Send className="h-3.5 w-3.5" />
                                Kirim Pesan Ke Humas
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </div>

                  </div>
                </section>

              </div>
            )
          )}

          {currentTab === 'struktur' && (
            isLoading ? (
              <SkeletonStructure />
            ) : (
              <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <OrganizationalStructure
                  generations={generations}
                  members={members}
                  settings={settings}
                />
              </div>
            )
          )}

          {currentTab === 'acara' && (
            isLoading ? (
              <SkeletonCardGrid count={6} />
            ) : (
              <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <EventsList events={events} />
              </div>
            )
          )}

          {currentTab === 'galeri' && (
            isLoading ? (
              <SkeletonCardGrid count={6} />
            ) : (
              <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <GallerySection galleryItems={gallery} />
              </div>
            )
          )}

          {currentTab === 'artikel' && (
            isLoading ? (
              <SkeletonCardGrid count={6} />
            ) : (
              <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <ArticlesSection articles={articles} />
              </div>
            )
          )}
        </>

      </main>

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
              {settings.footerDescription || 'IAI Muda Wilayah DKI Jakarta merupakan badan kelengkapan Ikatan Akuntan Indonesia (IAI) Wilayah DKI Jakarta yang menjadi wadah pengembangan kompetensi, kolaborasi, dan jejaring profesional bagi generasi akuntan muda.'}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tautan Cepat</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => { setCurrentTab('beranda'); }} className="hover:text-blue-600 transition-colors font-medium">Beranda Utama</button>
              </li>
              <li>
                <button onClick={() => { setCurrentTab('struktur'); }} className="hover:text-blue-600 transition-colors font-medium">Kepengurusan</button>
              </li>
              <li>
                <button onClick={() => { setCurrentTab('acara'); }} className="hover:text-blue-600 transition-colors font-medium">Agenda Webinar</button>
              </li>
              <li>
                <button onClick={() => { setCurrentTab('galeri'); }} className="hover:text-blue-600 transition-colors font-medium">Galeri Kegiatan</button>
              </li>
              <li>
                <button onClick={() => { setCurrentTab('artikel'); }} className="hover:text-blue-600 transition-colors font-medium">Artikel & Opini</button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ikuti Kami (Sosial Media)</h4>
            <div className="flex items-center gap-3">
              <a href={settings.instagramUrl || 'https://instagram.com'} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-pink-600 rounded-xl transition-all shadow-sm" title="Instagram">
                <Instagram className="h-4.5 w-4.5" />
              </a>
              <a href={settings.linkedinUrl || 'https://linkedin.com'} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-xl transition-all shadow-sm" title="LinkedIn">
                <Linkedin className="h-4.5 w-4.5" />
              </a>
              <a href={settings.youtubeUrl || 'https://youtube.com'} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-red-600 rounded-xl transition-all shadow-sm" title="YouTube">
                <Youtube className="h-4.5 w-4.5" />
              </a>
            </div>
            <p className="text-[10px] text-slate-400 pt-2 font-mono">
              © {new Date().getFullYear()} IAI Muda DKI Jakarta. <br />All rights reserved.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
