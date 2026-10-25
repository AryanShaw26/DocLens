import React from 'react';

const WIDTH = 900;
const HEIGHT = 300;
const PADDING = { top: 20, right: 24, bottom: 58, left: 58 };

const formatValue = (value) => Number(value).toLocaleString(undefined, {
  maximumFractionDigits: 2,
});

export const HealthTrendChart = ({ series }) => {
  const observations = series?.observations?.filter(
    (observation) => Number.isFinite(observation.value)
  ) || [];

  if (!observations.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
        No numeric observations are available for this parameter.
      </div>
    );
  }

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const values = observations.map((observation) => observation.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const padding = rawMin === rawMax ? Math.max(Math.abs(rawMin) * 0.1, 1) : (rawMax - rawMin) * 0.15;
  const minValue = rawMin - padding;
  const maxValue = rawMax + padding;
  const xFor = (index) => PADDING.left + (
    observations.length === 1 ? plotWidth / 2 : index / (observations.length - 1) * plotWidth
  );
  const yFor = (value) => PADDING.top + (maxValue - value) / (maxValue - minValue) * plotHeight;
  const points = observations.map((observation, index) => ({
    ...observation,
    x: xFor(index),
    y: yFor(observation.value),
  }));
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');
  const dateLabelIndexes = observations.length <= 5
    ? observations.map((_, index) => index)
    : [0, Math.round((observations.length - 1) / 2), observations.length - 1];

  return (
    <div className="w-full min-w-0">
      <div className="w-full">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`${series.name} historical values`}
          className="block h-auto w-full"
        >
          {[0, 1, 2, 3].map((tick) => {
            const value = maxValue - (maxValue - minValue) * tick / 3;
            const y = PADDING.top + plotHeight * tick / 3;
            return (
              <g key={tick}>
                <line
                  x1={PADDING.left}
                  x2={WIDTH - PADDING.right}
                  y1={y}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray={tick === 3 ? undefined : '4 5'}
                />
                <text
                  x={PADDING.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400"
                  fontSize="11"
                >
                  {formatValue(value)}
                </text>
              </g>
            );
          })}
          <line
            x1={PADDING.left}
            x2={PADDING.left}
            y1={PADDING.top}
            y2={PADDING.top + plotHeight}
            stroke="#cbd5e1"
          />
          {points.length > 1 && (
            <polyline
              points={linePoints}
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {points.map((point) => (
            <circle
              key={`${point.report_id}-${point.date}`}
              cx={point.x}
              cy={point.y}
              r="5"
              fill="#2563eb"
              stroke="white"
              strokeWidth="2"
            >
              <title>{`${point.date}: ${formatValue(point.value)} ${series.unit || ''} (${point.status})`}</title>
            </circle>
          ))}
          {dateLabelIndexes.map((index) => {
            const point = points[index];
            return (
              <text
                key={`${point.report_id}-date`}
                x={point.x}
                y={HEIGHT - 24}
                textAnchor="middle"
                className="fill-slate-500"
                fontSize="11"
              >
                {point.date}
              </text>
            );
          })}
        </svg>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
        <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
        <span>{series.name}{series.unit ? ` (${series.unit})` : ''}</span>
      </div>
      {observations.length < 2 && (
        <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
          More reports are needed to establish a historical trend.
        </p>
      )}
    </div>
  );
};
