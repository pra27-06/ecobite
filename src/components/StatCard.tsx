import React from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'blue' | 'slate';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  variant = 'emerald',
  className = '',
}) => {
  const variantStyles = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200/70',
      iconBg: 'bg-emerald-100/80 text-emerald-800',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200/70',
      iconBg: 'bg-amber-100/80 text-amber-900',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200/70',
      iconBg: 'bg-blue-100/80 text-blue-800',
    },
    slate: {
      bg: 'bg-slate-50',
      text: 'text-slate-800',
      border: 'border-slate-200',
      iconBg: 'bg-slate-200/80 text-slate-800',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className={`p-5 rounded-2xl border bg-white shadow-xs space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-xl ${style.iconBg} flex items-center justify-center`}>
          {icon}
        </div>
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {value}
        </div>
        {subtext ? (
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">{subtext}</p>
        ) : null}
      </div>
    </div>
  );
};
