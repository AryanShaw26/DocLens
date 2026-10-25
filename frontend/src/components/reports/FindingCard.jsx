import React, { useState } from 'react';
import { clsx } from 'clsx';
import { StatusChip } from '../ui/StatusChip';
import { RangeBarChart } from './RangeBarChart';
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

export const FindingCard = ({ parameter, onAskAssistant }) => {
  const [expanded, setExpanded] = useState(false);

  const isAbnormal = parameter.status === 'high' || parameter.status === 'low';
  const isBorderline = parameter.status === 'borderline';

  return (
    <div
      className={clsx(
        'rounded-2xl border transition-all duration-200 bg-white overflow-hidden',
        isAbnormal && 'border-rose-200 shadow-sm shadow-rose-100/50',
        isBorderline && 'border-amber-200 shadow-sm shadow-amber-100/40',
        !isAbnormal && !isBorderline && 'border-slate-200/80 hover:border-slate-300'
      )}
    >
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Name and category */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-bold text-slate-900 tracking-tight">
              {parameter.name}
            </h4>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              {parameter.category}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reference Range: <span className="font-medium text-slate-700">{parameter.reference_range || 'N/A'}</span>
          </p>
        </div>

        {/* Observed Value & Status */}
        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
          <div className="text-right">
            <div className="text-lg font-extrabold font-mono text-slate-900">
              {parameter.raw_value || parameter.value}
              {parameter.unit && (
                <span className="text-xs font-normal text-slate-500 ml-1 font-sans">
                  {parameter.unit}
                </span>
              )}
            </div>
            <div className="mt-0.5">
              <StatusChip status={parameter.status} size="sm" />
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Toggle Details"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Range Bar Indicator */}
      {parameter.ref_min !== null && parameter.ref_max !== null && parameter.value !== null && (
        <div className="px-5 pb-3">
          <RangeBarChart
            value={parameter.value}
            refMin={parameter.ref_min}
            refMax={parameter.ref_max}
            unit={parameter.unit}
            status={parameter.status}
          />
        </div>
      )}

      {/* Expandable Context & AI Explanations */}
      {expanded && (
        <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div>
            <p className="font-medium text-slate-700">
              {isAbnormal
                ? 'This result is outside the configured reference range and may warrant professional review.'
                : isBorderline
                ? 'This result is near the boundary threshold of the reference range.'
                : 'This result is within the standard laboratory reference range.'}
            </p>
            <p className="text-slate-500 mt-0.5">
              Discuss how this test correlates with your current symptoms and health history with your doctor.
            </p>
          </div>

          {onAskAssistant && (
            <button
              onClick={() => onAskAssistant(`Explain my ${parameter.name} result in simple terms`)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-medical-700 hover:text-medical-900 shrink-0 bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-medical-300 transition-colors shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Ask AI Assistant
            </button>
          )}
        </div>
      )}
    </div>
  );
};
