'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Star,
  MessageSquare,
  RefreshCw,
  ExternalLink,
  Shield,
  BookOpen
} from 'lucide-react';

interface MemberDetail {
  id: number;
  name: string;
  email: string;
  division: string | null;
  university: string | null;
  phone: string | null;
  whatsapp: string | null;
  imageUrl: string | null;
  linkedinUrl: string | null;
  bio: string | null;
  generationName: string | null;
  positionName: string | null;
  isActive: boolean;
  isAlumni: boolean;
}

interface StatusRecord {
  id: number;
  status: string;
  reason: string | null;
  createdAt: string;
  changedByUsername: string | null;
}

interface AcademicLoad {
  id: number;
  weekStart: string;
  sks: number;
  notes: string | null;
  createdAt: string;
}

interface LeaveRequest {
  id: number;
  startDate: string;
  endDate: string;
  reason: string;
  leaveType: string;
  status: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  submittedAt: string;
}

interface InterventionLog {
  id: number;
  stage: string;
  notes: string | null;
  actionTaken: string | null;
  scheduledDate: string | null;
  completedDate: string | null;
  createdAt: string;
  performedBy: string | null;
}

interface Evaluation {
  id: number;
  month: string;
  evaluationNotes: string | null;
  actionItems: string | null;
  rating: number | null;
  evaluatedBy: string | null;
  createdAt: string;
}

interface MemberHRData {
  member: MemberDetail;
  statusHistory: StatusRecord[];
  academicLoads: AcademicLoad[];
  leaveRequests: LeaveRequest[];
  interventionLogs: InterventionLog[];
  evaluations: Evaluation[];
}

