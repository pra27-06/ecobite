import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Search, Sparkles, TrendingUp, ArrowRight, ShieldCheck, IndianRupee, Globe } from 'lucide-react';
import { CampusStatus } from '../components/CampusStatus';
import { FoodCard } from '../components/FoodCard';
import { Button } from '../components/Button';
import { MOCK_FOODS } from '../data/mockFoods';
import { MOCK_WEEKLY_IMPACT } from '../data/mockImpact';
import { MOCK_USER } from '../data/mockUser';
import { useCampus } from '../hooks/useCampusAccess';

export const HomePage: React.FC = () => {
  const { isVerified, campusShortName } = useCampus();

  // Highlight recent decisions from mock data
  const recentDecisions = MOCK_FOODS.filter((f) =>
    ['chole-bhature', 'paneer-sandwich', 'cold-coffee'].includes(f.id)
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Greeting & Campus Status Banner */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Student Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Good morning, {MOCK_USER.name} 👋
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Demo Profile</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Global Campus Access Banner */}
        <CampusStatus />
      </div>

      {/* Primary Action Hero: "What are you eating today?" */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Health • Budget • Carbon</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            What are you eating today?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Scan your plate or search campus meals to get immediate nutritional clarity, affordability checks, and smarter alternatives.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link to="/scan" className="flex-1 sm:flex-initial">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Camera className="w-5 h-5" />}
                className="w-full justify-center"
              >
                Scan Food
              </Button>
            </Link>

            <Link to="/search" className="flex-1 sm:flex-initial">
              <Button
                variant="outline"
                size="lg"
                leftIcon={<Search className="w-5 h-5" />}
                className="w-full justify-center bg-white/10 text-white hover:bg-white/20 border-white/20"
              >
                Search Food
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative background watermark */}
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none select-none text-9xl">
          🥗
        </div>
      </section>

      {/* Quick Action Navigation */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/swap"
          className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Smart Swap Engine
              </div>
              <div className="text-xs text-slate-500">
                Replace heavy canteen cravings with healthier, cheaper options.
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0" />
        </Link>

        <Link
          to="/impact"
          className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                Weekly Impact Dashboard
              </div>
              <div className="text-xs text-slate-500">
                Track money saved in rupees and your estimated CO₂ avoided.
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-all shrink-0" />
        </Link>
      </section>

      {/* Impact Snapshot (Demo values clearly labelled) */}
      <section className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Weekly Activity & Impact</h3>
            <p className="text-xs text-slate-500">
              Demo figures illustrating student impact telemetry
            </p>
          </div>
          <Link
            to="/impact"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
          >
            <span>View Full Stats</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/60">
            <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold uppercase tracking-wider">
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Money Saved</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">₹{MOCK_WEEKLY_IMPACT.moneySaved}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">from smart food choices</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
            <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Swaps</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{MOCK_WEEKLY_IMPACT.smartSwapsCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">accepted this week</div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/60">
            <div className="flex items-center gap-1.5 text-blue-800 text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Food Decisions</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{MOCK_WEEKLY_IMPACT.foodDecisionsCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">analyzed & logged</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-700 text-xs font-bold uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>CO₂ Avoided</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{MOCK_WEEKLY_IMPACT.estimatedCo2Kg} kg</div>
            <div className="text-[11px] text-slate-500 mt-0.5">estimated reduction</div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          * Note: Values displayed above are demo values for prototype evaluation. Real student impact records will populate from Cloud Firestore.
        </p>
      </section>

      {/* Recent Food Decisions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Decisions</h3>
            <p className="text-xs text-slate-500">
              Popular college meals analyzed on Health, Affordability, and Carbon impact
            </p>
          </div>
          <Link
            to="/search"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
          >
            <span>Browse All Foods</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentDecisions.map((food) => (
            <FoodCard key={food.id} food={food} showSwapAction={isVerified} />
          ))}
        </div>
      </section>

      {/* Data Principle Notice */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">Ground-Truth Guarantee: </span>
          EcoBite strictly pairs AI nutrition reasoning with verified database facts. {isVerified ? `Active verified campus is ${campusShortName}.` : 'Currently in General Mode.'}
        </div>
      </div>
    </div>
  );
};
