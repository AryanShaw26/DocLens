import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export const ConcerningCombinationCard = ({ combination }) => {
  return (
    <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/60 to-white p-5 clinical-shadow">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 stroke-[2]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
              Potentially Concerning Combination
            </span>
          </div>

          <h4 className="text-base font-bold text-slate-900 mt-1">
            {combination.title}
          </h4>

          <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
            {combination.description}
          </p>

          {/* Involved Parameters Pills */}
          {combination.parameters_involved && combination.parameters_involved.length > 0 && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500">Involved findings:</span>
              {combination.parameters_involved.map((paramName) => (
                <span
                  key={paramName}
                  className="text-xs px-2.5 py-1 rounded-md bg-white border border-amber-200 text-amber-900 font-medium"
                >
                  {paramName}
                </span>
              ))}
            </div>
          )}

          {/* Contextual Action */}
          <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between flex-wrap gap-2">
            <p className="text-[11px] text-slate-500 italic">
              Non-diagnostic pattern alert: Schedule a professional consultation to evaluate these concurrent findings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
