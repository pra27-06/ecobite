import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'amber' | 'blue' | 'slate' | 'rose' | 'purple';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span>{children}</span>
    </span>
  );
};
