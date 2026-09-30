import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, TrendingUp, ArrowRight, Building2, Store, CheckCircle2 } from 'lucide-react';
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
              Student Food Decision Platform
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Good morning, {MOCK_USER.name} 👋
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              {isVerified ? `${campusShortName || 'Campus'} Session Active` : 'General Mode Session'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Global Campus Access Banner */}
        <CampusStatus />
      </div>

      {/* Primary Action Hero: "Healthier. Cheaper. More Sustainable." */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Healthier • Cheaper • More Sustainable</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            What are you eating today?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            AI evaluates the nutrition, budget, and carbon footprint of your meals. Then, Smart Swap finds real, verified alternatives available right at your campus canteen.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link to="/search" className="flex-1 sm:flex-initial">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Search className="w-5 h-5" />}
                className="w-full justify-center"
              >
                Search Food
              </Button>
            </Link>

            <Link to="/campus" className="flex-1 sm:flex-initial">
              <Button
                variant="outline"
                size="lg"
                leftIcon={<Building2 className="w-5 h-5" />}
                className="w-full justify-center bg-white/10 text-white hover:bg-white/20 border-white/20"
              >
                {isVerified ? 'Campus Stalls' : 'Campus Menu'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative background watermark */}
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none select-none text-9xl">
          🥗
        </div>
      </section>

      {/* Verified Ground Truth Highlights */}
      <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Authentic Campus Ground Truth</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-extrabold uppercase">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Dishes, prices, and stock availability are directly linked to Cloud Firestore records published by your campus canteen manager.
            </p>
          </div>
        </div>
        <Link
          to="/campus"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs shrink-0"
        >
          <Store className="w-4 h-4" />
          <span>Browse Campus Stalls</span>
        </Link>
      </div>

      {/* Quick Action Navigation - ONLY STUDENT CONTROLS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                Health-first like-for-like campus alternatives.
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
                My Impact
              </div>
              <div className="text-xs text-slate-500">
                Cumulative money saved and CO₂ offset.
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all shrink-0" />
        </Link>

        <Link
          to="/campus"
          className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Campus Canteen Menu
              </div>
              <div className="text-xs text-slate-500">
                Browse verified stalls and authentic prices.
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0" />
        </Link>
      </section>

      {/* Popular Campus Foods Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Popular Campus Meals</h3>
            <p className="text-xs text-slate-500">
              Evaluated with real campus availability and honest ratings.
            </p>
          </div>
          <Link
            to="/search"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentDecisions.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      </section>

      {/* Honest Impact Teaser */}
      <section className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <span>Smart Swap Impact</span>
            </div>
            <h3 className="text-xl font-bold">Your Cumulative Health &amp; Savings</h3>
            <p className="text-xs text-slate-400 max-w-lg">
              Every accepted Smart Swap logs genuine financial savings and estimated environmental improvements.
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0 bg-white/5 p-4 rounded-2xl border border-white/10">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Money Saved</span>
              <span className="text-xl font-black text-emerald-400">₹{MOCK_WEEKLY_IMPACT.moneySaved}</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Healthier Swaps</span>
              <span className="text-xl font-black text-white">{MOCK_WEEKLY_IMPACT.smartSwapsCount}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
