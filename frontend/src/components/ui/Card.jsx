import React from 'react';
import { clsx } from 'clsx';

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border border-slate-200/80 clinical-shadow overflow-hidden',
        hover && 'clinical-card-hover cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={clsx('px-6 py-4.5 border-b border-slate-100 flex items-center justify-between gap-4', className)}>
      <div>
        <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardContent = ({ children, className = '' }) => {
  return <div className={clsx('p-6', className)}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={clsx('px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 text-xs text-slate-500', className)}>
      {children}
    </div>
  );
};

