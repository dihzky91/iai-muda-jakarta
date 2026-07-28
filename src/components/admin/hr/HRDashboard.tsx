'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Users, TrendingUp } from 'lucide-react';

interface DashboardData {
  statusCounts: {
    hijau: number;
    kuning: number;
    merah: number;
    biru: number;
  };
  needsAttention: Array<{
    memberId: number;
    name: string;
    division: string | null;
    status: string;
    reason: string | null;
  }>;
  pendingLeaves: Array<{
    id: number;
    memberName: string;
    startDate: string;
    endDate: string;
    submittedAt: Date;
  }>;
  ongoingInterventions: Array<{
    id: number;
    memberName: string;
    stage: string;
    scheduledDate: string | null;
  }>;
  noAcademicLoadUpdate: Array<{
    memberId: number;
    name: string;
    division: string | null;
  }>;
}

export default function HRDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/hr/dashboard');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (!data) {
    return <div className="text-center py-12 text-slate-500">Failed to load dashboard</div>;
  }

  const total = data.statusCounts.hijau + data.statusCounts.kuning + data.statusCounts.merah + data.statusCounts.biru;

  return (
    <div className="space-y-6">
      {/* Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border-2 border-green-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Hijau</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">{data.statusCounts.hijau}</div>
          <div className="text-xs text-slate-500 mt-1">{total > 0 ? Math.round((data.statusCounts.hijau / total) * 100) : 0}% of total</div>
        </div>

        <div className="bg-white rounded-lg border-2 border-yellow-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Kuning</span>
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold text-yellow-600">{data.statusCounts.kuning}</div>
          <div className="text-xs text-slate-500 mt-1">{total > 0 ? Math.round((data.statusCounts.kuning / total) * 100) : 0}% of total</div>
        </div>

        <div className="bg-white rounded-lg border-2 border-red-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Merah</span>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-600">{data.statusCounts.merah}</div>
          <div className="text-xs text-slate-500 mt-1">{total > 0 ? Math.round((data.statusCounts.merah / total) * 100) : 0}% of total</div>
        </div>

        <div className="bg-white rounded-lg border-2 border-blue-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Biru (Cuti)</span>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600">{data.statusCounts.biru}</div>
          <div className="text-xs text-slate-500 mt-1">{total > 0 ? Math.round((data.statusCounts.biru / total) * 100) : 0}% of total</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members Needing Attention */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Needs Attention ({data.needsAttention.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.needsAttention.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">All members are doing well! 🎉</p>
            ) : (
              data.needsAttention.map((member) => (
                <div key={member.memberId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{member.name}</div>
                    <div className="text-xs text-slate-500">{member.division || 'No division'}</div>
                    {member.reason && <div className="text-xs text-slate-600 mt-1">{member.reason}</div>}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    member.status === 'merah' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {member.status.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Leaves */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Pending Leaves ({data.pendingLeaves.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.pendingLeaves.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No pending leave requests</p>
            ) : (
              data.pendingLeaves.map((leave) => (
                <div key={leave.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="font-medium text-sm">{leave.memberName}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    {leave.startDate} to {leave.endDate}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ongoing Interventions */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="font-semibold text-lg mb-4">Ongoing Interventions ({data.ongoingInterventions.length})</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.ongoingInterventions.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No ongoing interventions</p>
            ) : (
              data.ongoingInterventions.map((intervention) => (
                <div key={intervention.id} className="p-3 bg-slate-50 rounded-lg text-sm">
                  <div className="font-medium">{intervention.memberName}</div>
                  <div className="text-xs text-slate-600">Stage: {intervention.stage.toUpperCase()}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* No Academic Load Update */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="font-semibold text-lg mb-4">No Academic Load This Week ({data.noAcademicLoadUpdate.length})</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.noAcademicLoadUpdate.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">All members updated! ✅</p>
            ) : (
              data.noAcademicLoadUpdate.slice(0, 10).map((member) => (
                <div key={member.memberId} className="p-2 bg-slate-50 rounded text-sm">
                  {member.name} {member.division && `(${member.division})`}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
