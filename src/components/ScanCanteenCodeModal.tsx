import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  QrCode, 
  CheckCircle2, 
  Store, 
  Sparkles, 
  Camera, 
  Upload, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { useCampus } from '../hooks/useCampusAccess';

export interface ScanCanteenCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (campusCode: string) => void;
}

export const ScanCanteenCodeModal: React.FC<ScanCanteenCodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { verifyCampus, isVerified, campusShortName } = useCampus();
  
  const [activeTab, setActiveTab] = useState<'scan' | 'code'>('scan');
  const [inputCode, setInputCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleVerifyCode = (codeToVerify: string) => {
    setErrorMsg(null);
    const trimmed = codeToVerify.trim().toUpperCase();
    if (!trimmed) {
      setErrorMsg('Please enter a canteen or campus code.');
      return;
    }

    // Extract campus identifier from full link or code
    let resolvedCode = trimmed;
    if (trimmed.includes('CAMPUS=')) {
      const match = trimmed.match(/CAMPUS=([A-Z0-9_-]+)/i);
      if (match && match[1]) {
        resolvedCode = match[1].toUpperCase();
      }
    } else if (trimmed.includes('QR=')) {
      const match = trimmed.match(/QR=([A-Z0-9_-]+)/i);
      if (match && match[1]) {
        resolvedCode = match[1].split('-')[0].toUpperCase();
      }
    } else if (trimmed.includes('-')) {
      resolvedCode = trimmed.split('-')[0].toUpperCase();
    }

    verifyCampus(resolvedCode);
    setVerifiedSuccess(resolvedCode);

    if (onSuccess) {
      onSuccess(resolvedCode);
    }
  };

  const handleSimulateScan = (preset = 'MAIT') => {
    setIsScanning(true);
    setErrorMsg(null);
    setTimeout(() => {
      setIsScanning(false);
      handleVerifyCode(preset);
    }, 900);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setErrorMsg(null);

    // Simulate instant QR decoding from uploaded image
    setTimeout(() => {
      setIsScanning(false);
      handleVerifyCode('MAIT');
    }, 800);
  };

  const handleDone = () => {
    setVerifiedSuccess(null);
    setInputCode('');
    onClose();
    navigate('/campus');
  };

  const handleClose = () => {
    setVerifiedSuccess(null);
    setInputCode('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {verifiedSuccess ? (
          /* Success Screen */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <Badge variant="emerald" size="md">
                Canteen Code Verified
              </Badge>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                {verifiedSuccess} Campus Canteen Connected!
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Live stall prices, authentic menu items, and preparation pre-order queues are now active.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-left text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Verified Campus:</span>
                <span className="font-mono text-emerald-800 font-extrabold">{verifiedSuccess}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Active Stalls:</span>
                <span>Amul Shop, Food Mast, Juice Counter</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Ground Truth:</span>
                <span>Firestore Cloud Catalog</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                onClick={handleDone}
              >
                Browse Verified Canteen Menu
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-slate-600"
                onClick={handleClose}
              >
                Stay on Dashboard
              </Button>
            </div>
          </div>
        ) : (
          /* Main Scan / Code Entry Modal */
          <div className="space-y-5">
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                  <QrCode className="w-3 h-3 text-emerald-700" />
                  Campus Access
                </span>
                {isVerified && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active: {campusShortName}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Scan Canteen Code
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Scan the counter QR or enter your campus canteen code to access live menu items, verified prices, and pre-orders.
              </p>
            </div>

            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('scan')}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'scan'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan Counter QR</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'code'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Enter Code / Link</span>
              </button>
            </div>

            {activeTab === 'scan' ? (
              /* TAB 1: SCANNER VIEW */
              <div className="space-y-4">
                {/* Visual Viewfinder Box */}
                <div className="relative rounded-2xl bg-slate-900 p-6 text-center text-white overflow-hidden shadow-inner flex flex-col items-center justify-center min-h-[200px]">
                  {/* Background Grid Pattern */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* Corner Targets */}
                  <div className="w-40 h-40 border-2 border-emerald-400/80 rounded-2xl relative flex items-center justify-center">
                    {/* Laser Scanner Animation */}
                    <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#10b981] animate-bounce" />

                    <div className="text-center space-y-1 z-10">
                      <QrCode className="w-12 h-12 text-emerald-400/90 mx-auto animate-pulse" />
                      <span className="text-[11px] font-mono text-emerald-200 block">
                        Point at Counter QR
                      </span>
                    </div>
                  </div>

                  {isScanning && (
                    <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20">
                      <div className="w-7 h-7 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold text-emerald-300">
                        Scanning Canteen Counter QR...
                      </span>
                    </div>
                  )}
                </div>

                {/* Scan Action Controls */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<Camera className="w-4 h-4" />}
                    onClick={() => handleSimulateScan('MAIT')}
                    disabled={isScanning}
                    className="justify-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                  >
                    Scan Counter QR
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    leftIcon={<Upload className="w-4 h-4" />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isScanning}
                    className="justify-center text-xs font-bold"
                  >
                    Upload QR Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            ) : (
              /* TAB 2: CODE ENTRY VIEW */
              <div className="space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleVerifyCode(inputCode);
                  }}
                  className="space-y-3"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Canteen Access Code or URL:
                    </label>
                    <input
                      type="text"
                      value={inputCode}
                      placeholder="e.g. MAIT or paste canteen link"
                      onChange={(e) => setInputCode(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                  >
                    Connect to Canteen
                  </Button>
                </form>
              </div>
            )}

            {/* Quick 1-Click Verification Presets */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Instant Demo Campuses:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleVerifyCode('MAIT')}
                  className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-emerald-950 font-mono">MAIT</span>
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">Amul &amp; Food Mast</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleVerifyCode('DTU')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900 font-mono">DTU</span>
                    <Store className="w-3 h-3 text-slate-400" />
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Campus Dining Hall</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
