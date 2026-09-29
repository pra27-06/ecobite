import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  GraduationCap, 
  Store, 
  ArrowRight, 
  TrendingUp, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2,
  BarChart3
} from 'lucide-react';

export const RoleSelectionLandingPage: React.FC = () => {
  return (
    <div className="space-y-12 max-w-6xl mx-auto py-4 sm:py-8">
      {/* Brand Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider shadow-2xs">
          <Leaf className="w-4 h-4 text-emerald-600" />
          <span>Student Demand Intelligence Platform</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Smarter Campus Meals for Students. <br className="hidden sm:block" />
          <span className="text-emerald-700">Real Demand Signals</span> for Canteens.
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          EcoBite guides students to healthier, verified canteen meals while feeding live demand signals back to canteen kitchens — aligning prep with genuine student appetite before food is cooked.
        </p>
      </div>

      {/* Role Selection Dual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* STUDENT CARD */}
        <div className="rounded-3xl bg-white border-2 border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all p-7 sm:p-9 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <GraduationCap className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 uppercase tracking-wider">
                Student Portal
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                I am a Student
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                Scan or search campus food, see instant Health + Wallet + Planet ratings, discover healthier Smart Swaps at MAIT canteens, and track your daily savings.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>AI Food Scanner &amp; Search:</strong> Nutritional, price, &amp; carbon analysis.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Health-First Smart Swap:</strong> Like-for-like verified campus alternatives.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>My Impact Dashboard:</strong> Track actual money saved (₹) and CO₂e avoided.</span>
              </div>
            </div>
          </div>

          <div className="pt-8 relative z-10 space-y-3">
            <Link
              to="/student"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <span>Enter Student Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-1">
              <Link to="/search" className="hover:text-emerald-700 font-medium">Search Food</Link>
              <span>•</span>
              <Link to="/scan" className="hover:text-emerald-700 font-medium">Scan Food</Link>
              <span>•</span>
              <Link to="/campus" className="hover:text-emerald-700 font-medium">Verify MAIT</Link>
            </div>
          </div>
        </div>

        {/* CANTEEN OWNER CARD */}
        <div className="rounded-3xl bg-slate-900 border-2 border-slate-800 hover:border-indigo-400 hover:shadow-xl transition-all p-7 sm:p-9 flex flex-col justify-between group relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-indigo-400 flex items-center justify-center border border-slate-700 group-hover:scale-105 transition-transform">
                <Store className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 uppercase tracking-wider">
                Canteen Owner Portal
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                I am a Canteen Owner
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                View real-time student demand intelligence across MAIT counters. Track food searches, swap acceptances, rejection feedback, and generate counter QR codes.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <BarChart3 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Live Student Demand Signals:</strong> Searches, accepted swaps, &amp; rejections.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Top Demanded Dishes:</strong> Real-time demand score computed from student inputs.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <QrCode className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Campus Counter QR:</strong> Generate printable QR codes for student verification.</span>
              </div>
            </div>
          </div>

          <div className="pt-8 relative z-10 space-y-3">
            <Link
              to="/owner"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <span>Enter Canteen Owner Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-1">
              <span>Campus Code: <strong>MAIT-DEMO</strong></span>
              <span>•</span>
              <span className="text-emerald-400">Zero PII • Real-Time Firestore</span>
            </div>
          </div>
        </div>
      </div>

      {/* Honest Architectural Transparency Banner */}
      <div className="p-6 rounded-3xl bg-slate-100 border border-slate-200/80 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-slate-700 flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">
              Authentic Campus Intelligence • No Synthetic Metrics
            </div>
            <p className="text-slate-500 mt-0.5 leading-relaxed">
              EcoBite does not claim to track cash register sales or weigh physical kitchen bins. Instead, we capture student discovery &amp; swap telemetry to optimize cafeteria prep before waste occurs.
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Maharaja Agrasen Institute of Technology (MAIT)
          </span>
        </div>
      </div>
    </div>
  );
};
