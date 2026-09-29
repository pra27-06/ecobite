import React from 'react';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-250 bg-white/60 space-y-4 max-w-md mx-auto ${className}`}>
      <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-slate-900 text-base">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
};
