'use client';

import React, { useState, useEffect } from 'react';
import { Shield, BookOpen, Calendar, AlertCircle } from 'lucide-react';

interface HRStatus {
  currentStatus: {
    status: string;
    reason: string | null;
    createdAt: Date;
  } | null;
}

export function HRStatusCard() {
  const [data, setData] = useState<HRStatus | null>(null);

  useEffect(() => {
    fetch('/api/member/hr/status')
      .then(res => res.json())
      .then(result => {
        if (result.success) setData(result.data);
      })
      .catch(console.error);
  }, []);

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-slate-100 text-slate-700 border-slate-200';
    const colors: Record<string, string> = {
      hijau: 'bg-green-100 text-green-800 border-green-300',
      kuning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      merah: 'bg-red-100 text-red-800 border-red-300',
      biru: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      hijau: '🟢 HIJAU (Baik)',
      kuning: '🟡 KUNING (Perhatian)',
      merah: '🔴 MERAH (Kritis)',
      biru: '🔵 BIRU (Cuti)',
    };
    return labels[status] || status.toUpperCase();
  };

  const status = data?.currentStatus;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2.5 mb-3">
          <Shield className="w-5 h-5 text-blue-600 shrink-0" />
          <h3 className="font-semibold text-base text-slate-900">Status HR Anda</h3>
        </div>
        {status ? (
          <div className="space-y-2">
            <div className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(status.status)}`}>
              {getStatusLabel(status.status)}
            </div>
            {status.reason && (
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">{status.reason}</p>
            )}
          </div>
        ) : (
          <div className="py-2">
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200">
              🟢 HIJAU (Aktif & Baik)
            </span>
            <p className="text-xs text-slate-500 mt-2">Tidak ada catatan kendala dari HR.</p>
          </div>
        )}
      </div>
      {status && (
        <p className="text-[11px] text-slate-400 mt-3">
          Terakhir diperbarui: {new Date(status.createdAt).toLocaleDateString('id-ID')}
        </p>
      )}
    </div>
  );
}

export function AcademicLoadCard() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    loadType: 'uts',
    intensity: 'medium',
    description: '',
  });

  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    return monday.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/member/hr/academic-load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, weekStart: getWeekStart() }),
      });
      const result = await res.json();
      if (result.success) {
        alert('Beban studi berhasil diperbarui!');
        setShowForm(false);
        setFormData({ loadType: 'uts', intensity: 'medium', description: '' });
      } else {
        alert(result.error || 'Gagal memperbarui beban studi');
      }
    } catch (error) {
      alert('Terjadi kesalahan saat memperbarui beban studi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2.5 mb-3">
          <BookOpen className="w-5 h-5 text-purple-600 shrink-0" />
          <h3 className="font-semibold text-base text-slate-900">Beban Studi Akademik</h3>
        </div>

        {!showForm ? (
          <div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Input kesibukan perkuliahan minggu ini agar pengurus dapat menyesuaikan beban kerja organisasi.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Jenis Kesibukan</label>
              <select
                value={formData.loadType}
                onChange={(e) => setFormData({ ...formData, loadType: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="uts">UTS (Ujian Tengah Semester)</option>
                <option value="uas">UAS (Ujian Akhir Semester)</option>
                <option value="quiz">Kuis / Tugas Rutin</option>
                <option value="project">Proyek / Tugas Besar</option>
                <option value="sick">Izin Sakit</option>
                <option value="personal">Urusan Pribadi</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Intensitas</label>
              <select
                value={formData.intensity}
                onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="low">Rendah (Santai)</option>
                <option value="medium">Sedang (Cukup Padat)</option>
                <option value="high">Tinggi (Sangat Padat)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Keterangan (Opsional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-purple-500"
                rows={2}
                placeholder="Catatan tambahan..."
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition"
              >
                {loading ? 'Menyimpan...' : 'Kirim'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full mt-3 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs font-semibold transition"
        >
          Update Beban Studi
        </button>
      )}
    </div>
  );
}

export function LeaveRequestCard() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    leaveType: 'regular',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/member/hr/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        alert('Pengajuan cuti berhasil dikirim! Menunggu persetujuan HR.');
        setShowForm(false);
        setFormData({ startDate: '', endDate: '', reason: '', leaveType: 'regular' });
      } else {
        alert(result.error || 'Gagal mengajukan cuti');
      }
    } catch (error) {
      alert('Terjadi kesalahan saat mengajukan cuti');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2.5 mb-3">
          <Calendar className="w-5 h-5 text-orange-600 shrink-0" />
          <h3 className="font-semibold text-base text-slate-900">Pengajuan Cuti</h3>
        </div>

        {!showForm ? (
          <div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Ajukan cuti resmi organisasi dengan alur persetujuan HR yang terstruktur.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tanggal Selesai</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Alasan Cuti</label>
              <textarea
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-orange-500"
                rows={2}
                placeholder="Alasan mengajukan cuti..."
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Kategori Cuti</label>
              <select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="regular">Reguler (Minimal H-10)</option>
                <option value="emergency">Mendesak / Darurat</option>
              </select>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-[11px] text-orange-800 leading-tight">
              <AlertCircle className="w-3.5 h-3.5 inline mr-1 text-orange-600" />
              Maks. 7 hari per 2 bulan. Cuti reguler diajukan min. H-10.
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition"
              >
                {loading ? 'Mengirim...' : 'Kirim'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full mt-3 px-3 py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-800 text-xs font-semibold transition"
        >
          Ajukan Cuti
        </button>
      )}
    </div>
  );
}

export function HRCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
      <HRStatusCard />
      <AcademicLoadCard />
      <LeaveRequestCard />
    </div>
  );
}

export default HRCards;
