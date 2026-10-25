import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  FileText,
  User,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  GitCompare,
  Download,
  Share2,
  ShieldCheck,
  ChevronRight,
  Filter,
  Layers,
  Printer
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { StatusChip } from '../components/ui/StatusChip';
import { FindingCard } from '../components/reports/FindingCard';
import { ConcerningCombinationCard } from '../components/reports/ConcerningCombinationCard';
import { AIChatPanel } from '../components/ai/AIChatPanel';
import { Skeleton } from '../components/ui/Skeleton';
import { api } from '../services/api';

export const ReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAssistantDrawer, setShowAssistantDrawer] = useState(false);
  const [initialAssistantPrompt, setInitialAssistantPrompt] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await api.getReport(id);
        setReport(data);
      } catch (err) {
        setError(err.message || 'Failed to load report.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-2" />
          <Skeleton className="h-64 col-span-1" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 max-w-xl mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Unable to load report</h2>
        <p className="text-sm text-slate-500 mt-2">{error || 'Report not found.'}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const parameters = report.parameters || [];
  const abnormalities = report.abnormalities || [];
  const combinations = report.concerning_combinations || [];
  const analysis = report.analysis;

  // Filter parameters by category
  const categories = ['all', ...Array.from(new Set(parameters.map((p) => p.category.toLowerCase())))];
  const filteredParameters = selectedCategory === 'all'
    ? parameters
    : parameters.filter((p) => p.category.toLowerCase() === selectedCategory);

  const abnormalCount = abnormalities.length;
  const normalCount = parameters.filter((p) => p.status === 'normal').length;

  const handleAskAssistant = (prompt) => {
    setInitialAssistantPrompt(prompt);
    setShowAssistantDrawer(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-fade-in">
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            onClick={handlePrint}
          >
            Print / Export PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<GitCompare className="w-3.5 h-3.5 text-medical-600" />}
            onClick={() => navigate(`/compare?a=${report.id}`)}
          >
            Compare Report
          </Button>
          <Button
            variant="teal"
            size="sm"
            leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
            onClick={() => handleAskAssistant('Summarize my abnormal findings in simple language')}
          >
            AI Assistant
          </Button>
        </div>
      </div>

      {/* 1. Report Information Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 clinical-shadow p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] uppercase tracking-wider font-bold text-medical-700 bg-medical-50 px-2.5 py-0.5 rounded-full border border-medical-200/60">
                Diagnostic Laboratory Report
              </span>
              <span className="text-xs text-slate-400">• ID: #{report.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {report.original_filename}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                <span>Patient: <strong className="text-slate-800">{report.patient_name || 'Patient'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Report Date: <strong className="text-slate-800">{report.report_date || 'Recent'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="uppercase">{report.file_type} Document</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shrink-0">
            <div className="text-center px-3">
              <span className="text-xl font-bold font-mono text-slate-900">{parameters.length}</span>
              <span className="block text-[10px] uppercase font-semibold text-slate-400">Total Tests</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center px-3">
              <span className="text-xl font-bold font-mono text-emerald-600">{normalCount}</span>
              <span className="block text-[10px] uppercase font-semibold text-slate-400">Within Range</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center px-3">
              <span className="text-xl font-bold font-mono text-rose-600">{abnormalCount}</span>
              <span className="block text-[10px] uppercase font-semibold text-slate-400">Attention</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Review Priority Score + AI Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Review Priority radial badge */}
        <div className="lg:col-span-1">
          <PriorityBadge
            score={analysis?.review_priority ?? 0}
            label={analysis?.priority_label ?? 'Low'}
            showExplanation={true}
            className="h-full flex flex-col justify-between"
          />
        </div>

        {/* AI Clinical Plain-Language Summary */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 clinical-shadow p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-600" />
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Clinical Summary & Patient Explanation
                </h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Non-Diagnostic
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {analysis?.summary || 'No AI summary generated for this report.'}
            </p>
            {report.source_interpretation && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-700">
                  Source-provided laboratory interpretation
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  “{report.source_interpretation}”
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Quoted from the report; this is not an AI diagnosis.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-[11px] text-slate-400 italic">
              Generated by DocLens Medical Intelligence using validated parameter data.
            </span>
            <button
              onClick={() => handleAskAssistant('What questions should I ask my doctor about this summary?')}
              className="text-xs font-semibold text-medical-700 hover:text-medical-900 flex items-center gap-1"
            >
              <span>Ask follow-up questions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Concerning Combinations (Key Hackathon Differentiator) */}
      {combinations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Potentially Concerning Combinations ({combinations.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {combinations.map((comb, idx) => (
              <ConcerningCombinationCard key={idx} combination={comb} />
            ))}
          </div>
        </div>
      )}

      {/* 4. Attention / Abnormal Findings Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Findings Outside Reference Ranges ({abnormalities.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Ordered by clinical attention priority
          </span>
        </div>

        {abnormalities.length > 0 ? (
          <div className="space-y-3">
            {parameters
              .filter((p) => p.status === 'high' || p.status === 'low' || p.status === 'borderline')
              .map((param) => (
                <FindingCard
                  key={param.name}
                  parameter={param}
                  onAskAssistant={handleAskAssistant}
                />
              ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Excellent news: All extracted parameters in this laboratory report are within standard configured reference thresholds.
            </span>
          </div>
        )}
      </div>

      {/* 5. Complete Parameter Details List with Category Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/90 clinical-shadow p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              All Evaluated Medical Parameters ({filteredParameters.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive laboratory panel breakdown with reference thresholds.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold capitalize whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-medical-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredParameters.map((param) => (
            <FindingCard
              key={param.name}
              parameter={param}
              onAskAssistant={handleAskAssistant}
            />
          ))}
        </div>
      </div>

      {/* Slide-Over AI Report Assistant Drawer */}
      {showAssistantDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md h-full p-4 sm:p-6 animate-slide-up">
            <AIChatPanel
              reportId={report.id}
              reportName={report.original_filename}
              initialPrompt={initialAssistantPrompt}
              onClose={() => setShowAssistantDrawer(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
