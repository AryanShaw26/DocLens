import React from 'react';
import { clsx } from 'clsx';

export const RangeBarChart = ({ value, refMin, refMax, unit = '', status = 'normal' }) => {
  if (value === null || value === undefined || refMin === null || refMin === undefined || refMax === null || refMax === undefined) {
    return null;
  }

  // Calculate visualization scale range with margin
  const spread = refMax - refMin;
  const chartMin = Math.max(0, refMin - spread * 0.4);
  const chartMax = refMax + spread * 0.4;
  const totalSpan = chartMax - chartMin;

  if (totalSpan <= 0) return null;

  // Percentage positions
  const minPct = Math.max(0, Math.min(100, ((refMin - chartMin) / totalSpan) * 100));
  const maxPct = Math.max(0, Math.min(100, ((refMax - chartMin) / totalSpan) * 100));
  const valPct = Math.max(2, Math.min(98, ((value - chartMin) / totalSpan) * 100));

  const isHigh = status === 'high';
  const isLow = status === 'low';
  const isBorderline = status === 'borderline';

  return (
    <div className="w-full mt-2 select-none">
      <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden flex items-center">
        {/* Normal range green zone */}
        <div
          className="absolute h-full bg-emerald-100 border-x border-emerald-300"
          style={{
            left: `${minPct}%`,
            width: `${Math.max(1, maxPct - minPct)}%`,
          }}
        />

        {/* Marker for patient value */}
        <div
          className={clsx(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-all duration-500 z-10',
            isHigh && 'bg-rose-600',
            isLow && 'bg-rose-600',
            isBorderline && 'bg-amber-500',
            !isHigh && !isLow && !isBorderline && 'bg-emerald-600'
          )}
          style={{ left: `${valPct}%` }}
        />
      </div>

      {/* Threshold Labels */}
      <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
        <span>Min: {refMin}</span>
        <span className="font-semibold text-slate-600">Patient: {value} {unit}</span>
        <span>Max: {refMax}</span>
      </div>
    </div>
  );
};

