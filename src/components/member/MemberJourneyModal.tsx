'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  Sparkles,
  Calendar,
  Award,
  ChevronRight,
  ChevronLeft,
  X,
  Share2,
  Download,
  Building2,
  Briefcase,
  Users,
  CheckCircle2,
  HeartHandshake,
  Star,
} from 'lucide-react';

interface GenerationHistory {
  memberId: number;
  generationId: number;
  genName: string;
  years: string;
  cabinetName?: string | null;
  division: string;
  roleName: string;
  isActive: boolean;
}

interface CommitteeItem {
  id: number;
  eventId: number;
  eventTitle: string;
  role: string;
  division: string;
  eventDate: string;
}

interface MemberJourneyData {
  member: {
    id: number;
    name: string;
    email?: string | null;
    imageUrl?: string | null;
    university?: string | null;
    bio?: string | null;
  };
  stats: {
    totalPeriods: number;
    totalCommittees: number;
    totalEventsAttended: number;
    firstJoinedYear: string;
  };
  generations: GenerationHistory[];
  committees: CommitteeItem[];
  badges: string[];
  smartNarrative: string;
}

interface MemberJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId?: number;
}

export default function MemberJourneyModal({ isOpen, onClose, memberId }: MemberJourneyModalProps) {
  const [data, setData] = useState<MemberJourneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchJourney = async () => {
      setLoading(true);
      try {
        const url = memberId ? `/api/member/journey?memberId=${memberId}` : '/api/member/journey';
        const res = await fetch(url);
        const json = await res.json();
        if (res.ok && json.success) {
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load journey data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJourney();
    setCurrentSlide(0);
  }, [isOpen, memberId]);

  if (!isOpen) return null;

  const totalSlides = 4;

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  // Canvas Image Exporter for LinkedIn/Instagram Card
  const handleDownloadCard = () => {
    if (!data) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Gradient (Dark Navy Premium)
    const grad = ctx.createLinearGradient(0, 0, 1200, 630);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(0.5, '#1E293B');
    grad.addColorStop(1, '#090D16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 630);

    // Decorative Gold Border Lines
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 1140, 570);

    // Header Logo & Branding
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('IAI MUDA WILAYAH DKI JAKARTA', 70, 90);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 18px sans-serif';
    ctx.fillText('REKAM JEJAK PENGURUS & ALUMNI', 70, 120);

    // Member Name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'extrabold 48px sans-serif';
    ctx.fillText(data.member.name, 70, 200);

    // Primary Badge / Subtitle
    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 22px sans-serif';
    const firstGen = data.generations[0];
    const lastGen = data.generations[data.generations.length - 1];
    ctx.fillText(
      `${data.stats.totalPeriods} Periode Pengabdian • ${firstGen ? firstGen.genName : ''} ${
        lastGen && lastGen.genName !== firstGen?.genName ? `➔ ${lastGen.genName}` : ''
      }`,
      70,
      240
    );

    // Narrative Box Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(70, 270, 1060, 180, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.stroke();

    // Narrative Text (Word Wrapped)
    ctx.fillStyle = '#E2E8F0';
    ctx.font = 'italic 22px sans-serif';
    const words = data.smartNarrative.split(' ');
    let line = '';
    let y = 320;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > 1000 && n > 0) {
        ctx.fillText(line, 100, y);
        line = words[n] + ' ';
        y += 34;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 100, y);

    // Stats Highlights (Bottom Row)
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`${data.stats.totalPeriods}`, 100, 530);
    ctx.fillText(`${data.stats.totalCommittees}`, 350, 530);
    ctx.fillText(`${data.badges.length}`, 600, 530);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 16px sans-serif';
    ctx.fillText('PERIODE DIJALANI', 100, 560);
    ctx.fillText('PROKER & KEPANITIAAN', 350, 560);
    ctx.fillText('BADGES PENCAPAIAN', 600, 560);

    // Footer Watermark
    ctx.fillStyle = '#64748B';
    ctx.font = '14px sans-serif';
    ctx.fillText('Verified Portal Pengurus • iaimudajakarta.or.id', 850, 560);

    // Trigger Download
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `IAI_Muda_Journey_${data.member.name.replace(/\s+/g, '_')}.png`;
    link.href = image;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full text-white overflow-hidden shadow-2xl relative flex flex-col min-h-[540px]"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                IAI Muda Journey
              </span>
              <h3 className="text-sm font-bold text-white">Jejak Perjalananku</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 flex flex-col justify-center">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-400">Menyiapkan cerita perjalananmu...</p>
            </div>
          ) : !data ? (
            <div className="py-16 text-center text-slate-400 text-sm font-medium">
              Data perjalanan tidak ditemukan.
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* SLIDE 0: WELCOME & OVERVIEW */}
              {currentSlide === 0 && (
                <motion.div
                  key="slide-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 text-center py-4"
                >
                  <div className="relative inline-block">
                    {data.member.imageUrl ? (
                      <img
                        src={data.member.imageUrl}
                        alt={data.member.name}
                        className="w-24 h-24 rounded-full border-4 border-amber-400/60 object-cover mx-auto shadow-xl"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-3xl flex items-center justify-center mx-auto shadow-xl">
                        {data.member.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 p-2 bg-amber-500 rounded-full text-slate-950 shadow-md">
                      <Crown className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-black text-white">{data.member.name}</h2>
                    <p className="text-xs text-amber-400 font-semibold mt-1">
                      {data.stats.firstJoinedYear ? `Anggota Sejak ${data.stats.firstJoinedYear}` : 'Pengurus IAI Muda DKI'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 max-w-lg mx-auto">
                    <div>
                      <p className="text-2xl font-black text-amber-400">{data.stats.totalPeriods}</p>
                      <p className="text-[10px] text-slate-300 font-semibold">Periode Pengabdian</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-amber-400">{data.stats.totalCommittees}</p>
                      <p className="text-[10px] text-slate-300 font-semibold">Proker & Panitia</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-amber-400">{data.badges.length}</p>
                      <p className="text-[10px] text-slate-300 font-semibold">Badges Pencapaian</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 max-w-md mx-auto italic">
                    "Terima kasih atas dedikasi dan waktumu memajukan profesi akuntan muda di DKI Jakarta."
                  </p>
                </motion.div>
              )}

              {/* SLIDE 1: CAREER TRAJECTORY TIMELINE */}
              {currentSlide === 1 && (
                <motion.div
                  key="slide-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Briefcase className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-bold text-white">Trajektori Karir Organisasi</h3>
                  </div>

                  <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-500/40">
                    {data.generations.map((gen, idx) => (
                      <div key={gen.generationId} className="relative pl-10">
                        <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full bg-amber-400 border-4 border-slate-900 shadow-sm" />
                        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                              {gen.genName} ({gen.years})
                            </span>
                            {gen.isActive && (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                Periode Berjalan
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-extrabold text-white mt-2">{gen.roleName}</h4>
                          <p className="text-xs text-slate-300 font-medium">Divisi: {gen.division}</p>
                          {gen.cabinetName && (
                            <p className="text-[11px] text-slate-400 mt-1">Kabinet: {gen.cabinetName}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* SLIDE 2: COMMITTEE HIGHLIGHTS */}
              {currentSlide === 2 && (
                <motion.div
                  key="slide-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="w-5 h-5 text-amber-400" />
                      <h3 className="text-base font-bold text-white">Kepanitiaan & Proker Utama</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {data.committees.length} Program Kerja
                    </span>
                  </div>

                  {data.committees.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                      Belum ada data kepanitiaan terdaftar.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                      {data.committees.map((item) => (
                        <div
                          key={item.id}
                          className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 flex items-center justify-between gap-3"
                        >
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                              {item.role}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-white">{item.eventTitle}</h4>
                            <p className="text-[11px] text-slate-400">{item.division}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[11px] font-semibold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg">
                              {item.eventDate}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* SLIDE 3: NARRATIVE & LINKEDIN SHAREABLE CARD */}
              {currentSlide === 3 && (
                <motion.div
                  key="slide-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Award className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-bold text-white">Kartu Resume Perjalanan</h3>
                  </div>

                  {/* Visual Card Wrapper */}
                  <div
                    ref={cardRef}
                    className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-5 rounded-2xl border border-amber-500/30 space-y-4 shadow-inner"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">
                          IAI Muda Wilayah DKI Jakarta
                        </span>
                        <h3 className="text-lg font-black text-white mt-0.5">{data.member.name}</h3>
                      </div>
                      <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                        {data.badges.map((b) => (
                          <span
                            key={b}
                            className="text-[10px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 italic bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                      "{data.smartNarrative}"
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                      <span>{data.stats.totalPeriods} Periode • {data.stats.totalCommittees} Proker</span>
                      <span className="text-amber-400/80 font-semibold">Official Verified Profile</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleDownloadCard}
                      className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Unduh Kartu LinkedIn / IG (PNG)
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Footer Navigation */}
        {data && (
          <div className="px-6 py-4 border-t border-slate-800/80 flex items-center justify-between bg-slate-950/50">
            <button
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Kembali
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    currentSlide === i ? 'bg-amber-400 w-6' : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>

            {currentSlide < totalSlides - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                Lanjut <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Selesai <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
