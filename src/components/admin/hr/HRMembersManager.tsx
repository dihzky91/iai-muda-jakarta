'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';

interface Member {
  id: number;
  name: string;
  email: string;
  division: string | null;
  university: string | null;
  currentStatus: {
    status: string;
    reason: string | null;
    lastUpdated: Date;
  } | null;
}

export default function HRMembersManager({ onRefresh }: { onRefresh: () => void }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/hr/members');
      const result = await res.json();
      if (result.success) {
        setMembers(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <span className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-600">No Status</span>;
    const colors = {
      hijau: 'bg-green-100 text-green-700',
      kuning: 'bg-yellow-100 text-yellow-700',
      merah: 'bg-red-100 text-red-700',
      biru: 'bg-blue-100 text-blue-700',
    };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-slate-100'}`}>{status?.toUpperCase()}</span>;
  };

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.currentStatus?.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="hijau">Hijau</option>
          <option value="kuning">Kuning</option>
          <option value="merah">Merah</option>
          <option value="biru">Biru</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Division</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">University</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm">{member.name}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{member.division || '-'}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{member.university || '-'}</td>
                <td className="px-4 py-3">{getStatusBadge(member.currentStatus?.status || null)}</td>
                <td className="px-4 py-3">
                  <a href={`/admin/hr/members/${member.id}`} className="text-blue-600 hover:underline text-sm">View Detail</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-sm text-slate-600">Showing {filtered.length} of {members.length} members</div>
    </div>
  );
}
