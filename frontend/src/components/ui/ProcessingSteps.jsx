import React from 'react';
import { Check, Loader2, Sparkles, FileText, Database, GitMerge, FileSearch, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

export const STEPS = [
  { id: 'uploading', label: 'Uploading medical report', icon: FileText },
  { id: 'reading', label: 'Reading & parsing document text', icon: FileSearch },
  { id: 'extracting', label: 'Extracting medical parameters & values', icon: Sparkles },
  { id: 'ranges', label: 'Checking reference range boundaries', icon: Database },
  { id: 'combinations', label: 'Analyzing potential finding combinations', icon: GitMerge },
  { id: 'summary', label: 'Preparing non-diagnostic patient summary', icon: CheckCircle2 },
];

export const ProcessingSteps = ({ currentStepIndex = 0 }) => {
  return (
    <div className="w-full max-w-lg mx-auto py-6 px-4">
      <div className="space-y-4">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isUpcoming = idx > currentStepIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={clsx(
                'flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-300',
                isCurrent && 'bg-medical-50/80 border-medical-200 shadow-sm shadow-medical-100',
                isDone && 'bg-white border-slate-200 opacity-90',
                isUpcoming && 'bg-slate-50/50 border-slate-100 opacity-40'
              )}
            >
              <div
                className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors',
                  isDone && 'bg-emerald-500 text-white',
                  isCurrent && 'bg-medical-600 text-white animate-pulse-subtle',
                  isUpcoming && 'bg-slate-200 text-slate-400'
                )}
              >
                {isDone ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={clsx(
                    'text-sm font-semibold truncate',
                    isCurrent && 'text-medical-950 font-bold',
                    isDone && 'text-slate-800',
                    isUpcoming && 'text-slate-400'
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-slate-500">
                  {isDone && 'Completed'}
                  {isCurrent && 'In progress...'}
                  {isUpcoming && 'Pending'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

