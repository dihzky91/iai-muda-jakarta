'use client';

import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface LeaveRequest {
  id: number;
  memberName: string;
  memberDivision: string | null;
  startDate: string;
  endDate: string;
  reason: string;
  leaveType: string;
  status: string;
  submittedAt: Date;
}

export default function HRLeaveManager({ onRefresh }: { onRefresh: () => void }) {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const fetchLeaves = async () => {
    try {
      const url = statusFilter === 'all' ? '/api/hr/leave' : `/api/hr/leave?status=${statusFilter}`;
      const res = await fetch(url);
      const result = await res.json();
      if (result.success) {
        setLeaves(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (leaveId: number, status: 'approved' | 'rejected') => {
    const reviewNotes = prompt(`${status === 'approved' ? 'Approve' : 'Reject'} this leave request. Add notes (optional):`);
    if (reviewNotes === null) return;

    try {
      const res = await fetch(`/api/hr/leave/${leaveId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewNotes }),
      });
      const result = await res.json();
      if (result.success) {
        alert(`Leave request ${status}!`);
        fetchLeaves();
        onRefresh();
      } else {
        alert(result.error || 'Failed to update leave');
      }
    } catch (error) {
      alert('Failed to update leave request');
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {leaves.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No leave requests</div>
        ) : (
          leaves.map((leave) => (
            <div key={leave.id} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-lg">{leave.memberName}</div>
                  <div className="text-sm text-slate-600 mt-1">{leave.memberDivision || 'No division'}</div>
                  <div className="text-sm mt-2">
                    <span className="font-medium">Dates:</span> {leave.startDate} to {leave.endDate}
                  </div>
                  <div className="text-sm mt-1">
                    <span className="font-medium">Type:</span> {leave.leaveType}
                  </div>
                  <div className="text-sm mt-1">
                    <span className="font-medium">Reason:</span> {leave.reason}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Submitted: {new Date(leave.submittedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded text-xs font-medium ${
                    leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                    leave.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {leave.status.toUpperCase()}
                  </span>
                  {leave.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(leave.id, 'approved')}
                        className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReview(leave.id, 'rejected')}
                        className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
