import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  FileText,
  AlertTriangle,
  Activity,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { StatusChip } from '../components/ui/StatusChip';
import { Skeleton } from '../components/ui/Skeleton';
import { HealthTrendsSection } from '../components/dashboard/HealthTrendsSection';
import { ProgressOverview } from '../components/dashboard/ProgressOverview';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [healthTrends, setHealthTrends] = useState(null);
  const [healthTrendsLoading, setHealthTrendsLoading] = useState(true);
  const [healthTrendsError, setHealthTrendsError] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await api.getReports();
        setReports(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    const fetchHealthTrends = async () => {
      try {
        const data = await api.getHealthTrends();
        setHealthTrends(data);
      } catch (err) {
        setHealthTrendsError(true);
      } finally {
        setHealthTrendsLoading(false);
      }
    };
    fetchHealthTrends();
  }, []);

  const mostRecentReport = reports.length > 0 ? reports[0] : null;
  const totalReports = reports.length;
  const totalAbnormal = reports.reduce((acc, r) => acc + (r.abnormalities_count || 0), 0);
  const reportsRequiringReview = reports.filter((r) => (r.review_priority || 0) >= 65).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome / Context Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-medical-600">
            Patient Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Patient'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your extracted laboratory parameters and non-diagnostic clinical indicators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Sparkles className="w-4 h-4 text-amber-500" />}
            onClick={() => navigate('/upload?mode=demo')}
          >
            Try Demo Report
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={() => navigate('/upload')}
          >
            Upload New Report
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 clinical-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Reports
            </span>
            <div className="w-8 h-8 rounded-xl bg-medical-50 text-medical-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">
              {loading ? '-' : totalReports}
            </span>
            <span className="text-xs text-slate-400">analyzed</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 clinical-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Abnormal Findings
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-rose-600">
              {loading ? '-' : totalAbnormal}
            </span>
            <span className="text-xs text-slate-400">outside limits</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 clinical-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Review Priority
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">
              {loading ? '-' : mostRecentReport?.review_priority ?? '0'}
            </span>
            <span className="text-xs text-slate-400">/ 100 recent</span>
          </div>
        </div>

      </div>

      {/* Dominant Most Recent Report Card */}
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : mostRecentReport ? (
        <div className="bg-gradient-to-r from-medical-950 via-slate-900 to-medical-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent-400 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Most Recent Diagnostic Analysis</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                {mostRecentReport.original_filename}
              </h2>
              <p className="text-xs text-slate-300">
                Patient: <strong>{mostRecentReport.patient_name || 'Patient'}</strong> • Report Date: {mostRecentReport.report_date || 'Recent'}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
                <span>{mostRecentReport.parameters_count} Tests Evaluated</span>
                <span>•</span>
                <span className={mostRecentReport.abnormalities_count > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-medium'}>
                  {mostRecentReport.abnormalities_count} Findings Outside Range
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur text-center min-w-[130px]">
                <span className="text-[10px] uppercase font-bold text-slate-300 block">Review Priority</span>
                <span className="text-2xl font-black font-mono text-white mt-0.5 block">
                  {mostRecentReport.review_priority || 0}
                </span>
                <span className="text-[11px] text-accent-300 font-medium">
                  {mostRecentReport.priority_label || 'Low'}
                </span>
              </div>

              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <Link to={`/reports/${mostRecentReport.id}`}>
                  <Button variant="primary" size="md" className="w-full bg-accent-600 hover:bg-accent-700 text-white" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Open Analysis
                  </Button>
                </Link>
                <Link to={`/reports/${mostRecentReport.id}/assistant`}>
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/10">
                    Ask AI Assistant
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 clinical-shadow p-8">
          <div className="w-16 h-16 rounded-2xl bg-medical-50 text-medical-700 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No medical reports analyzed yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
            Upload your first laboratory report to extract parameters, identify abnormal values, and receive clinical explanations.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Sparkles className="w-4 h-4 text-amber-500" />}
              onClick={() => navigate('/upload?mode=demo')}
            >
              Try Demo Report
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={() => navigate('/upload')}
            >
              Upload Medical Report
            </Button>
          </div>
        </div>
      )}

      {/* Attention Needed Section */}
      {mostRecentReport && mostRecentReport.abnormalities_count > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50/50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Attention Needed: {mostRecentReport.abnormalities_count} Finding(s) Outside Standard Reference Ranges
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Values outside configured thresholds were detected in your latest report. Professional clinical review is recommended.
              </p>
            </div>
          </div>

          <Link to={`/reports/${mostRecentReport.id}`}>
            <Button variant="secondary" size="sm" className="shrink-0 bg-white" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Review Findings
            </Button>
          </Link>
        </div>
      )}

      {/* Recent Reports Timeline / List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Medical Reports</h3>
          <Link to="/reports" className="text-xs font-semibold text-medical-700 hover:text-medical-900">
            View All ({reports.length})
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 clinical-shadow divide-y divide-slate-100 overflow-hidden">
          {reports.slice(0, 5).map((r) => (
            <div
              key={r.id}
              onClick={() => navigate(`/reports/${r.id}`)}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {r.original_filename}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {r.report_date || 'Date N/A'} • {r.parameters_count} parameters evaluated
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold font-mono text-slate-800">
                    Priority: {r.review_priority || 0}/100
                  </span>
                  <div className="mt-0.5">
                    <span className="text-[11px] text-slate-500">
                      {r.abnormalities_count} abnormal
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <HealthTrendsSection
        data={healthTrends}
        loading={healthTrendsLoading}
        error={healthTrendsError}
        onUpload={() => navigate('/upload')}
      />
      <ProgressOverview
        data={healthTrends}
        loading={healthTrendsLoading}
        error={healthTrendsError}
      />
    </div>
  );
};
