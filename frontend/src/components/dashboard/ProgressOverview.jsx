import React from 'react';
import { ArrowDown, ArrowRight, ArrowUp, Minus } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

const progressLabels = {
  improved: {
    label: 'Moved closer to range',
    className: 'text-emerald-700 bg-emerald-50',
  },
  stable: {
    label: 'Stable',
    className: 'text-slate-600 bg-slate-100',
  },
  needs_attention: {
    label: 'Moved farther from range',
    className: 'text-rose-700 bg-rose-50',
  },
  insufficient_data: {
    label: 'Reference range unavailable',
    className: 'text-slate-500 bg-slate-100',
  },
};

const formatValue = (value) => Number(value).toLocaleString(undefined, {
  maximumFractionDigits: 2,
});

const getMarkerPosition = (value, min, max) => {
  if (max <= min) return 50;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
};

const RangeComparison = ({ parameter }) => {
  if (parameter.ref_min == null || parameter.ref_max == null) {
    return (
      <p className="mt-3 text-xs text-slate-500">
        Reference range unavailable
      </p>
    );
  }

  const low = Math.min(parameter.ref_min, parameter.ref_max, parameter.first_value, parameter.latest_value);
  const high = Math.max(parameter.ref_min, parameter.ref_max, parameter.first_value, parameter.latest_value);
  const padding = Math.max((high - low) * 0.15, Math.abs(high) * 0.02, 0.01);
  const domainMin = low - padding;
  const domainMax = high + padding;
  const rangeStart = getMarkerPosition(parameter.ref_min, domainMin, domainMax);
  const rangeEnd = getMarkerPosition(parameter.ref_max, domainMin, domainMax);
  const firstPosition = getMarkerPosition(parameter.first_value, domainMin, domainMax);
  const latestPosition = getMarkerPosition(parameter.latest_value, domainMin, domainMax);

  return (
    <div className="mt-4">
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>Low</span>
        <span>Configured reference range</span>
        <span>High</span>
      </div>
      <div className="relative mt-2 h-3 rounded-full bg-slate-100">
        <div
          className="absolute inset-y-0 rounded-full bg-emerald-100"
          style={{
            left: `${Math.min(rangeStart, rangeEnd)}%`,
            width: `${Math.abs(rangeEnd - rangeStart)}%`,
          }}
        />
        <span
          className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-500 shadow"
          style={{ left: `${firstPosition}%` }}
          title={`First: ${formatValue(parameter.first_value)}`}
        />
        <span
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-medical-700 shadow"
          style={{ left: `${latestPosition}%` }}
          title={`Latest: ${formatValue(parameter.latest_value)}`}
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-slate-500">
        <span>Ref min: {formatValue(parameter.ref_min)}</span>
        <span>Ref max: {formatValue(parameter.ref_max)}</span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-500" />
          First report
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-medical-700" />
          Latest report
        </span>
      </div>
    </div>
  );
};

const ChangeIcon = ({ direction }) => {
  const Icon = direction === 'up'
    ? ArrowUp
    : direction === 'down'
      ? ArrowDown
      : direction === 'stable'
        ? Minus
        : ArrowRight;
  return <Icon className="h-4 w-4" />;
};

export const ProgressOverview = ({ data, loading, error }) => {
  if (loading) {
    return (
      <section className="space-y-4" aria-labelledby="progress-overview-title">
        <div>
          <h3 id="progress-overview-title" className="text-base font-bold text-slate-900">
            Progress Overview
          </h3>
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="space-y-4" aria-labelledby="progress-overview-title">
        <div>
          <h3 id="progress-overview-title" className="text-base font-bold text-slate-900">
            Progress Overview
          </h3>
        </div>
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Health trends are temporarily unavailable.
        </p>
      </section>
    );
  }

  const progress = data.progress;
  const summary = progress?.summary;
  const reportsCount = data.total_reports || 0;

  return (
    <section className="space-y-4" aria-labelledby="progress-overview-title">
      <div>
        <h3 id="progress-overview-title" className="text-base font-bold tracking-tight text-slate-900">
          Progress Overview
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Compare recorded parameters between your earliest and latest reports.
        </p>
      </div>

      {reportsCount === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-sm text-slate-600 clinical-shadow">
          No report data available yet.
        </div>
      ) : reportsCount === 1 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-sm text-slate-600 clinical-shadow">
          Upload additional reports to compare progress over time.
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white clinical-shadow">
            <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h4 className="text-sm font-bold text-slate-900">First Report <ArrowRight className="mx-1 inline h-3.5 w-3.5 text-slate-400" /> Latest Report</h4>
              <p className="text-xs text-slate-500">
                {progress?.first_report?.date || 'Date unavailable'}
                <span className="mx-2 text-slate-300">→</span>
                {progress?.latest_report?.date || 'Date unavailable'}
              </p>
            </div>
            {progress?.parameters?.length ? (
              <div className="divide-y divide-slate-100">
                {progress.parameters.map((parameter) => {
                  const result = progressLabels[parameter.progress_status] || progressLabels.insufficient_data;
                  const change = Number(parameter.change);
                  return (
                    <div key={parameter.name} className="p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h5 className="text-sm font-bold text-slate-900">{parameter.name}</h5>
                          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-slate-700">
                            <span>{formatValue(parameter.first_value)}{parameter.unit ? ` ${parameter.unit}` : ''}</span>
                            <ChangeIcon direction={parameter.direction} />
                            <span className="font-semibold">
                              {formatValue(parameter.latest_value)}{parameter.unit ? ` ${parameter.unit}` : ''}
                            </span>
                            <span className="text-xs text-slate-400">
                              (change {formatValue(Math.abs(change))}{parameter.unit ? ` ${parameter.unit}` : ''})
                            </span>
                          </p>
                        </div>
                        <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ${result.className}`}>
                          {result.label}
                        </span>
                      </div>
                      <RangeComparison parameter={parameter} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="p-5 text-sm text-slate-500">
                No matching parameters with compatible units and numeric values are available in both reports.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 clinical-shadow">
            <h4 className="text-sm font-bold text-slate-900">Improvement Summary</h4>
            <p className="mt-1 text-xs text-slate-500">
              Changes are compared with each report’s configured reference range.
            </p>
            <div className="mt-4 space-y-3">
              <SummaryCount label="Moved closer to range" count={summary?.improved || 0} color="text-emerald-700" />
              <SummaryCount label="Stable" count={summary?.stable || 0} color="text-slate-700" />
              <SummaryCount label="Moved farther from range" count={summary?.needs_attention || 0} color="text-rose-700" />
              {(summary?.insufficient_data || 0) > 0 && (
                <SummaryCount label="Insufficient range data" count={summary.insufficient_data} color="text-slate-500" />
              )}
            </div>
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Overall observed trend
              </p>
              <p className={`mt-1 text-lg font-black capitalize ${
                summary?.overall === 'improving'
                  ? 'text-emerald-700'
                  : summary?.overall === 'needs_attention'
                    ? 'text-rose-700'
                    : 'text-slate-700'
              }`}>
                {summary?.overall === 'improving'
                  ? 'Parameters trending closer'
                  : summary?.overall === 'needs_attention'
                    ? 'Some parameters moved farther'
                    : summary?.overall === 'stable'
                      ? 'Stable'
                      : 'Insufficient data'}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                This describes recorded values only and is not a diagnosis.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const SummaryCount = ({ label, count, color }) => (
  <div className="flex items-center justify-between gap-3 text-xs">
    <span className="text-slate-600">{label}</span>
    <span className={`font-mono text-sm font-bold ${color}`}>{count}</span>
  </div>
);