export default function MemberDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<MemberHRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status Modal State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('hijau');
  const [statusReason, setStatusReason] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const fetchMemberDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/hr/members/${id}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Gagal memuat data anggota');
      }
    } catch (err) {
      console.error('Failed to fetch member detail:', err);
      setError('Terjadi kesalahan koneksi saat mengambil data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/admin/login');
      return;
    }
    if (user) {
      fetchMemberDetail();
    }
  }, [user, authLoading, router, fetchMemberDetail]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSubmittingStatus(true);
    try {
      const res = await fetch(`/api/hr/members/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason: statusReason }),
      });
      const result = await res.json();
      if (result.success) {
        setShowStatusModal(false);
        setStatusReason('');
        fetchMemberDetail();
      } else {
        alert(result.error || 'Gagal memperbarui status');
      }
    } catch (err) {
      console.error('Status update failed:', err);
      alert('Terjadi kesalahan saat menyimpan status baru');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">Belum Ada Status</span>;
    const colors: Record<string, string> = {
      hijau: 'bg-green-100 text-green-800 border-green-300',
      kuning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      merah: 'bg-red-100 text-red-800 border-red-300',
      biru: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    const labels: Record<string, string> = {
      hijau: '🟢 HIJAU (Baik)',
      kuning: '🟡 KUNING (Perlu Perhatian)',
      merah: '🔴 MERAH (Kritis / Intervensi)',
      biru: '🔵 BIRU (Cuti)',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[status] || 'bg-slate-100 text-slate-700'}`}>
        {labels[status] || status.toUpperCase()}
      </span>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-600">Memuat detail anggota...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Data Tidak Ditemukan</h2>
          <p className="text-slate-600 text-sm mb-6">{error || 'Anggota tidak ditemukan.'}</p>
          <button
            onClick={() => router.push('/admin')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard HR
          </button>
        </div>
      </div>
    );
  }

  const { member, statusHistory, academicLoads, leaveRequests, interventionLogs, evaluations } = data;
  const currentStatus = statusHistory.length > 0 ? statusHistory[0] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Portal Admin
          </button>

          <button
            onClick={fetchMemberDetail}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-100 transition"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Member Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-blue-500 overflow-hidden flex items-center justify-center text-slate-400 shrink-0 shadow-inner">
                {member.imageUrl ? (
                  <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-400" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">{member.name}</h1>
                  {getStatusBadge(currentStatus?.status || null)}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                  {member.division && (
                    <span className="flex items-center gap-1 font-medium text-blue-700">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      {member.division}
                    </span>
                  )}
                  {member.positionName && (
                    <span className="flex items-center gap-1 text-slate-600">
                      <Shield className="w-4 h-4 text-slate-400" />
                      {member.positionName}
                    </span>
                  )}
                  {member.generationName && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {member.generationName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowStatusModal(true)}
                className="flex-1 md:flex-none px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Ubah Status HR
              </button>
            </div>
          </div>

          {/* Contact & Extra Details Grid */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> Email
              </div>
              <div className="font-medium text-slate-800 truncate">{member.email || '-'}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> No. Telepon / WA
              </div>
              <div className="font-medium text-slate-800">{member.whatsapp || member.phone || '-'}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> Universitas
              </div>
              <div className="font-medium text-slate-800">{member.university || '-'}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5" /> LinkedIn / Bio
              </div>
              <div className="font-medium text-slate-800">
                {member.linkedinUrl ? (
                  <a href={member.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                    Profil LinkedIn ↗
                  </a>
                ) : (
                  member.bio || '-'
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid: Status History & Academic Load */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status History */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Riwayat Status HR ({statusHistory.length})
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {statusHistory.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">Belum ada riwayat status tercatat.</p>
              ) : (
                statusHistory.map((item) => (
                  <div key={item.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      {getStatusBadge(item.status)}
                      <span className="text-xs text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {item.reason && <p className="text-xs text-slate-700 mt-1 font-normal bg-white p-2 rounded border border-slate-100">"{item.reason}"</p>}
                    {item.changedByUsername && (
                      <p className="text-[11px] text-slate-400">Diubah oleh: @{item.changedByUsername}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Academic Load */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Catatan Beban Studi ({academicLoads.length})
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {academicLoads.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">Belum ada catatan beban akademik.</p>
              ) : (
                academicLoads.map((load) => (
                  <div key={load.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-800">Minggu Ke-{load.weekStart}</span>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold">
                        {load.sks} SKS
                      </span>
                    </div>
                    {load.notes && <p className="text-xs text-slate-600 mt-1">{load.notes}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom Grid: Leave Requests, Interventions, Evaluations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Leave Requests */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-semibold text-base text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Pengajuan Cuti ({leaveRequests.length})
            </h2>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {leaveRequests.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Tidak ada riwayat cuti.</p>
              ) : (
                leaveRequests.map((leave) => (
                  <div key={leave.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between font-medium">
                      <span className="capitalize text-slate-800">{leave.leaveType || 'Cuti'}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                        leave.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {leave.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-slate-500">{leave.startDate} s/d {leave.endDate}</div>
                    <p className="text-slate-600 pt-1">{leave.reason}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Intervention Logs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-semibold text-base text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-orange-600" />
              Log Intervensi ({interventionLogs.length})
            </h2>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {interventionLogs.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Tidak ada catatan intervensi.</p>
              ) : (
                interventionLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="font-medium text-slate-800">Tahap: {log.stage.toUpperCase()}</div>
                    {log.notes && <p className="text-slate-600">{log.notes}</p>}
                    {log.actionTaken && <p className="text-emerald-700 font-medium">Tindakan: {log.actionTaken}</p>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Monthly Evaluations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-semibold text-base text-slate-900 mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Evaluasi Bulanan ({evaluations.length})
            </h2>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {evaluations.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Belum ada evaluasi bulanan.</p>
              ) : (
                evaluations.map((evalItem) => (
                  <div key={evalItem.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between font-medium">
                      <span>Bulan: {evalItem.month}</span>
                      {evalItem.rating && <span className="text-amber-600">⭐ {evalItem.rating}/5</span>}
                    </div>
                    {evalItem.evaluationNotes && <p className="text-slate-600">{evalItem.evaluationNotes}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-bold text-slate-900">Ubah Status HR Anggota</h3>
            <p className="text-xs text-slate-500">
              Pilih status HR terbaru untuk <strong>{member.name}</strong>. Perubahan status akan disimpan ke dalam riwayat log.
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status Baru</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="hijau">🟢 Hijau (Aktif / Baik)</option>
                  <option value="kuning">🟡 Kuning (Perlu Perhatian)</option>
                  <option value="merah">🔴 Merah (Kritis / Memerlukan Intervensi)</option>
                  <option value="biru">🔵 Biru (Cuti Resmi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Alasan / Catatan Status</label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Masukkan alasan atau konteks pembaruan status ini..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
                  disabled={submittingStatus}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingStatus}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                >
                  {submittingStatus ? 'Menyimpan...' : 'Simpan Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
