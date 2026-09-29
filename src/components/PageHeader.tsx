import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  showBackButton?: boolean;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  showBackButton = false,
  action,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          {showBackButton ? (
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : null}

          {badge ? <div>{badge}</div> : null}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h1>

        {description ? (
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
};
