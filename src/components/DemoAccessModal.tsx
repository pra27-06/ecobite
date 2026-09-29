import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Sparkles, 
  Store, 
  UserCheck, 
  ShieldCheck, 
  Copy,
  Check
} from 'lucide-react';
import { Badge } from './Badge';
import { useCampus } from '../hooks/useCampusAccess';

interface DemoAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoAccessModal: React.FC<DemoAccessModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { verifyCampus } = useCampus();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const demoStudentUrl = `${window.location.origin}${import.meta.env.BASE_URL}campus?demo=student&campus=mait`;

  const handleLaunchStudentDemo = () => {
    verifyCampus('mait');
    onClose();
    navigate('/campus');
  };

  const handleLaunchOwnerDemo = () => {
    onClose();
    navigate('/owner');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(demoStudentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Judge & Evaluator Demo Mode
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            EcoBite AI Interactive Demo
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Select a demo experience or copy/open the demo link with a secondary phone or laptop for evaluation.
          </p>
        </div>

        {/* Demo QR Box (Safe Token Link) */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          {/* Safe SVG QR Illustration */}
          <div className="w-28 h-28 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs shrink-0 flex flex-col items-center justify-center relative group">
            {/* Clean SVG visual QR representation */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full text-slate-900"
              fill="currentColor"
            >
              {/* Corner position squares */}
              <rect x="10" y="10" width="24" height="24" rx="3" fill="#0f172a" />
              <rect x="14" y="14" width="16" height="16" rx="2" fill="#ffffff" />
              <rect x="18" y="18" width="8" height="8" rx="1" fill="#059669" />

              <rect x="66" y="10" width="24" height="24" rx="3" fill="#0f172a" />
              <rect x="70" y="14" width="16" height="16" rx="2" fill="#ffffff" />
              <rect x="74" y="18" width="8" height="8" rx="1" fill="#059669" />

              <rect x="10" y="66" width="24" height="24" rx="3" fill="#0f172a" />
              <rect x="14" y="70" width="16" height="16" rx="2" fill="#ffffff" />
              <rect x="18" y="74" width="8" height="8" rx="1" fill="#059669" />

              {/* Data matrix dots */}
              <rect x="42" y="12" width="6" height="6" rx="1" fill="#0f172a" />
              <rect x="52" y="12" width="6" height="6" rx="1" fill="#0f172a" />
              <rect x="42" y="24" width="6" height="6" rx="1" fill="#059669" />
              <rect x="52" y="24" width="6" height="6" rx="1" fill="#0f172a" />

              <rect x="42" y="42" width="16" height="16" rx="2" fill="#059669" />
              <rect x="12" y="44" width="6" height="6" rx="1" fill="#0f172a" />
              <rect x="24" y="44" width="6" height="6" rx="1" fill="#0f172a" />
              <rect x="68" y="44" width="6" height="6" rx="1" fill="#0f172a" />
              <rect x="80" y="44" width="6" height="6" rx="1" fill="#0f172a" />

              <rect x="42" y="68" width="6" height="6" rx="1" fill="#0f172a" />
              <rect x="52" y="68" width="6" height="6" rx="1" fill="#0f172a" />
              <rect x="42" y="80" width="6" height="6" rx="1" fill="#0f172a" />
              <rect x="52" y="80" width="6" height="6" rx="1" fill="#059669" />
              <rect x="70" y="70" width="18" height="18" rx="2" fill="#0f172a" />
            </svg>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter mt-1">
              DEMO PASS
            </span>
          </div>

          <div className="space-y-1.5 flex-1 text-left">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>MAIT Student Demo Token</span>
              <Badge variant="blue" size="sm">SAFE TOKEN</Badge>
            </div>
            <p className="text-[11px] text-slate-500">
              Scan from your mobile phone camera to open EcoBite Student view on your personal device. Contains no database secrets or private records.
            </p>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors pt-0.5"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Link Copied!' : 'Copy Direct Demo Link'}</span>
            </button>
          </div>
        </div>

        {/* Two-Screen Presentation Roles */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
            Choose Your Presentation Experience:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option 1: Student Demo */}
            <button
              type="button"
              onClick={handleLaunchStudentDemo}
              className="p-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-left transition-all space-y-2 group shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <Badge variant="emerald" size="sm">DEVICE 1</Badge>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800">
                  Student Demo
                </h4>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                  Verified MAIT student view: Food scan, Smart Swaps, verified menus &amp; savings.
                </p>
              </div>
            </button>

            {/* Option 2: Canteen Owner Demo */}
            <button
              type="button"
              onClick={handleLaunchOwnerDemo}
              className="p-4 rounded-2xl border-2 border-slate-300 bg-slate-50 hover:bg-slate-100 text-left transition-all space-y-2 group shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <Badge variant="slate" size="sm">DEVICE 2</Badge>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-slate-700">
                  Canteen Owner Demo
                </h4>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                  B2B Intelligence: Student demand trends, waste insights &amp; menu actions.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Security & Data Boundary Disclaimer */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Demo sessions are isolated from live production database administration.</span>
        </div>
      </div>
    </div>
  );
};
