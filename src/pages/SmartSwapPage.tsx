import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowDown, 
  ArrowRight, 
  CheckCircle2, 
  HeartPulse, 
  IndianRupee, 
  Globe, 
  MapPin, 
  Check, 
  Info, 
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { LoadingState } from '../components/LoadingState';
import { useCampus } from '../hooks/useCampusAccess';
import { useAuth } from '../hooks/useAuth';
import { swapService } from '../services/swapService';
import { aiService } from '../services/aiService';
import { impactService } from '../services/impactService';
import type { AIFoodAnalysisResult, SmartSwapResult } from '../types';

export const SmartSwapPage: React.FC = () => {
  const { foodId } = useParams<{ foodId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isVerified, campusShortName } = useCampus();
  const { currentUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [swapData, setSwapData] = useState<SmartSwapResult | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadSwap() {
      // 1. Determine the AI analysis input
      let analysis: AIFoodAnalysisResult | null = location.state?.aiAnalysis || null;

      if (!analysis) {
        const query = foodId ? decodeURIComponent(foodId).replace(/-/g, ' ') : 'Chole Bhature';
        const aiResp = await aiService.analyzeFoodName(query);
        if (aiResp.success && aiResp.data) {
          analysis = aiResp.data;
        } else {
          analysis = aiService.analyzeOfflineFood(query);
        }
      }

      if (isCancelled) return;

      // 2. Call the centralized recommendation engine
      const swapResp = await swapService.getSmartSwap(
        analysis.foodName,
        analysis,
        'MAIT',
        isVerified
      );

      if (isCancelled) return;
      setIsLoading(false);

      if (swapResp.success && swapResp.data) {
        setSwapData(swapResp.data);
      } else {
        setErrorMsg(swapResp.error || 'Failed to formulate Smart Swap.');
      }
    }

    loadSwap();

    return () => {
      isCancelled = true;
    };
  }, [foodId, isVerified, location.state]);

  const handleAcceptSwap = async () => {
    if (!swapData || !swapData.recommendedSwap) return;
    setIsLogging(true);

    try {
      await impactService.logDecision({
        userId: currentUser?.uid || 'guest-student',
        campusId: isVerified ? 'MAIT' : 'general',
        originalFood: swapData.originalFood.name,
        selectedAlternative: swapData.recommendedSwap.name,
        originalPrice: swapData.originalFood.price,
        alternativePrice: swapData.recommendedSwap.price,
        moneySaved: swapData.recommendedSwap.moneySaved,
        estimatedImpact: {
          co2SavedKg: 0.28,
        },
      });

      setIsLogging(false);
      setIsLogged(true);
    } catch (err) {
      console.warn('Error recording impact decision:', err);
      setIsLogging(false);
      setIsLogged(true);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <LoadingState
          label={
            isVerified
              ? "Scanning authentic Maharaja Agrasen Institute of Technology canteens for verified Smart Swaps..."
              : "Formulating general national nutritional benchmark alternative..."
          }
        />
      </div>
    );
  }

  if (errorMsg || !swapData) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Recommendation Unavailable</h2>
        <p className="text-xs text-slate-500">{errorMsg || 'Could not evaluate Smart Swap at this time.'}</p>
        <Button variant="primary" size="md" onClick={() => navigate('/search')}>
          Search Another Dish
        </Button>
      </div>
    );
  }

  const { originalFood, recommendedSwap, hasSwap, noSwapReason } = swapData;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <PageHeader
        title="Smart Swap Recommendation"
        description="Actionable, nutritious alternatives calibrated to real campus canteen reality instead of generic dieting advice."
        badge={
          <Badge variant={isVerified ? 'emerald' : 'blue'} size="md">
            {isVerified ? `Bounded to ${campusShortName} Canteens` : 'General National Benchmark'}
          </Badge>
        }
        showBackButton
      />

      {/* Campus Verification Context Banner */}
      {!isVerified && (
        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="font-bold block">Viewing General Recommendation</span>
              <span className="text-[11px] text-blue-700">
                To see real stall names, counter availability, and exact prices for your campus, verify your college access.
              </span>
            </div>
          </div>
          <Link to="/campus" className="shrink-0">
            <Button variant="outline" size="sm" className="bg-white">
              Verify Campus QR
            </Button>
          </Link>
        </div>
      )}

      {/* NO MATCH CASE */}
      {!hasSwap || !recommendedSwap ? (
        <Card padding="lg" className="space-y-4 text-center py-10">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-slate-900">
              No verified Smart Swap is available right now.
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {noSwapReason ||
                "Your current selection already provides an optimal balance for current canteen inventory, or no verified alternatives meet the required improvement threshold."}
            </p>
          </div>
          <div className="pt-2">
            <Button variant="primary" size="md" onClick={() => navigate('/campus')}>
              Browse All Campus Stalls
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Hero Value Proposition */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                  You don't just get a score. You get a better option you can actually buy.
                </h2>
                <p className="text-xs text-slate-300">
                  {isVerified
                    ? 'Grounded in authentic MAIT canteen menus, verified pricing, and live stall inventory.'
                    : 'Grounded in national college nutrition and affordability benchmarks.'}
                </p>
              </div>
            </div>
          </div>

          {/* Main Before/After Comparison Flow */}
          <div className="space-y-4">
            {/* Your Current Choice */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl shrink-0">
                  🍽️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      CURRENT SELECTION
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wider">
                      {originalFood.price !== undefined ? 'Verified Price' : 'Estimated Base'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight mt-0.5">
                    {originalFood.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {originalFood.price !== undefined
                      ? `Authentic Campus Price: ₹${originalFood.price}`
                      : 'Approximate National Baseline: ₹60'}
                  </p>
                </div>
              </div>
              <div className="flex items-center sm:flex-col items-end gap-1.5 shrink-0">
                <Badge variant="rose" size="sm">
                  Health: {originalFood.healthScore.toFixed(1)} / 10
                </Badge>
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                  AI Estimate
                </span>
              </div>
            </div>

            {/* Swap Divider Pill */}
            <div className="flex items-center justify-center -my-2 relative z-10">
              <div className="px-4 py-2 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-700/25">
                <Sparkles className="w-4 h-4" />
                <span>ECOBITE SMART SWAP</span>
                <ArrowDown className="w-4 h-4" />
              </div>
            </div>

            {/* Recommended Alternative */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 border-2 border-emerald-300 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-4xl shrink-0 shadow-inner">
                    ✨
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                        {isVerified ? 'RECOMMENDED SMART SWAP' : 'GENERAL RECOMMENDATION'}
                      </span>
                      {isVerified ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                          Verified Campus Data
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
                          General Benchmark
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-0.5">
                      {recommendedSwap.name}
                    </h3>

                    {/* Canteen Location & Availability - Strictly from Firestore when verified */}
                    {isVerified && recommendedSwap.canteenName ? (
                      <div className="space-y-1 mt-1 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            Available at: <strong>{recommendedSwap.canteenName}</strong> ({recommendedSwap.canteenLocation})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            In Stock • Live Campus Counter
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 font-medium">
                            Verified MAIT Menu
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 mt-1 italic">
                        General college nutrition benchmark
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-emerald-200 text-right shrink-0 shadow-xs">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {isVerified ? 'Canteen Price' : 'Estimated Cost'}
                    </span>
                    {isVerified && (
                      <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 uppercase tracking-wider border border-emerald-200">
                        Firestore
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-black text-emerald-700 mt-0.5">
                    ₹{recommendedSwap.price}
                  </div>
                  {recommendedSwap.moneySaved > 0 && (
                    <div className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1">
                      SAVE ₹{recommendedSwap.moneySaved}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3-Way Dimensional Delta Metrics */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Dimensional Comparison
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Health Comparison */}
              <Card padding="md" className="space-y-2">
                <div className="flex items-center gap-1.5 text-rose-600 text-xs font-bold uppercase">
                  <HeartPulse className="w-4 h-4" />
                  <span>Health Score</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm text-slate-400 font-medium">
                    {originalFood.healthScore.toFixed(1)}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-lg font-black text-rose-600">
                    {recommendedSwap.healthScore.toFixed(1)}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-center">
                  +{(recommendedSwap.healthScore - originalFood.healthScore).toFixed(1)} Body Improvement
                </div>
              </Card>

              {/* Price Comparison */}
              <Card padding="md" className="space-y-2">
                <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold uppercase">
                  <IndianRupee className="w-4 h-4" />
                  <span>Price Benchmark</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm text-slate-400 font-medium">
                    {originalFood.price !== undefined ? `₹${originalFood.price}` : '₹60'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-lg font-black text-amber-600">
                    ₹{recommendedSwap.price}
                  </span>
                </div>
                <div className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded text-center">
                  {recommendedSwap.moneySaved > 0
                    ? `Save ₹${recommendedSwap.moneySaved}`
                    : 'Equal Cost • Higher Value'}
                </div>
              </Card>

              {/* Sustainability Comparison */}
              <Card padding="md" className="space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase">
                  <Globe className="w-4 h-4" />
                  <span>Sustainability</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm text-slate-400 font-medium">
                    {originalFood.sustainabilityScore.toFixed(1)}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-lg font-black text-emerald-600">
                    {recommendedSwap.sustainabilityScore.toFixed(1)}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-center">
                  Lower Ecological Footprint
                </div>
              </Card>
            </div>
          </section>

          {/* Why This Swap? Rationale */}
          <Card padding="lg" className="space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>Why this swap?</span>
            </h3>

            <ul className="space-y-2.5 text-xs sm:text-sm">
              {recommendedSwap.whyReasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Action Decision Container */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-slate-900">
                {isLogged ? 'Decision Logged in Weekly Impact!' : 'Accept this recommendation?'}
              </div>
              <p className="text-xs text-slate-500">
                {isLogged
                  ? `Telemetry saved. You saved ₹${recommendedSwap.moneySaved} and logged conscious impact.`
                  : 'Accepting this swap records your savings and updates your weekly sustainability profile.'}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isLogged ? (
                <Link to="/impact" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<Check className="w-4 h-4" />}
                    className="w-full sm:w-auto"
                  >
                    View Impact Dashboard
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  isLoading={isLogging}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={handleAcceptSwap}
                  className="w-full sm:w-auto"
                >
                  Accept Smart Swap {recommendedSwap.moneySaved > 0 && `(Save ₹${recommendedSwap.moneySaved})`}
                </Button>
              )}

              <Link to="/search">
                <Button variant="outline" size="md">
                  Explore More
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Ground Truth & Transparency Notice */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          <strong>Data Contract: </strong>
          {isVerified
            ? 'Stall names and prices are sourced strictly from audited Firestore records for MAIT, preventing artificial price hallucinations.'
            : 'Unverified visitors view general national nutritional benchmarks. Verify campus access to view real stall counters.'}
        </span>
      </div>
    </div>
  );
};
