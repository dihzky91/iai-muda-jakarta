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
import FeaturedEventSpotlight from '@/src/components/home/FeaturedEventSpotlight';
import ArticlesSection from '@/src/components/ArticlesSection';
import GallerySection from '@/src/components/GallerySection';
import { CalendarGrid, type CalendarEvent } from '@/src/components/calendar';
import EventRegistrationModal from '@/src/components/EventRegistrationModal';
import { DEFAULT_SETTINGS } from '@/src/constants/defaults';
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

/**
 * Judul tab browser per bagian. Hanya judul — bukan metadata SEO.
 *
 * Blok ini dulunya juga menimpa meta description, og:title, og:description,
 * og:image, twitter:image, dan rel=canonical dari sisi klien. Semuanya
 * dihapus karena dua alasan:
 *
 * 1. Crawler mengambil metadata dari HTML awal dan tidak menjalankan
 *    JavaScript untuk itu, jadi tag yang diubah setelah hidrasi tidak pernah
 *    terbaca. Sumber kebenarannya sekarang `generateMetadata()` di layout.
 * 2. Canonical-nya justru merugikan: ia menunjuk ke /struktur, /acara,
 *    /kalender, /galeri, dan /artikel — kelimanya 404. Halaman ini
 *    memberitahu mesin pencari bahwa alamat resminya adalah URL yang tidak
 *    ada.
 *
 * Judul dokumen tetap diperbarui: itu terlihat pengguna di tab browser dan
 * di riwayat, dan tidak menyesatkan siapa pun.
 */
const TAB_TITLES: Record<string, string> = {
  beranda: 'IAI Muda Wilayah DKI Jakarta',
  struktur: 'Kepengurusan — IAI Muda DKI Jakarta',
  acara: 'Agenda & Webinar — IAI Muda DKI Jakarta',
  kalender: 'Kalender Acara — IAI Muda DKI Jakarta',
  galeri: 'Galeri Kegiatan — IAI Muda DKI Jakarta',
  artikel: 'Artikel & Opini — IAI Muda DKI Jakarta',
};

function useDocumentTitle(currentTab: string) {
  useEffect(() => {
    document.title = TAB_TITLES[currentTab] || TAB_TITLES.beranda;
  }, [currentTab]);
}

/**
 * Data dari server dipakai LANGSUNG sebagai props.
 *
 * Sebelumnya ketujuhnya disalin ke useState lalu disinkronkan balik lewat
 * tujuh useEffect yang isinya cuma `setState(prop)`. Karena tidak ada satu pun
 * yang dimutasi di sisi klien, itu hanya menghasilkan render kedua setiap kali
 * props berubah — tanpa manfaat apa pun.
 */
export default function HomeClient({
  settings: serverSettings,
  pillars,
  events,
  members,
  generations,
  articles,
  galleries: gallery,
}: HomeClientProps) {
  const [currentTab, setCurrentTab] = useState<string>('beranda');
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [registeringEvent, setRegisteringEvent] = useState<Event | null>(null);

  // Fallback dipakai hanya kalau tabel settings kosong. Memakai konstanta
  // bersama, bukan objek literal yang dibangun ulang setiap render — dan yang
  // isinya sempat berbeda dari DEFAULT_SETTINGS yang dipakai /api/settings.
  const settings = serverSettings ?? DEFAULT_SETTINGS;

  const activeGen = useMemo(() => generations.find((g) => g.isActive) ?? generations[0], [generations]);
  const activeGenMembers = useMemo(() => members.filter((m) => m.generationId === activeGen?.id), [members, activeGen]);
  const featuredEvent = useMemo(() => events.find((e) => e.status === 'ongoing') ?? events.find((e) => e.status === 'upcoming'), [events]);

  useDocumentTitle(currentTab);


  // Fetch calendar events when tab switches to kalender
  useEffect(() => {
    if (currentTab === 'kalender' && calendarEvents.length === 0) {
      setCalendarLoading(true);
      fetch('/api/calendar/events?scope=public')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setCalendarEvents(data.data);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch calendar events:', err);
        })
        .finally(() => {
          setCalendarLoading(false);
        });
    }
  }, [currentTab, calendarEvents.length]);

  const handleCalendarEventClick = (e: CalendarEvent) => {
    // Find matching event from events array
    const matchingEvent = events.find((evt) => evt.id === e.id);
    if (matchingEvent) {
      setRegisteringEvent(matchingEvent);
    }
  };

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

      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentGenName={activeGen?.name || 'Generasi ke-2'}
        logoUrl={settings.logoUrl}
      />

      <main className="flex-grow pb-16">

        <>
          {currentTab === 'beranda' && (
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
                <FeaturedEventSpotlight
                  event={featuredEvent}
                  onViewAll={() => setCurrentTab('acara')}
                />
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
          )}

          {currentTab === 'struktur' && (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <OrganizationalStructure
                generations={generations}
                members={members}
                settings={settings}
              />
            </div>
          )}

          {currentTab === 'acara' && (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <EventsList events={events} />
            </div>
          )}

          {currentTab === 'kalender' && (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
              {/* Header Section */}
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
                  Kalender Acara IAI Muda
                </h2>
                <p className="text-slate-600 text-sm sm:text-base">
                  Lihat agenda acara dalam tampilan kalender bulanan. Klik pada event untuk melihat detail dan melakukan pendaftaran.
                </p>
              </div>

              {/* Calendar Stats */}
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-700">
                    {calendarEvents.length} Total Acara
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-700">
                    {calendarEvents.filter((e) => e.status === 'upcoming').length} Akan Datang
                  </span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
                <CalendarGrid
                  events={calendarEvents}
                  variant="public"
                  loading={calendarLoading}
                  onEventClick={handleCalendarEventClick}
                />
              </div>

              {/* Quick Link */}
              <div className="text-center">
                <button
                  onClick={() => setCurrentTab('acara')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <ArrowRight className="h-4 w-4" />
                  Lihat Tampilan Daftar Lengkap
                </button>
              </div>
            </div>
          )}

          {currentTab === 'galeri' && (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <GallerySection galleryItems={gallery} />
            </div>
          )}

          {currentTab === 'artikel' && (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <ArticlesSection articles={articles} />
            </div>
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
                <button onClick={() => { setCurrentTab('kalender'); }} className="hover:text-blue-600 transition-colors font-medium">Kalender Acara</button>
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

      {/* Event Registration Modal */}
      {registeringEvent && (
        <EventRegistrationModal
          event={registeringEvent}
          onClose={() => setRegisteringEvent(null)}
        />
      )}

    </div>
  );
}

