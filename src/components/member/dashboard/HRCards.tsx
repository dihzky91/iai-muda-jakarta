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
    if (!status) return 'bg-slate-100 text-slate-700';
    const colors: Record<string, string> = {
      hijau: 'bg-green-100 text-green-700 border-green-300',
      kuning: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      merah: 'bg-red-100 text-red-700 border-red-300',
      biru: 'bg-blue-100 text-blue-700 border-blue-300',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const status = data?.currentStatus;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-lg">HR Status</h3>
      </div>
      {status ? (
        <div>
          <div className={`inline-block px-4 py-2 rounded-lg font-medium border-2 ${getStatusColor(status.status)}`}>
            {status.status.toUpperCase()}
          </div>
          {status.reason && (
            <p className="text-sm text-slate-600 mt-3 bg-slate-50 p-3 rounded">{status.reason}</p>
          )}
          <p className="text-xs text-slate-500 mt-3">
            Last updated: {new Date(status.createdAt).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <p className="text-sm text-slate-500">No status recorded yet</p>
      )}
    </div>
  );
}

export function AcademicLoadCard() {
  const [showForm, setShowForm] = useState(false);
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
    try {
      const res = await fetch('/api/member/hr/academic-load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, weekStart: getWeekStart() }),
      });
      const result = await res.json();
      if (result.success) {
        alert('Academic load updated!');
        setShowForm(false);
        setFormData({ loadType: 'uts', intensity: 'medium', description: '' });
      } else {
        alert(result.error || 'Failed to update');
      }
    } catch (error) {
      alert('Failed to update academic load');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center gap-3 mb-4">
        <BookOpen className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-lg">Academic Load</h3>
      </div>
      
      {!showForm ? (
        <div>
          <p className="text-sm text-slate-600 mb-4">Update your academic load for this week</p>
          <button
            onClick={() => setShowForm(true)}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Update Load
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Load Type</label>
            <select
              value={formData.loadType}
              onChange={(e) => setFormData({ ...formData, loadType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="uts">UTS</option>
              <option value="uas">UAS</option>
              <option value="quiz">Quiz</option>
              <option value="project">Project</option>
              <option value="sick">Sick</option>
              <option value="personal">Personal</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Intensity</label>
            <select
              value={formData.intensity}
              onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
              Submit
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// Main HRCards component that renders all HR cards
export function HRCards() {
  return (
    <div className="space-y-4">
      <HRStatusCard />
      <AcademicLoadCard />
      <LeaveRequestCard />
    </div>
  );
}

// Default export for convenience
export default HRCards;

export function LeaveRequestCard() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    leaveType: 'regular',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/member/hr/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        alert('Leave request submitted! Waiting for HR approval.');
        setShowForm(false);
        setFormData({ startDate: '', endDate: '', reason: '', leaveType: 'regular' });
      } else {
        alert(result.error || 'Failed to submit');
      }
    } catch (error) {
      alert('Failed to submit leave request');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="w-5 h-5 text-orange-600" />
        <h3 className="font-semibold text-lg">Leave Request</h3>
      </div>
      
      {!showForm ? (
        <div>
          <p className="text-sm text-slate-600 mb-4">Request leave (cuti) with proper approval flow</p>
          <button
            onClick={() => setShowForm(true)}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Request Leave
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
            <textarea
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="regular">Regular (H-10 rule)</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            Max 7 days per 2 months. Regular leave needs 10 days advance notice.
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
              Submit
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
