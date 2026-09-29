import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, GraduationCap, Store, ArrowRight, ShieldCheck } from 'lucide-react';

export const RoleSelectionLandingPage: React.FC = () => {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-8 px-4 max-w-4xl mx-auto">
      {/* Brand Header */}
      <div className="text-center space-y-4 mb-10 max-w-lg mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider shadow-2xs">
          <Leaf className="w-4 h-4 text-emerald-600" />
          <span>Campus Food Decision Platform</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            EcoBite <span className="text-emerald-600">AI</span>
          </h1>
          <p className="text-lg font-bold text-slate-700">
            How do you want to continue?
          </p>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Select your role to access your dedicated portal.
          </p>
        </div>
      </div>

      {/* Role Selection Dual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl items-stretch">
        {/* STUDENT ROLE CARD */}
        <Link
          to="/student"
          className="rounded-3xl bg-white border-2 border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all p-7 sm:p-8 flex flex-col justify-between group relative overflow-hidden text-left"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <GraduationCap className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 uppercase tracking-wider">
                Student
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                Student
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Explore verified campus menus, nutritional analysis, price-proximate Smart Swaps, and track your daily wallet &amp; health impact.
              </p>
            </div>
          </div>

          <div className="pt-6 relative z-10">
            <div className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md group-hover:shadow-lg transition-all">
              <span>Continue as Student</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        {/* MANAGER ROLE CARD */}
        <Link
          to="/manager"
          className="rounded-3xl bg-slate-900 border-2 border-slate-800 hover:border-indigo-400 hover:shadow-xl transition-all p-7 sm:p-8 flex flex-col justify-between group relative overflow-hidden text-left text-white"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-indigo-400 flex items-center justify-center border border-slate-700 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Store className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/30 uppercase tracking-wider">
                Manager
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                Canteen Manager
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Upload menus with AI extraction, review &amp; publish live prices, monitor real-time student demand signals, and generate campus QR codes.
              </p>
            </div>
          </div>

          <div className="pt-6 relative z-10">
            <div className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md group-hover:shadow-lg transition-all">
              <span>Continue as Manager</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* Clean Privacy & Ground-Truth Footer Note */}
      <div className="mt-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Grounded in verified campus data • Zero student PII shared with canteen counters</span>
      </div>
    </div>
  );
};
