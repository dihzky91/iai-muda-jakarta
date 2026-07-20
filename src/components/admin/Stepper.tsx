'use client';

import React from 'react';

interface Step {
  key: string;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  current: number;
}

export default function Stepper({ steps, current }: StepperProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, idx) => {
        const isActive = idx === current;
        const isCompleted = idx < current;
        const isLast = idx === steps.length - 1;

        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  isActive
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>
              <div className="mt-1.5 text-center hidden sm:block">
                <p className={`text-[10px] font-bold ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-[9px] text-slate-400 max-w-[80px] leading-tight">{step.description}</p>
                )}
              </div>
            </div>
            {!isLast && (
              <div className="flex-1 h-0.5 mx-2 bg-slate-100">
                <div
                  className={`h-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-100'}`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
