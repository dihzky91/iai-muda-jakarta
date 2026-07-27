/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Award, Shield, Landmark } from 'lucide-react';
import type { Pillar } from '@/src/types';

interface PillarsSectionProps {
  pillars: Pillar[];
}

/**
 * Server Component: Menampilkan pilar utama IAI Muda DKI Jakarta.
 * Sepenuhnya statis, tidak memerlukan JavaScript di sisi klien.
 */
export default function PillarsSection({ pillars }: PillarsSectionProps) {
  return (
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
  );
}
