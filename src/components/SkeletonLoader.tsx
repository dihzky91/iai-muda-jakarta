import React from 'react';

export function SkeletonBanner() {
  return (
    <div className="animate-pulse space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="h-4 bg-slate-200 rounded-full w-24 mb-4"></div>
      <div className="h-10 bg-slate-200 rounded-2xl w-3/4 sm:w-1/2"></div>
      <div className="h-6 bg-slate-200 rounded-xl w-full sm:w-2/3"></div>
      <div className="flex gap-4">
        <div className="h-12 bg-slate-300 rounded-2xl w-36"></div>
        <div className="h-12 bg-slate-200 rounded-2xl w-36"></div>
      </div>
    </div>
  );
}

export function SkeletonCardGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="h-48 bg-slate-200 rounded-2xl w-full"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded-full w-1/3"></div>
            <div className="h-6 bg-slate-200 rounded-full w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded-full w-5/6 text-slate-100"></div>
          </div>
          <div className="flex justify-between items-center pt-4">
            <div className="h-8 bg-slate-200 rounded-full w-24"></div>
            <div className="h-4 bg-slate-200 rounded-full w-12"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonPillars() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-100 rounded-3xl p-8 space-y-4 shadow-sm text-center">
          <div className="mx-auto h-16 w-16 bg-slate-200 rounded-2xl"></div>
          <div className="h-6 bg-slate-200 rounded-full w-1/2 mx-auto"></div>
          <div className="h-4 bg-slate-200 rounded-full w-5/6 mx-auto"></div>
          <div className="h-4 bg-slate-200 rounded-full w-4/6 mx-auto"></div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonStructure() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-12">
      {/* Gen Selector */}
      <div className="h-12 bg-slate-200 rounded-2xl w-48 mx-auto"></div>
      
      {/* Leader */}
      <div className="flex flex-col items-center space-y-4">
        <div className="h-32 w-32 bg-slate-200 rounded-full"></div>
        <div className="h-6 bg-slate-200 rounded-full w-36"></div>
        <div className="h-4 bg-slate-200 rounded-full w-24"></div>
      </div>

      {/* Committee Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center space-y-3 shadow-sm">
            <div className="h-20 w-20 bg-slate-200 rounded-full"></div>
            <div className="h-4 bg-slate-200 rounded-full w-24"></div>
            <div className="h-3 bg-slate-200 rounded-full w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
