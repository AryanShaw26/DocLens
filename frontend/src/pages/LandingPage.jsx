import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  FileSearch,
  GitMerge,
  CheckCircle2,
  Lock,
  Clock,
  ArrowUpRight,
  Database
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StatusChip } from '../components/ui/StatusChip';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-medical-100 selection:text-medical-900">
      {/* Top Navbar */}
      <header className="h-20 bg-white/90 backdrop-blur border-b border-slate-200/80 sticky top-0 z-30 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medical-800 to-medical-600 flex items-center justify-center text-white shadow-md shadow-medical-900/10">
            <Activity className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">
              DocLens
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-medical-600">
              Your Online Medical Officer
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#how-it-works" className="hover:text-medical-700 transition-colors">How It Works</a>
          <a href="#features" className="hover:text-medical-700 transition-colors">Clinical Intelligence</a>
          <a href="#safety" className="hover:text-medical-700 transition-colors">Safety Standard</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 sm:px-12 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-medical-50 border border-medical-200/80 text-medical-800 text-xs font-bold mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-medical-600" />
            <span>AI-Assisted Medical Report Understanding</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.12]">
            Understand your medical reports in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-700 via-medical-600 to-accent-600">
              minutes.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
            DocLens extracts complex laboratory parameters, evaluates them against clinical reference ranges,
            detects potentially concerning combinations of findings.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto shadow-md shadow-medical-700/20"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={() => navigate('/upload')}
            >
              Analyze a Report
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              leftIcon={<Sparkles className="w-4 h-4 text-amber-500" />}
              onClick={() => navigate('/upload?mode=demo')}
            >
              Try Demo Report
            </Button>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-200/80 flex items-center justify-center lg:justify-start gap-8 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Private & Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-medical-600" />
              <span>Deterministic Rules</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent-600" />
              <span>Non-Diagnostic</span>
            </div>
          </div>
        </div>

        {/* Live Product Visualization Card */}
        <div className="flex-1 w-full max-w-xl lg:max-w-none">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 clinical-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-medical-50 rounded-full blur-3xl -z-10 opacity-70" />

            {/* Header Mock */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  Realtime Analysis Preview
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Comprehensive Metabolic & Lipid Panel
                </h3>
              </div>
              <span className="text-xs font-mono bg-medical-50 text-medical-800 font-semibold px-2.5 py-1 rounded-md border border-medical-200">
                Processed
              </span>
            </div>

            {/* Priority Score Mock */}
            <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-white border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Review Priority
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  Moderate Review Priority (68/100)
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Identified glycemic & lipid marker interplay warranting review.
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500 text-white font-mono font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                68
              </div>
            </div>

            {/* Parameter items */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">Fasting Blood Glucose</span>
                  <p className="text-[10px] text-slate-400">Ref: 70 - 99 mg/dL</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-900">142 mg/dL</span>
                  <StatusChip status="high" size="sm" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">HbA1c</span>
                  <p className="text-[10px] text-slate-400">Ref: 4.0 - 5.6 %</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-900">6.8 %</span>
                  <StatusChip status="high" size="sm" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">Serum Creatinine</span>
                  <p className="text-[10px] text-slate-400">Ref: 0.6 - 1.3 mg/dL</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-900">1.0 mg/dL</span>
                  <StatusChip status="normal" size="sm" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Product Pipeline Strip */}
      <section id="how-it-works" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs uppercase font-bold tracking-wider text-medical-600 mb-2">
              The DocLens Pipeline
            </h2>
            <h3 className="text-3xl font-black text-slate-950 tracking-tight">
              From raw test document to actionable clarity.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 relative">
              <div className="w-10 h-10 rounded-xl bg-medical-600 text-white flex items-center justify-center font-bold text-sm mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900">Upload Report</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Provide laboratory reports in PDF, JPG, PNG or TXT formats with automatic size & integrity verification.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 relative">
              <div className="w-10 h-10 rounded-xl bg-medical-700 text-white flex items-center justify-center font-bold text-sm mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900">AI Extraction</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Google Gemini extracts structured laboratory parameters and observed numerical values without hallucinating missing data.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 relative">
              <div className="w-10 h-10 rounded-xl bg-accent-600 text-white flex items-center justify-center font-bold text-sm mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900">Deterministic Rules</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Our backend rule engine validates ranges, isolates abnormalities, and evaluates concerning multi-parameter combinations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Medical Disclaimer Section */}
      <section id="safety" className="py-16 px-6 sm:px-12 max-w-5xl mx-auto w-full">
        <div className="p-8 sm:p-10 rounded-3xl bg-medical-950 text-white border border-medical-900 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-6 h-6 text-accent-400 shrink-0" />
            <h3 className="text-xl font-bold">Important Medical Information Notice</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            DocLens is an assistive medical-information platform designed to help patients understand complex laboratory reports.
            <strong> DocLens is NOT a diagnostic system and never provides definitive disease diagnoses or medication instructions.</strong>
            All insights, review priority indicators, and identified combinations are intended strictly as informational aids to support
            informed discussions with qualified physicians. If you are experiencing severe or acute symptoms, please seek emergency medical attention immediately.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <Link to="/disclaimer">
              <Button variant="teal" size="sm">
                Read Full Medical Disclaimer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white border-t border-slate-200/80 text-center text-xs text-slate-500">
        <p>© 2026 DocLens Inc. All rights reserved. Your Online Medical Officer.</p>
      </footer>
    </div>
  );
};
