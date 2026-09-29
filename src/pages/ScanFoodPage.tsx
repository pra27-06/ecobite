import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Upload, 
  Search, 
  Sparkles, 
  Info, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  HelpCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { aiService } from '../services/aiService';
import type { AIFoodAnalysisResult } from '../types';

export const ScanFoodPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingLabel, setAnalyzingLabel] = useState('Analyzing with EcoBite AI...');
  const [selectedDemoOption, setSelectedDemoOption] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active scan review state for medium/low confidence
  const [scanReviewResult, setScanReviewResult] = useState<{
    aiResult: AIFoodAnalysisResult;
    imagePreview: string;
  } | null>(null);

  const handleProcessFile = (file: File) => {
    setErrorMsg(null);
    setScanReviewResult(null);
    setIsAnalyzing(true);
    setAnalyzingLabel(`Processing ${file.name}...`);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setAnalyzingLabel('Evaluating nutrition & sustainability with Gemini Vision...');

      try {
        const resp = await aiService.analyzeImage(base64Data, file.name);
        setIsAnalyzing(false);

        if (resp.success && resp.data) {
          const aiResult = resp.data;

          // TIER 1: HIGH CONFIDENCE (score >= 0.8 and not uncertain)
          if (aiResult.confidence === 'high' && !aiResult.isUncertain) {
            navigate('/analysis', {
              state: {
                aiResult,
                imagePreview: base64Data,
              },
            });
            return;
          }

          // TIER 2 & 3: MEDIUM OR LOW CONFIDENCE
          // Show confirmation / candidate selection dialog before proceeding
          setScanReviewResult({
            aiResult,
            imagePreview: base64Data,
          });
        } else {
          setErrorMsg(resp.error || 'Failed to analyze uploaded image. Please try again.');
        }
      } catch (err: unknown) {
        setIsAnalyzing(false);
        const msg = err instanceof Error ? err.message : 'Analysis error occurred.';
        setErrorMsg(msg);
      }
    };

    reader.onerror = () => {
      setIsAnalyzing(false);
      setErrorMsg('Could not read file. Please select a valid image.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleSelectCandidate = async (confirmedFoodName: string) => {
    setIsAnalyzing(true);
    setAnalyzingLabel(`Loading verified analysis for "${confirmedFoodName}"...`);
    try {
      const resp = await aiService.analyzeFoodName(confirmedFoodName);
      setIsAnalyzing(false);
      if (resp.success && resp.data) {
        navigate('/analysis', {
          state: {
            aiResult: resp.data,
            imagePreview: scanReviewResult?.imagePreview,
          },
        });
      } else {
        navigate(`/analysis/${encodeURIComponent(confirmedFoodName)}`);
      }
    } catch {
      setIsAnalyzing(false);
      navigate(`/analysis/${encodeURIComponent(confirmedFoodName)}`);
    }
  };

  const handleDemoSample = async (sampleKey: string) => {
    setSelectedDemoOption(sampleKey);
    setErrorMsg(null);
    setScanReviewResult(null);
    setIsAnalyzing(true);

    let queryName = sampleKey;
    if (sampleKey === 'uncertain-item') {
      queryName = 'obscure ambiguous food blob';
      setAnalyzingLabel('Analyzing obscure test sample for uncertainty handling...');
    } else {
      setAnalyzingLabel(`Running AI food analysis for ${sampleKey.replace('-', ' ')}...`);
    }

    try {
      const resp = await aiService.analyzeFoodName(queryName);
      setIsAnalyzing(false);

      if (resp.success && resp.data) {
        if (resp.data.confidence === 'high' && !resp.data.isUncertain) {
          navigate('/analysis', {
            state: {
              aiResult: resp.data,
            },
          });
        } else {
          // Low or medium confidence demonstration
          setScanReviewResult({
            aiResult: resp.data,
            imagePreview: '',
          });
        }
      } else {
        setErrorMsg(resp.error || 'Failed to analyze sample.');
      }
    } catch {
      setIsAnalyzing(false);
      navigate(`/analysis/${sampleKey}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <PageHeader
        title="Scan Food"
        description="Take a photo of your food or canteen tray to evaluate its health, affordability, and environmental footprint."
        badge={
          <Badge variant="blue" size="md">
            Gemini Vision Multimodal
          </Badge>
        }
        showBackButton
      />

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* CONFIRMATION / FALLBACK REVIEW CARD (TIER 2 & 3) */}
      {scanReviewResult && (
        <Card padding="lg" className="border-2 border-amber-300 bg-amber-50/40 space-y-6 animate-fadeIn">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {scanReviewResult.aiResult.confidence === 'low' || scanReviewResult.aiResult.isUncertain
                    ? "We couldn't confidently identify this food"
                    : 'Please confirm this food item'}
                </h3>
                <Badge variant={scanReviewResult.aiResult.confidence === 'low' ? 'rose' : 'amber'} size="sm">
                  {scanReviewResult.aiResult.confidence.toUpperCase()} CONFIDENCE
                </Badge>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {scanReviewResult.aiResult.confidence === 'low' || scanReviewResult.aiResult.isUncertain
                  ? 'The vision model cannot guarantee a 100% accurate match for this image. To prevent fake health metrics, please confirm the food below or use manual search.'
                  : `The AI estimated this dish as "${scanReviewResult.aiResult.foodName}". Please confirm or select the correct food candidate:`}
              </p>
            </div>
          </div>

          {/* Likely Candidate Chips */}
          <div className="space-y-3 pt-2 border-t border-amber-200/60">
            <span className="text-xs font-semibold text-slate-700 block">
              Suggested Campus Candidates:
            </span>
            <div className="flex flex-wrap gap-2">
              {/* Primary Inferred Food */}
              {scanReviewResult.aiResult.foodName && scanReviewResult.aiResult.foodName !== 'Unidentified Item' && (
                <button
                  type="button"
                  onClick={() => handleSelectCandidate(scanReviewResult.aiResult.foodName)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-50 hover:border-emerald-500 transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{scanReviewResult.aiResult.foodName} (Suggested)</span>
                </button>
              )}

              {/* Dynamic Alternatives */}
              {(scanReviewResult.aiResult.possibleAlternatives || ['Pasta', 'Chole Bhature', 'Paneer Sandwich']).map(
                (candidate) => (
                  <button
                    key={candidate}
                    type="button"
                    onClick={() => handleSelectCandidate(candidate)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:border-slate-400 hover:bg-slate-50 transition-all shadow-2xs"
                  >
                    {candidate}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-amber-200/60">
            <Link
              to="/search"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs"
            >
              <Search className="w-4 h-4" />
              <span>Search Food Manually</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setScanReviewResult(null);
                fileInputRef.current?.click();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retake / Upload Another Image</span>
            </button>
          </div>
        </Card>
      )}

      {/* Main Scan & Upload Box */}
      {!scanReviewResult && (
        <div className="relative rounded-3xl border-2 border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center space-y-6 shadow-xs">
          {isAnalyzing ? (
            <div className="py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">{analyzingLabel}</h3>
                <p className="text-xs text-slate-500">
                  Evaluating Body, Wallet, and Planet dimensions...
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-inner">
                <Camera className="w-10 h-10" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Scan or Upload Your Meal
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Snap your plate, canteen snack, or packaged food to trigger multidimensional nutrition, cost, and carbon analysis.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Camera className="w-5 h-5" />}
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full sm:w-auto"
                >
                  Open Camera
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<Upload className="w-5 h-5" />}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto"
                >
                  Upload Image
                </Button>
              </div>

              {/* Alternative Search CTA */}
              <div className="pt-2">
                <Link
                  to="/search"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Or Search by Food Name Instead</span>
                </Link>
              </div>
            </>
          )}

          {/* Technical Safety Notice */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5" />
            <span>Multimodal processing with client privacy protection. No medical claims or diagnosis.</span>
          </div>
        </div>
      )}

      {/* Quick Interactive Demo Samples for Hackathon Evaluators */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Try Test Meal Scans
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Instant AI evaluation</span>
        </div>

        <p className="text-xs text-slate-500">
          Click any of these verified samples to test immediate AI analysis and low-confidence handling:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={() => handleDemoSample('chole-bhature')}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group ${
              selectedDemoOption === 'chole-bhature'
                ? 'bg-emerald-50 border-emerald-400'
                : 'bg-slate-50/70 border-slate-200 hover:border-emerald-300 hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🍛</span>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                  Chole Bhature
                </div>
                <div className="text-[10px] text-slate-400">Heavy calorie lunch meal (MEAL)</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            disabled={isAnalyzing}
            onClick={() => handleDemoSample('paneer-sandwich')}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group ${
              selectedDemoOption === 'paneer-sandwich'
                ? 'bg-emerald-50 border-emerald-400'
                : 'bg-slate-50/70 border-slate-200 hover:border-emerald-300 hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🥪</span>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                  Paneer Sandwich
                </div>
                <div className="text-[10px] text-slate-400">High-protein student meal (MEAL)</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            disabled={isAnalyzing}
            onClick={() => handleDemoSample('pasta')}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group ${
              selectedDemoOption === 'pasta'
                ? 'bg-emerald-50 border-emerald-400'
                : 'bg-slate-50/70 border-slate-200 hover:border-emerald-300 hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🍝</span>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                  Pasta (Food Mast Counter)
                </div>
                <div className="text-[10px] text-slate-400">Campus penne pasta (MEAL)</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            disabled={isAnalyzing}
            onClick={() => handleDemoSample('uncertain-item')}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group ${
              selectedDemoOption === 'uncertain-item'
                ? 'bg-amber-50 border-amber-400'
                : 'bg-slate-50/70 border-slate-200 hover:border-amber-300 hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">❓</span>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-amber-700">
                  Obscure Meal (Test Uncertainty)
                </div>
                <div className="text-[10px] text-slate-400">Tests 3-tier confidence & fallback</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </Card>

      {/* Safety & Ground Truth Rule */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <span>
          <strong>Ethical AI Guardrail: </strong>EcoBite never estimates laboratory values or invents campus prices. AI estimates food composition; Firestore supplies verified ground-truth prices.
        </span>
      </div>
    </div>
  );
};
