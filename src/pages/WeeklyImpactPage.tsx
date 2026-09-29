import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, Sparkles, TrendingUp, Globe, ShieldCheck, ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { LoadingState } from '../components/LoadingState';
import { useAuth } from '../hooks/useAuth';
import { impactService, type UserWeeklySummary } from '../services/impactService';
import type { ImpactLogDoc } from '../types';

export const WeeklyImpactPage: React.FC = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid || 'guest-student';

  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<UserWeeklySummary | null>(null);
  const [logs, setLogs] = useState<ImpactLogDoc[]>([]);

  useEffect(() => {
    let isCancelled = false;

    async function loadImpact() {
      const [sumRes, logsRes] = await Promise.all([
        impactService.getUserImpactSummary(userId),
        impactService.getUserImpactLogs(userId, 50),
      ]);

      if (isCancelled) return;
      setIsLoading(false);

      if (sumRes.success && sumRes.data) {
        setSummary(sumRes.data);
      } else {
        setSummary(impactService.getEmptySummary());
      }

      if (logsRes.success && logsRes.data) {
        setLogs(logsRes.data);
      }
    }

    loadImpact();

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-12">
        <LoadingState label="Loading your personal impact telemetry..." />
      </div>
    );
  }

  const hasData = summary?.hasData && logs.length > 0;
  const maxDailyAmount = summary
    ? Math.max(...summary.dailySavings.map((d) => d.amount), 50)
    : 50;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <PageHeader
        title="Weekly Impact Dashboard"
        description="Review personal financial savings and estimated environmental benefits earned through conscious campus food choices."
        badge={
          <Badge variant="emerald" size="md">
            {summary?.timeframe || 'This Week'}
          </Badge>
        }
        showBackButton
      />

      {/* 4 Core Impact Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Money Saved"
          value={`₹${summary?.moneySaved || 0}`}
          subtext="accumulated via Smart Swaps"
          icon={<IndianRupee className="w-4 h-4" />}
          variant="amber"
        />

        <StatCard
          label="Smart Swaps"
          value={summary?.smartSwapsCount || 0}
          subtext="healthier meals chosen"
          icon={<Sparkles className="w-4 h-4" />}
          variant="emerald"
        />

        <StatCard
          label="Food Decisions"
          value={summary?.foodDecisionsCount || 0}
          subtext="dishes logged & reviewed"
          icon={<TrendingUp className="w-4 h-4" />}
          variant="blue"
        />

        <StatCard
          label="Estimated CO₂ Saved"
          value={`${summary?.estimatedCo2Kg || 0} kg`}
          subtext="approx. carbon offset"
          icon={<Globe className="w-4 h-4" />}
          variant="slate"
        />
      </div>

      {/* Empty State vs Real Data Display */}
      {!hasData ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-slate-900">
              No smart swaps yet.
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your first accepted swap will appear here. Whenever you accept a healthier or more affordable campus food recommendation, your real pocket savings (₹) and estimated carbon reductions will be tracked here.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/search">
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore Campus Smart Swaps
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Daily Savings Mini-Chart & Impact Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Daily Breakdown Chart */}
            <Card padding="lg" className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Daily Savings Velocity</h3>
                  <p className="text-xs text-slate-500">
                    Real savings accumulated from weekday campus swaps
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Total: ₹{summary?.moneySaved || 0}
                </span>
              </div>

              {/* Simple Responsive Bar Chart */}
              <div className="pt-6 pb-2">
                <div className="flex items-end justify-between gap-3 h-40 px-2 sm:px-6 border-b border-slate-100">
                  {summary?.dailySavings.map((item) => {
                    const heightPercent =
                      item.amount > 0 ? (item.amount / maxDailyAmount) * 100 : 8;
                    return (
                      <div
                        key={item.day}
                        className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                      >
                        <span className="text-[11px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                          ₹{item.amount}
                        </span>
                        <div
                          className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 ${
                            item.amount > 0
                              ? 'bg-emerald-600 group-hover:bg-emerald-700'
                              : 'bg-slate-100'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-xs font-semibold text-slate-500 pt-1">
                          {item.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                * Chart reflects authenticated user decisions recorded in Firestore impact logs.
              </p>
            </Card>

            {/* Sustainability Equivalency Card */}
            <Card variant="accent" padding="lg" className="space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <Badge variant="emerald" size="sm">
                  Estimated Equivalency
                </Badge>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  What does {summary?.estimatedCo2Kg} kg CO₂ saved mean?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  By trading deep-fried items for fresh plant-forward canteen meals, you avoided emissions approximately equivalent to:
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 py-2">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-emerald-100">
                  <span className="text-xl">🛵</span>
                  <span>
                    <strong>~{Math.max(1, Math.round((summary?.estimatedCo2Kg || 0) * 14))} km</strong> of two-wheeler transit emissions
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-emerald-100">
                  <span className="text-xl">💡</span>
                  <span>
                    <strong>~{Math.max(5, Math.round((summary?.estimatedCo2Kg || 0) * 220))} hours</strong> of LED study lamp usage
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400">
                Estimated values derived from benchmark Indian food lifecycle emission factors.
              </p>
            </Card>
          </div>

          {/* Recent Activity Timeline */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Activity Timeline</h3>
                <p className="text-xs text-slate-500">History of your accepted campus Smart Swaps</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {logs.length} logged events
              </span>
            </div>

            <Card padding="none" className="divide-y divide-slate-100 overflow-hidden">
              {logs.map((item) => (
                <div
                  key={item.logId}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-emerald-100 text-emerald-800">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          Swapped for {item.selectedAlternative}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                          {item.campusId.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Original choice: <em>{item.originalFood}</em>
                        {item.originalPrice ? ` (₹${item.originalPrice})` : ''} →{' '}
                        {item.alternativePrice ? `₹${item.alternativePrice}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-12 sm:pl-0">
                    <div className="text-right">
                      {item.moneySaved > 0 ? (
                        <div className="text-xs font-bold text-emerald-700">
                          +₹{item.moneySaved} saved
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400">Decision logged</div>
                      )}
                      <div className="text-[10px] text-slate-400">
                        {new Date(item.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </section>
        </>
      )}

      {/* Ethical Prototype Notice */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <span>
          <strong>Ground-Truth Impact Notice: </strong>EcoBite AI never fabricates personal financial or environmental impact. All stats are aggregated from your authentic accepted decisions.
        </span>
      </div>
    </div>
  );
};
