import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, ChevronRight } from 'lucide-react';
import { useCampus } from '../hooks/useCampusAccess';

export interface CampusStatusProps {
  compact?: boolean;
  onOpenScanModal?: () => void;
}

export const CampusStatus: React.FC<CampusStatusProps> = ({ compact = false, onOpenScanModal }) => {
  const { isVerified } = useCampus();

  if (compact) {
    return (
      <Link
        to="/campus"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
          isVerified
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
        }`}
      >
        {isVerified ? (
          <>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>MAIT Campus — Verified</span>
          </>
        ) : (
          <>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>General Mode</span>
          </>
        )}
      </Link>
    );
  }

  return (
    <div
      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isVerified
          ? 'bg-gradient-to-r from-emerald-50/80 via-white to-white border-emerald-200'
          : 'bg-gradient-to-r from-amber-50/80 via-white to-white border-amber-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {isVerified ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isVerified ? 'text-emerald-700' : 'text-amber-800'
              }`}
            >
              {isVerified ? 'MAIT Campus — Verified' : 'General Mode — Nationwide Access'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-600 font-medium">
              {isVerified ? 'Active Session' : 'Unrestricted'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isVerified
              ? 'Campus-specific canteen menus and verified stall prices are active.'
              : 'Public food intelligence active. Scan or enter your canteen code to unlock live prices.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onOpenScanModal && (
          <button
            type="button"
            onClick={onOpenScanModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
          >
            <span>Scan Canteen Code</span>
          </button>
        )}

        <Link
          to="/campus"
          className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
            isVerified
              ? 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <span>{isVerified ? 'Manage' : 'Campus Menu'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
