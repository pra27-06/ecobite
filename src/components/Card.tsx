import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'muted' | 'accent' | 'highlight';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  padding = 'md',
  variant = 'default',
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const variantStyles = {
    default: 'bg-white border-slate-200 shadow-xs',
    muted: 'bg-slate-50/70 border-slate-200/80',
    accent: 'bg-gradient-to-br from-emerald-50/70 to-white border-emerald-200/80 shadow-xs',
    highlight: 'bg-amber-50/60 border-amber-200/80',
  };

  return (
    <div
      className={`rounded-2xl border ${variantStyles[variant]} ${paddingStyles[padding]} ${
        hoverable ? 'transition-all duration-200 hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
