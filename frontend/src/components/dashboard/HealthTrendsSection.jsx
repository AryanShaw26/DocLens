import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  FileText,
  Gauge,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { StatusChip } from '../ui/StatusChip';
import { HealthTrendChart } from './HealthTrendChart';

const STAT_CARDS = [
  {
    key: 'total_reports',
    label: 'Total Reports',
    detail: 'reports analyzed',
    icon: FileText,
    color: 'bg-medical-50 text-medical-700',
  },
  {
    key: 'parameters_monitored',
    label: 'Parameters Monitored',
    detail: 'parameters tracked',
    icon: Activity,
    color: 'bg-blue-50 text-blue-700',
  },
  {
    key: 'findings_needing_attention',
    label: 'Findings Needing Attention',
    detail: 'outside configured ranges',
    icon: AlertTriangle,
    color: 'bg-rose-50 text-rose-700',
  },
];

const trendLabels = {
  stable: { label: 'Stable', icon: Minus, color: 'text-slate-600' },
  up: { label: 'Trending upward', icon: TrendingUp, color: 'text-blue-700' },
  down: { label: 'Trending downward', icon: TrendingDown, color: 'text-blue-700' },
  insufficient_data: { label: 'Insufficient data', icon: Activity, color: 'text-slate-500' },
};

const isAttentionStatus = (status) => ['high', 'low', 'borderline'].includes(
  (status || '').toLowerCase()
);

const displayValue = (finding) => finding.raw_value || finding.value || 'Not numeric';

export const HealthTrendsSection = ({ data, loading, error, onUpload }) => {
  const [selectedName, setSelectedName] = useState('');
  const parameterTrends = data?.parameter_trends || [];
  const selectedSeries = parameterTrends.find((series) => series.name === selectedName)
    || parameterTrends[0];
  const selectedObservation = selectedSeries?.observations?.at(-1);
  const trendStatus = trendLabels[selectedSeries?.trend] || trendLabels.insufficient_data;
  const TrendIcon = trendStatus.icon;

  return (
    <section className="space-y-4" aria-labelledby="health-trends-title">
      <div>
        <h3 id="health-trends-title" className="text-base font-bold tracking-tight text-slate-900">
          Health Trends
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Track changes across your recorded laboratory parameters over time.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Health trends are temporarily unavailable.
        </div>
      ) : data?.total_reports === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center clinical-shadow">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-medical-50 text-medical-700">
            <Activity className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            Your health trends will appear here after you analyze your first report.
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={onUpload}
          >
            Upload Report
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STAT_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.key}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 clinical-shadow"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {card.label}
                    </span>
                    <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${card.color}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-3 flex items-baseline gap-2">
                    <span className="font-mono text-2xl font-black text-slate-900">
                      {data?.[card.key] ?? 0}
                    </span>
                    <span className="text-xs text-slate-400">{card.detail}</span>
                  </p>
                </div>
              );
            })}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 clinical-shadow">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Latest Review Priority
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <Gauge className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-black text-slate-900">
                  {data?.latest_review_priority ?? '—'}
                </span>
                <span className="text-xs text-slate-400">
                  {data?.latest_review_priority == null ? 'not available' : '/ 100 recent'}
                </span>
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white clinical-shadow">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Parameter History</h4>
                <p className="text-xs text-slate-500">Recorded values by report date</p>
              </div>
              {parameterTrends.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {parameterTrends.map((series) => (
                    <button
                      key={series.name}
                      type="button"
                      onClick={() => setSelectedName(series.name)}
                      aria-pressed={selectedSeries?.name === series.name}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        selectedSeries?.name === series.name
                          ? 'border-medical-700 bg-medical-700 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-medical-300 hover:text-medical-700'
                      }`}
                    >
                      {series.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <HealthTrendChart series={selectedSeries} />
              {selectedSeries && (
                <div className="min-w-0 rounded-xl bg-slate-50 p-4 lg:min-w-48">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Observed trend
                  </p>
                  <p className={`mt-2 flex items-center gap-1.5 text-sm font-semibold ${trendStatus.color}`}>
                    <TrendIcon className="h-4 w-4" />
                    {trendStatus.label}
                  </p>
                  {selectedObservation && (
                    <p className="mt-3 text-xs text-slate-600">
                      Latest: <span className="font-semibold text-slate-800">
                        {selectedObservation.value}{selectedSeries.unit ? ` ${selectedSeries.unit}` : ''}
                      </span>
                      <span className="block text-slate-400">{selectedObservation.date}</span>
                    </p>
                  )}
                  {isAttentionStatus(selectedObservation?.status) && (
                    <div className="mt-3">
                      <StatusChip status={selectedObservation.status} />
                      <p className="mt-1 text-[11px] font-semibold text-rose-700">Needs Attention</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 px-5 py-4">
              <h4 className="text-sm font-bold text-slate-900">Recent Findings</h4>
              {data?.recent_findings?.length ? (
                <div className="mt-3 divide-y divide-slate-100">
                  {data.recent_findings.map((finding, index) => (
                    <div
                      key={`${finding.parameter}-${index}`}
                      className="flex flex-col gap-2 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{finding.parameter}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {displayValue(finding)}{finding.unit ? ` ${finding.unit}` : ''} · {
                            finding.status === 'borderline'
                              ? 'Borderline · may warrant professional review'
                              : 'Outside configured reference range'
                          }
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Reference range: {finding.reference_range || 'Not available'}
                          {finding.severity ? ` · ${finding.severity} severity` : ''}
                        </p>
                      </div>
                      <StatusChip status={finding.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  No recent findings are marked high, low, or borderline.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
};
