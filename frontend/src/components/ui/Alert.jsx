import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { clsx } from 'clsx';

export const Alert = ({ type = 'info', title, children, className = '' }) => {
  const configs = {
    info: {
      bg: 'bg-medical-50 text-medical-900 border-medical-200',
      icon: Info,
      iconColor: 'text-medical-600',
    },
    warning: {
      bg: 'bg-amber-50 text-amber-900 border-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    danger: {
      bg: 'bg-rose-50 text-rose-900 border-rose-200',
      icon: AlertCircle,
      iconColor: 'text-rose-600',
    },
    success: {
      bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
    },
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  return (
    <div className={clsx('flex gap-3.5 p-4 rounded-xl border', config.bg, className)}>
      <Icon className={clsx('w-5 h-5 shrink-0 mt-0.5', config.iconColor)} />
      <div className="text-sm">
        {title && <h5 className="font-semibold mb-1">{title}</h5>}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
};

