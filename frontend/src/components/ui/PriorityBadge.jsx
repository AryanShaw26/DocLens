import React from 'react';
import { clsx } from 'clsx';
import { ShieldAlert, AlertCircle, CheckCircle } from 'lucide-react';

export const PriorityBadge = ({ score = 0, label = 'Low', className = '', showExplanation = false }) => {
  let colorTheme = {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    ring: 'stroke-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800',
    icon: CheckCircle,
    desc: 'Findings are predominantly within standard reference boundaries.',
  };

  if (score >= 65) {
    colorTheme = {
      bg: 'bg-rose-50 text-rose-900 border-rose-200',
      ring: 'stroke-rose-500',
      badge: 'bg-rose-100 text-rose-800',
      icon: ShieldAlert,
      desc: 'Multiple findings or flagged combinations warrant physician review.',
    };
  } else if (score >= 30) {
    colorTheme = {
      bg: 'bg-amber-50 text-amber-900 border-amber-200',
      ring: 'stroke-amber-500',
      badge: 'bg-amber-100 text-amber-800',
      icon: AlertCircle,
      desc: 'Selected borderline or single-indicator variations observed.',
    };
  }

  const circumference = 2 * Math.PI * 34; // radius 34
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={clsx('rounded-2xl border p-4 sm:p-5 transition-all', colorTheme.bg, className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Radial score gauge */}
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-slate-200/80"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                className={clsx('transition-all duration-700 ease-out', colorTheme.ring)}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold font-mono tracking-tight">{score}</span>
              <span className="text-[10px] uppercase font-semibold text-slate-500">/ 100</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Review Priority
              </span>
              <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', colorTheme.badge)}>
                {label}
              </span>
            </div>
            <h4 className="text-lg font-bold mt-0.5">{label}</h4>
            <p className="text-xs text-slate-600 mt-1 max-w-sm">
              Non-diagnostic review index based on parameter variance and combination rules.
            </p>
          </div>
        </div>
      </div>

      {showExplanation && (
        <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs text-slate-600">
          <p className="italic">
            Note: This score is a prioritized triage aid for discussing your laboratory report with a medical professional, NOT a diagnosis or disease probability.
          </p>
        </div>
      )}
    </div>
  );
};

