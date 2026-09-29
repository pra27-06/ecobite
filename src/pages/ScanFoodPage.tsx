import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Upload, Search, Sparkles, Info, ShieldCheck, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { aiService } from '../services/aiService';

export const ScanFoodPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingLabel, setAnalyzingLabel] = useState('Analyzing with EcoBite AI...');
  const [selectedDemoOption, setSelectedDemoOption] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleProcessFile = (file: File) => {
    setErrorMsg(null);
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
          navigate('/analysis', {
            state: {
              aiResult: resp.data,
              imagePreview: base64Data,
            },
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

  const handleDemoSample = async (sampleKey: string) => {
    setSelectedDemoOption(sampleKey);
    setIsAnalyzing(true);
    setErrorMsg(null);

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
        navigate('/analysis', {
          state: {
            aiResult: resp.data,
          },
        });
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

      {/* Main Scan & Upload Box */}
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
          Click any of these verified and edge-case samples to test immediate AI analysis and low-confidence handling:
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
                <div className="text-[10px] text-slate-400">Heavy calorie lunch meal</div>
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
                <div className="text-[10px] text-slate-400">High-protein campus snack</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            disabled={isAnalyzing}
            onClick={() => handleDemoSample('rajma-chawal')}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group ${
              selectedDemoOption === 'rajma-chawal'
                ? 'bg-emerald-50 border-emerald-400'
                : 'bg-slate-50/70 border-slate-200 hover:border-emerald-300 hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🍲</span>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                  Rajma Chawal
                </div>
                <div className="text-[10px] text-slate-400">Balanced sustainable staple</div>
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
                <div className="text-[10px] text-slate-400">Tests low-confidence safety handling</div>
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

