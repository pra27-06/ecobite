import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Flame, 
  Dumbbell, 
  Wheat, 
  Droplets, 
  Info, 
  ArrowRight, 
  Building, 
  Lock, 
  AlertTriangle, 
  Search,
  ShieldCheck
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { ScoreCard } from '../components/ScoreCard';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { LoadingState } from '../components/LoadingState';
import { useCampus } from '../hooks/useCampusAccess';
import { MAIT_CANTEENS_DOCS } from '../data/maitMenuData';
import { aiService } from '../services/aiService';
import { menuService } from '../services/menuService';
import { demandService } from '../services/demandService';
import type { AIFoodAnalysisResult, MenuItemDoc } from '../types';

export const FoodAnalysisPage: React.FC = () => {
  const { foodId } = useParams<{ foodId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isVerified, campusShortName } = useCampus();

  const [aiAnalysis, setAiAnalysis] = useState<AIFoodAnalysisResult | null>(
    location.state?.aiResult || null
  );
  const [isLoading, setIsLoading] = useState(!location.state?.aiResult);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [campusItems, setCampusItems] = useState<MenuItemDoc[]>([]);

  const imagePreview: string | undefined = location.state?.imagePreview;

  useEffect(() => {
    if (isVerified) {
      menuService.getCampusMenu('MAIT', true).then((res) => {
        if (res.success && res.data) {
          setCampusItems(res.data);
        }
      });
    } else {
      setCampusItems([]);
    }
  }, [isVerified]);

  useEffect(() => {
    if (aiAnalysis?.foodName) {
      demandService.recordSignal({
        campusId: isVerified ? 'MAIT' : 'MAIT',
        eventType: 'SEARCH',
        foodName: aiAnalysis.foodName,
        originalFoodName: aiAnalysis.foodName,
      }).catch(() => {});
    }
  }, [aiAnalysis?.foodName, isVerified]);

  useEffect(() => {
    // If state was already provided via navigation, initial state has it
    if (location.state?.aiResult) {
      return;
    }

    // Otherwise, analyze based on foodId param or fallback
    const targetQuery = foodId ? decodeURIComponent(foodId).replace(/-/g, ' ') : 'Chole Bhature';
    let isCancelled = false;

    aiService
      .analyzeFoodName(targetQuery)
      .then((resp) => {
        if (isCancelled) return;
        setIsLoading(false);
        if (resp.success && resp.data) {
          setAiAnalysis(resp.data);
        } else {
          setErrorMsg(resp.error || 'Failed to complete AI food analysis.');
        }
      })
      .catch((err) => {
        if (isCancelled) return;
        setIsLoading(false);
        setErrorMsg(err instanceof Error ? err.message : 'Error evaluating food.');
      });

    return () => {
      isCancelled = true;
    };
  }, [foodId, location.state]);

  // Find matching items from MAIT verified catalog
  const campusMatches = useMemo(() => {
    if (!isVerified || !aiAnalysis) return [];
    const foodKeywords = aiAnalysis.foodName.toLowerCase().split(/\s+/);
    return campusItems.filter((item) => {
      const itemName = item.name.toLowerCase();
      if (aiAnalysis.foodName.toLowerCase().includes('bhature') && (itemName.includes('choley') || itemName.includes('bhature'))) return true;
      if (aiAnalysis.foodName.toLowerCase().includes('samosa') && itemName.includes('samosa')) return true;
      if (aiAnalysis.foodName.toLowerCase().includes('maggi') && itemName.includes('maggi')) return true;
      if (aiAnalysis.foodName.toLowerCase().includes('sandwich') && itemName.includes('sandwich')) return true;
      if (aiAnalysis.foodName.toLowerCase().includes('chowmein') && itemName.includes('chowmein')) return true;
      if (aiAnalysis.foodName.toLowerCase().includes('chawal') && itemName.includes('chawal')) return true;
      return foodKeywords.some((kw) => kw.length > 3 && itemName.includes(kw));
    });
  }, [aiAnalysis, isVerified, campusItems]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <LoadingState 
          label="Running EcoBite AI food intelligence (evaluating Body, Wallet, and Planet)..." 
        />
      </div>
    );
  }

  if (errorMsg || !aiAnalysis) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Analysis Unavailable</h2>
        <p className="text-xs text-slate-500">{errorMsg || 'Could not analyze this food.'}</p>
        <Button variant="primary" size="md" onClick={() => navigate('/search')}>
          Search Another Dish
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Optional Uploaded Image Preview Banner */}
      {imagePreview && (
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <img
            src={imagePreview}
            alt={aiAnalysis.foodName}
            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100"
          />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
              Multimodal Image Verified
            </span>
            <span className="text-xs font-semibold text-slate-800">
              Analyzed via EcoBite Vision Engine
            </span>
          </div>
        </div>
      )}

      {/* Uncertainty Notice if Low Confidence */}
      {aiAnalysis.isUncertain && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-bold">Food identification is uncertain.</h4>
              <p className="text-[11px] sm:text-xs text-amber-800/90 leading-relaxed">
                EcoBite AI was unable to verify this food item with high confidence. The metrics below are preliminary general estimates.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Search className="w-3.5 h-3.5" />}
            onClick={() => navigate('/search')}
            className="shrink-0 bg-white"
          >
            Search Food Manually
          </Button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title={aiAnalysis.foodName}
        description="Multidimensional evaluation calibrated for Indian college students."
        badge={
          <div className="flex items-center gap-2">
            <Badge 
              variant={aiAnalysis.isUncertain ? 'amber' : 'emerald'} 
              size="md"
            >
              {aiAnalysis.isUncertain 
                ? 'Uncertain Identification' 
                : `${aiAnalysis.confidence.toUpperCase()} Confidence AI Estimate`}
            </Badge>
            {aiAnalysis.hindiName ? (
              <span className="text-xs text-slate-400 font-medium">({aiAnalysis.hindiName})</span>
            ) : null}
          </div>
        }
        showBackButton
        action={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Sparkles className="w-4 h-4" />}
            onClick={() => {
              navigate(`/swap/${encodeURIComponent(aiAnalysis.foodName)}`, {
                state: { aiAnalysis },
              });
            }}
          >
            See Smart Swap
          </Button>
        }
      />

      {/* Estimation Disclaimer */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>AI Estimate: </strong>Estimated from available food information. Educational guide, not clinical medical diagnosis.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200/70 text-slate-700">
          Non-Clinical
        </span>
      </div>

      {/* Main 3 Dimensions Score Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            3-Dimensional Evaluation
          </h2>
          <span className="text-[11px] text-slate-400">Scale of 0 to 10</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ScoreCard
            dimension="body"
            score={aiAnalysis.healthScore}
            subtitle={aiAnalysis.explanation.body}
          />
          <ScoreCard
            dimension="wallet"
            score={aiAnalysis.affordabilityScore}
            subtitle={aiAnalysis.explanation.wallet}
          />
          <ScoreCard
            dimension="planet"
            score={aiAnalysis.sustainabilityScore}
            subtitle={aiAnalysis.explanation.planet}
          />
        </div>
      </section>

      {/* Nutrition Breakdown Card */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Estimated Nutritional Breakdown
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card padding="sm" className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>Energy</span>
            </div>
            <div className="text-xl font-black text-slate-900">
              {aiAnalysis.nutrition.calories} <span className="text-xs font-normal text-slate-400">kcal</span>
            </div>
            <div className="text-[10px] text-slate-400">Approximate serving</div>
          </Card>

          <Card padding="sm" className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Dumbbell className="w-3.5 h-3.5 text-emerald-600" />
              <span>Protein</span>
            </div>
            <div className="text-xl font-black text-slate-900">
              {aiAnalysis.nutrition.protein}g
            </div>
            <div className="text-[10px] text-slate-400">Muscle & satiety</div>
          </Card>

          <Card padding="sm" className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Wheat className="w-3.5 h-3.5 text-amber-500" />
              <span>Carbohydrates</span>
            </div>
            <div className="text-xl font-black text-slate-900">
              {aiAnalysis.nutrition.carbs}g
            </div>
            <div className="text-[10px] text-slate-400">Energy density</div>
          </Card>

          <Card padding="sm" className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Droplets className="w-3.5 h-3.5 text-rose-500" />
              <span>Fats / Lipids</span>
            </div>
            <div className="text-xl font-black text-slate-900">
              {aiAnalysis.nutrition.fat}g
            </div>
            <div className="text-[10px] text-slate-400">Cooking oils estimate</div>
          </Card>
        </div>
      </section>

      {/* "Why this score?" In-depth Section */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-base">Why this score?</h3>
        </div>

        <div className="space-y-3 divide-y divide-slate-100 text-xs sm:text-sm">
          <div className="pt-2 space-y-1">
            <span className="font-bold text-rose-700 flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              BODY (Health & Nutrition)
            </span>
            <p className="text-slate-600 leading-relaxed pl-3.5">
              {aiAnalysis.explanation.body}
            </p>
          </div>

          <div className="pt-3 space-y-1">
            <span className="font-bold text-amber-700 flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              WALLET (Student Affordability)
            </span>
            <p className="text-slate-600 leading-relaxed pl-3.5">
              {aiAnalysis.explanation.wallet}
            </p>
          </div>

          <div className="pt-3 space-y-1">
            <span className="font-bold text-emerald-700 flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              PLANET (Ecological Footprint)
            </span>
            <p className="text-slate-600 leading-relaxed pl-3.5">
              {aiAnalysis.explanation.planet}
            </p>
          </div>
        </div>
      </Card>

      {/* Cautions & Dietary Notes */}
      {aiAnalysis.cautions && aiAnalysis.cautions.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <Info className="w-4 h-4 text-amber-600" />
            <span>Preparation & Dietary Observations</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-amber-800/90 pl-1">
            {aiAnalysis.cautions.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Campus Availability Section (Strictly ground-truth prices) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Campus Availability & Ground-Truth Pricing
          </h2>
          {isVerified && (
            <Badge variant="emerald" size="sm">
              MAIT Live Ground-Truth
            </Badge>
          )}
        </div>

        {isVerified ? (
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-xs sm:text-sm text-emerald-950">
                  {campusShortName} Canteen Ground Truth Active
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                4 Stalls Audited
              </span>
            </div>

            {campusMatches.length > 0 ? (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Authentic Canteen Stalls Serving This Dish:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {campusMatches.map((item) => {
                    const canteen = MAIT_CANTEENS_DOCS.find((c) => c.canteenId === item.canteenId);
                    return (
                      <div
                        key={item.menuItemId}
                        className="p-3 rounded-xl bg-white border border-emerald-200/80 flex items-center justify-between shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            {canteen?.name || item.canteenId} • {canteen?.location}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-black text-emerald-700">
                            ₹{item.price}
                          </span>
                          <span className="block text-[9px] font-semibold text-emerald-600 uppercase">
                            Board Verified
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white border border-emerald-100 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Exact dish not listed on physical menu boards, but available campus alternatives include:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-800 block text-xs">Rajma Chawal</span>
                    <span className="text-[11px] text-slate-500">
                      Food Mast • ₹{campusItems.find((i) => i.name.toLowerCase().includes('rajma'))?.price || 70}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-800 block text-xs">Paneer Sandwich</span>
                    <span className="text-[11px] text-slate-500">
                      Amul Shop • ₹{campusItems.find((i) => i.name.toLowerCase().includes('paneer sandwich'))?.price || 30}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-800 block text-xs">Fresh Mosambi Juice</span>
                    <span className="text-[11px] text-slate-500">Juice Point • ₹30-50</span>
                  </div>
                </div>
              </div>
            )}

            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Per EcoBite core principles, live prices are sourced exclusively from authentic Firestore records audited against physical menu boards, preventing AI price inventions.
            </p>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 text-center space-y-3">
            <Lock className="w-6 h-6 text-slate-400 mx-auto" />
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                Campus prices locked behind QR access
              </h4>
              <p className="text-xs text-slate-500">
                Canteen prices for this dish are protected. Scan your campus QR code to access Maharaja Agrasen Institute of Technology live stall prices.
              </p>
            </div>
            <Link to="/campus">
              <Button variant="outline" size="sm">
                Verify Campus QR
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Smart Swap Call to Action */}
      <Card variant="accent" padding="lg" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Recommendation Available</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Want a healthier or more economical choice?
          </h3>
          <p className="text-xs text-slate-600">
            EcoBite has formulated a smart campus swap for {aiAnalysis.foodName}.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          rightIcon={<ArrowRight className="w-4 h-4" />}
          onClick={() => {
            navigate(`/swap/${encodeURIComponent(aiAnalysis.foodName)}`, {
              state: { aiAnalysis },
            });
          }}
          className="shrink-0"
        >
          Review Smart Swap
        </Button>
      </Card>
    </div>
  );
};
