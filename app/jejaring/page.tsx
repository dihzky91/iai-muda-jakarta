import { db, schema } from '@/lib/db';
import { eq, asc } from 'drizzle-orm';
import { Handshake, Building2, Globe, ExternalLink, GraduationCap, Users } from 'lucide-react';
import type { Partner } from '@/src/types';

export const revalidate = 300; // ISR 5 mins

export default async function JejaringPage() {
  let partners: Partner[] = [];
  try {
    const data = await db
      .select()
      .from(schema.partners)
      .where(eq(schema.partners.isActive, true))
      .orderBy(asc(schema.partners.sortOrder));
    partners = data as Partner[];
  } catch (err) {
    console.error('Failed to fetch partners:', err);
  }

  const himaPartners = partners.filter(p => p.category === 'hima');
  const otherPartners = partners.filter(p => p.category !== 'hima');

  return (
    <div className="min-h-screen bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3.5 py-1.5 text-xs font-semibold text-blue-600">
            <Handshake className="h-4 w-4" />
            <span>Kolaborasi & Sinergi Akademis</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Jejaring HIMA & Mitra Strategis
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            IAI Muda Wilayah DKI Jakarta menjalin kemitraan erat dengan Himpunan Mahasiswa Akuntansi (HIMA) di berbagai perguruan tinggi terkemuka untuk membangun kompetensi dan jejaring generasi akuntan masa depan.
          </p>
        </div>

        {/* Section HIMA Partners */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Himpunan Mahasiswa Akuntansi (HIMA) Mitra
            </h2>
            <span className="ml-auto text-xs font-semibold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
              {himaPartners.length} HIMA Terdaftar
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {himaPartners.length === 0 ? (
              <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
                Belum ada data HIMA terdaftar.
              </div>
            ) : (
              himaPartners.map(partner => (
                <div
                  key={partner.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {partner.logoUrl ? (
                          <img src={partner.logoUrl} alt={partner.name} className="h-full w-full object-cover" />
                        ) : (
                          <Building2 className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                          {partner.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {partner.university || 'Perguruan Tinggi'}
                        </p>
                      </div>
                    </div>

                    {partner.contactPerson && (
                      <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        CP: <span className="font-medium text-slate-700">{partner.contactPerson}</span>
                      </p>
                    )}
                  </div>

                  {partner.websiteUrl && (
                    <div className="pt-4 mt-4 border-t border-slate-100">
                      <a
                        href={partner.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Kunjungi Kemitraan Kampus
                        <ExternalLink className="h-3 w-3 ml-0.5" />
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section Other Strategic Partners */}
        {otherPartners.length > 0 && (
          <div className="space-y-6 pt-6">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Users className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Mitra Strategis & Korporasi
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherPartners.map(partner => (
                <div
                  key={partner.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                      {partner.logoUrl ? (
                        <img src={partner.logoUrl} alt={partner.name} className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{partner.name}</h3>
                      <span className="text-[10px] uppercase font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {partner.category}
                      </span>
                    </div>
                  </div>
                  {partner.websiteUrl && (
                    <a
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
