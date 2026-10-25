import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GitCompare, ArrowRight, ArrowUpRight, ArrowDownRight, Minus, Sparkles, AlertCircle, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StatusChip } from '../components/ui/StatusChip';
import { Skeleton } from '../components/ui/Skeleton';
import { api } from '../services/api';

export const ComparePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [selectedA, setSelectedA] = useState('');
  const [selectedB, setSelectedB] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const list = await api.getReports();
        setReports(list || []);

        const initialA = searchParams.get('a') || (list && list.length > 0 ? list[0].id : '');
        const initialB = searchParams.get('b') || (list && list.length > 1 ? list[1].id : '');

        setSelectedA(String(initialA));
        setSelectedB(String(initialB));

        if (initialA && initialB && initialA !== initialB) {
          runComparison(initialA, initialB);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const runComparison = async (idA, idB) => {
    if (!idA || !idB || idA === idB) {
      setError('Please choose two distinct reports to compare.');
      return;
    }
    setError('');
    setComparing(true);
    try {
      const data = await api.compareReports(idA, idB);
      setComparison(data);
    } catch (err) {
      setError(err.message || 'Comparison failed.');
    } finally {
      setComparing(false);
    }
  };

  const handleCompareClick = () => {
    runComparison(selectedA, selectedB);
  };

  const getChangeBadge = (changeType) => {
    switch (changeType) {
      case 'improved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <ArrowDownRight className="w-3.5 h-3.5" /> Improved
          </span>
        );
      case 'newly_abnormal':
      case 'worsened':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
            <ArrowUpRight className="w-3.5 h-3.5" /> Attention
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            <Minus className="w-3 h-3" /> Unchanged
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Compare Medical Reports
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Evaluate historical trajectory, newly flagged indicators, and improvements across test dates.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 clinical-shadow p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Baseline Report (A)
            </label>
            <select
              value={selectedA}
              onChange={(e) => setSelectedA(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-medical-500 font-medium"
            >
              <option value="">Select Baseline Report...</option>
              {reports.map((r) => (
                <option key={r.id} value={r.id}>
                  #{r.id} — {r.original_filename} ({r.report_date || 'Date N/A'})
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Comparison Report (B)
            </label>
            <select
              value={selectedB}
              onChange={(e) => setSelectedB(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-medical-500 font-medium"
            >
              <option value="">Select Comparison Report...</option>
              {reports.map((r) => (
                <option key={r.id} value={r.id}>
                  #{r.id} — {r.original_filename} ({r.report_date || 'Date N/A'})
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-1">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              loading={comparing}
              disabled={!selectedA || !selectedB || selectedA === selectedB}
              onClick={handleCompareClick}
              leftIcon={<GitCompare className="w-4 h-4" />}
            >
              Compare
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {comparing ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : comparison ? (
        <div className="space-y-6">
          {/* Summary Box */}
          <div className="bg-gradient-to-r from-medical-50 to-white rounded-3xl border border-medical-200 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-medical-700 mb-2">
              <Sparkles className="w-4 h-4 text-medical-600" />
              <span>Comparative Clinical Trajectory</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {comparison.summary}
            </p>

            <div className="mt-5 pt-4 border-t border-medical-200/60 flex items-center gap-6 text-xs font-bold">
              <span className="text-emerald-700">
                {comparison.improved_count} Improved / Normalized
              </span>
              <span className="text-rose-700">
                {comparison.worsened_count} Newly Outside Range
              </span>
              <span className="text-slate-500">
                {comparison.total_compared} Parameters Evaluated
              </span>
            </div>
          </div>

          {/* Delta Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 clinical-shadow overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Parameter-by-Parameter Breakdown
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 uppercase text-[11px] font-bold">
                    <th className="py-3.5 px-6">Parameter</th>
                    <th className="py-3.5 px-6">Baseline ({comparison.report_a.original_filename})</th>
                    <th className="py-3.5 px-6">Comparison ({comparison.report_b.original_filename})</th>
                    <th className="py-3.5 px-6">Delta</th>
                    <th className="py-3.5 px-6">Trajectory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparison.deltas.map((d) => (
                    <tr key={d.name} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {d.name}
                        <span className="block text-[10px] font-normal text-slate-400 capitalize">
                          {d.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono font-medium text-slate-700">
                        {d.value_a !== null ? `${d.value_a} ${d.unit || ''}` : 'N/A'}
                        <div className="mt-1">
                          <StatusChip status={d.status_a} size="sm" />
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono font-medium text-slate-700">
                        {d.value_b !== null ? `${d.value_b} ${d.unit || ''}` : 'N/A'}
                        <div className="mt-1">
                          <StatusChip status={d.status_b} size="sm" />
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-600">
                        {d.delta_text}
                      </td>
                      <td className="py-4 px-6">
                        {getChangeBadge(d.change_type)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : reports.length < 2 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Need at least two reports to compare</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Upload another medical report or generate the demo report to enable side-by-side comparison.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/upload?mode=demo')}
          >
            Create Demo Report
          </Button>
        </div>
      ) : null}
    </div>
  );
};

