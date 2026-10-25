import React from 'react';
import { CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight, HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';

export const StatusChip = ({ status = 'unknown', size = 'sm', className = '' }) => {
  const normalized = (status || 'unknown').toLowerCase();

  const configs = {
    normal: {
      label: 'Normal',
      icon: CheckCircle2,
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    },
    borderline: {
      label: 'Borderline',
      icon: AlertTriangle,
      style: 'bg-amber-50 text-amber-700 border-amber-200/80',
    },
    high: {
      label: 'Above Range',
      icon: ArrowUpRight,
      style: 'bg-rose-50 text-rose-700 border-rose-200/80',
    },
    low: {
      label: 'Below Range',
      icon: ArrowDownRight,
      style: 'bg-rose-50 text-rose-700 border-rose-200/80',
    },
    unknown: {
      label: 'Unclassified',
      icon: HelpCircle,
      style: 'bg-slate-50 text-slate-600 border-slate-200',
    },
  };

  const config = configs[normalized] || configs.unknown;
  const Icon = config.icon;

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    md: 'text-sm px-3 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-lg border select-none transition-colors',
        config.style,
        sizeStyles[size],
        className
      )}
    >
      <Icon className={size === 'sm' ? 'w-3.5 h-3.5 shrink-0' : 'w-4 h-4 shrink-0'} />
      <span>{config.label}</span>
    </span>
  );
};

