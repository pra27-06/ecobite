import React from 'react';
import { BookOpen, ShieldCheck, Database, Cpu, Compass, Layers } from 'lucide-react';

export const ContextPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>System Architecture & Vision</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          EcoBite AI Project Context
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">
          Complete conceptual breakdown of the platform, architectural principles, and prototype roadmap.
        </p>
      </div>

      {/* Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Compass className="w-5 h-5 text-emerald-600" />
            <h3>1. One National App, Two Modes</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            EcoBite AI operates as a unified national platform. General food intelligence (nutritional breakdown, health rating, affordability tier, carbon score) is universally accessible. Campus-specific menus and prices are strictly gated.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3>2. Physical QR Access Verification</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Campus data cannot be accessed simply by choosing a college name from a dropdown. Access requires physical QR code verification deployed at designated campus locations to protect institutional canteen data.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Database className="w-5 h-5 text-emerald-600" />
            <h3>3. Database = Verified Facts</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Cloud Firestore stores authentic, verified ground truth: exact menu items, official canteen prices (e.g. ₹30 Paneer Sandwich at MAIT), and live stall availability.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Cpu className="w-5 h-5 text-emerald-600" />
            <h3>4. AI = Analysis & Smart Swaps</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Gemini AI acts as the reasoning engine. It compares nutritional profiles and recommends healthier, cost-effective alternatives available in the student's verified campus canteen. The AI never fabricates prices.
          </p>
        </div>
      </div>

      {/* Docs link */}
      <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-emerald-700" />
          <div>
            <div className="font-bold text-sm text-emerald-950">Technical Architecture Document</div>
            <div className="text-xs text-emerald-800">
              Complete specification available at <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded">/docs/ECOBITE_CONTEXT.md</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
