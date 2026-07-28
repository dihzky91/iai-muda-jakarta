'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface Intervention {
  id: number;
  memberName: string;
  stage: string;
  notes: string | null;
  actionTaken: string | null;
  scheduledDate: string | null;
  completedDate: string | null;
  performedBy: string | null;
  createdAt: Date;
}

export default function HRInterventionManager({ onRefresh }: { onRefresh: () => void }) {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterventions();
  }, []);

  const fetchInterventions = async () => {
    try {
      const res = await fetch('/api/hr/interventions');
      const result = await res.json();
      if (result.success) {
        setInterventions(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch interventions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addIntervention = async () => {
    const memberId = prompt('Enter Member ID:');
    if (!memberId) return;
    
    const stage = prompt('Stage (h1/h3/h3_h7/h7_zoom/h7_h14/h14_h21/post_h21):');
    if (!stage) return;

    const notes = prompt('Notes:') || '';
    const actionTaken = prompt('Action Taken:') || '';

    try {
      const res = await fetch('/api/hr/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: parseInt(memberId), stage, notes, actionTaken }),
      });
      const result = await res.json();
      if (result.success) {
        alert('Intervention logged successfully!');
        fetchInterventions();
        onRefresh();
      } else {
        alert(result.error || 'Failed to log intervention');
      }
    } catch (error) {
      alert('Failed to log intervention');
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-4">
      <button
        onClick={addIntervention}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Intervention
      </button>

      <div className="space-y-3">
        {interventions.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No interventions logged</div>
        ) : (
          interventions.map((intervention) => (
            <div key={intervention.id} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold text-lg">{intervention.memberName}</div>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                  {intervention.stage.toUpperCase()}
                </span>
              </div>
              {intervention.notes && (
                <div className="text-sm text-slate-600 mt-2">
                  <span className="font-medium">Notes:</span> {intervention.notes}
                </div>
              )}
              {intervention.actionTaken && (
                <div className="text-sm text-slate-600 mt-1">
                  <span className="font-medium">Action:</span> {intervention.actionTaken}
                </div>
              )}
              <div className="text-xs text-slate-500 mt-3 flex gap-4">
                <span>By: {intervention.performedBy || 'System'}</span>
                <span>Date: {new Date(intervention.createdAt).toLocaleDateString()}</span>
                {intervention.completedDate && <span className="text-green-600">✓ Completed</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
