import React from 'react';
import { HeartPulse, Wallet, Globe } from 'lucide-react';

export type DimensionType = 'body' | 'wallet' | 'planet';

export interface ScoreCardProps {
  dimension: DimensionType;
  score: number; // 0 - 10
  subtitle?: string;
  className?: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  dimension,
  score,
  subtitle,
  className = '',
}) => {
  const configs = {
    body: {
      label: 'BODY',
      title: 'Health',
      icon: HeartPulse,
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-150',
      barColor: 'bg-rose-500',
    },
    wallet: {
      label: 'WALLET',
      title: 'Affordability',
      icon: Wallet,
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-150',
      barColor: 'bg-amber-500',
    },
    planet: {
      label: 'PLANET',
      title: 'Sustainability',
      icon: Globe,
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-150',
      barColor: 'bg-emerald-500',
    },
  };

  const config = configs[dimension];
  const Icon = config.icon;
  const percentage = Math.min(Math.max((score / 10) * 100, 0), 100);

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border bg-white shadow-xs flex flex-col justify-between space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl ${config.bgColor} ${config.textColor} flex items-center justify-center shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {config.label}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wider">
                AI Estimate
              </span>
            </div>
            <div className="text-sm font-bold text-slate-800 leading-tight">
              {config.title}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xl sm:text-2xl font-black text-slate-900">{score.toFixed(1)}</span>
          <span className="text-xs text-slate-400 font-semibold"> / 10</span>
        </div>
      </div>

      {/* Visual Meter Bar */}
      <div className="space-y-1">
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${config.barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {subtitle ? (
          <p className="text-[11px] text-slate-500 leading-tight pt-1">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
};
