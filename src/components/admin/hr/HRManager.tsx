'use client';

import React, { useState, useEffect } from 'react';
import { Users, HeartHandshake, FileText, MessageSquare, Star } from 'lucide-react';
import HRDashboard from './HRDashboard';
import HRMembersManager from './HRMembersManager';
import HRLeaveManager from './HRLeaveManager';
import HRInterventionManager from './HRInterventionManager';
import HREvaluationManager from './HREvaluationManager';

type HRTab = 'dashboard' | 'members' | 'leave' | 'interventions' | 'evaluations';

const HR_TABS = [
  { key: 'dashboard' as const, label: 'Dashboard', icon: HeartHandshake },
  { key: 'members' as const, label: 'Anggota', icon: Users },
  { key: 'leave' as const, label: 'Pengajuan Cuti', icon: FileText },
  { key: 'interventions' as const, label: 'Intervensi', icon: MessageSquare },
  { key: 'evaluations' as const, label: 'Evaluasi', icon: Star },
];

export default function HRManager() {
  const [activeTab, setActiveTab] = useState<HRTab>('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = () => setRefreshTrigger(prev => prev + 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <HeartHandshake className="w-8 h-8" />
          <h1 className="text-2xl font-bold">HR Command Center</h1>
        </div>
        <p className="text-blue-100 text-sm">
          Systematic Control • Operational Standard • Solidarity Internal
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
        <div className="flex gap-2 overflow-x-auto">
          {HR_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'dashboard' && <HRDashboard key={refreshTrigger} />}
        {activeTab === 'members' && <HRMembersManager key={refreshTrigger} onRefresh={refresh} />}
        {activeTab === 'leave' && <HRLeaveManager key={refreshTrigger} onRefresh={refresh} />}
        {activeTab === 'interventions' && <HRInterventionManager key={refreshTrigger} onRefresh={refresh} />}
        {activeTab === 'evaluations' && <HREvaluationManager key={refreshTrigger} onRefresh={refresh} />}
      </div>
    </div>
  );
}
