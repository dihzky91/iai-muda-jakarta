'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Star } from 'lucide-react';

interface Evaluation {
  id: number;
  memberName: string;
  month: string;
  evaluationNotes: string | null;
  actionItems: string | null;
  rating: number | null;
  evaluatedBy: string | null;
  createdAt: Date;
}

export default function HREvaluationManager({ onRefresh }: { onRefresh: () => void }) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const res = await fetch('/api/hr/evaluations');
      const result = await res.json();
      if (result.success) {
        setEvaluations(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEvaluation = async () => {
    const memberId = prompt('Enter Member ID:');
    if (!memberId) return;
    
    const month = prompt('Month (YYYY-MM format, e.g., 2026-07):');
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      alert('Invalid month format. Use YYYY-MM');
      return;
    }

    const evaluationNotes = prompt('Evaluation Notes:') || '';
    const actionItems = prompt('Action Items:') || '';
    const ratingStr = prompt('Rating (1-5):');
    const rating = ratingStr ? parseInt(ratingStr) : null;

    if (rating && (rating < 1 || rating > 5)) {
      alert('Rating must be between 1 and 5');
      return;
    }

    try {
      const res = await fetch('/api/hr/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: parseInt(memberId), month, evaluationNotes, actionItems, rating }),
      });
      const result = await res.json();
      if (result.success) {
        alert('Evaluation saved successfully!');
        fetchEvaluations();
        onRefresh();
      } else {
        alert(result.error || 'Failed to save evaluation');
      }
    } catch (error) {
      alert('Failed to save evaluation');
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-4">
      <button
        onClick={addEvaluation}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Evaluation
      </button>

      <div className="space-y-3">
        {evaluations.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No evaluations yet</div>
        ) : (
          evaluations.map((evaluation) => (
            <div key={evaluation.id} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-lg">{evaluation.memberName}</div>
                  <div className="text-sm text-slate-600">{evaluation.month}</div>
                </div>
                {evaluation.rating && (
                  <div className="flex items-center gap-1">
                    {[...Array(evaluation.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    {[...Array(5 - (evaluation.rating || 0))].map((_, i) => (
                      <Star key={i + (evaluation.rating || 0)} className="w-4 h-4 text-slate-300" />
                    ))}
                  </div>
                )}
              </div>
              {evaluation.evaluationNotes && (
                <div className="text-sm text-slate-700 mt-2 bg-slate-50 p-3 rounded">
                  {evaluation.evaluationNotes}
                </div>
              )}
              {evaluation.actionItems && (
                <div className="text-sm text-slate-700 mt-2">
                  <span className="font-medium">Action Items:</span> {evaluation.actionItems}
                </div>
              )}
              <div className="text-xs text-slate-500 mt-3">
                Evaluated by: {evaluation.evaluatedBy || 'System'} on {new Date(evaluation.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
