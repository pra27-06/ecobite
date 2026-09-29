import React from 'react';
import { TrendingUp, IndianRupee, Globe2, Activity } from 'lucide-react';

export const ImpactPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5" />
          <span>Student Savings & Carbon Footprint</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Personal Impact Tracker
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">
          See cumulative financial savings and carbon footprint reductions achieved by choosing EcoBite Smart Swaps.
        </p>
      </div>

      {/* Metric Cards Shell */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">₹0</div>
            <div className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Money Saved via Smart Swaps</div>
          </div>
          <p className="text-xs text-slate-500 pt-1">
            Calculated from price differences between scanned items and chosen campus alternatives.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">0.00 kg CO₂</div>
            <div className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Estimated Carbon Avoided</div>
          </div>
          <p className="text-xs text-slate-500 pt-1">
            Estimated carbon emissions saved through eco-friendly meal choices over time.
          </p>
        </div>
      </div>

      {/* Impact Log Status */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Impact Log Pipeline (Future Integration)</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          When verified students log meals and accept Smart Swaps, real-time records are persisted to Firestore in the <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono text-[11px]">impactLogs</code> collection. Visual analytics powered by Recharts will display weekly and monthly trends once Firestore logging is connected.
        </p>
      </div>
    </div>
  );
};
