import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, Sparkles, AlertCircle, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { FileDropzone } from '../components/reports/FileDropzone';
import { ProcessingSteps } from '../components/ui/ProcessingSteps';
import { api } from '../services/api';

export const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // If query param mode=demo is present, auto trigger demo report creation
  useEffect(() => {
    if (searchParams.get('mode') === 'demo') {
      handleTriggerDemo();
    }
  }, [searchParams]);

  const handleTriggerDemo = async () => {
    setError('');
    setIsProcessing(true);
    setProcessingStep(0);

    // Step animation cadence
    const interval = setInterval(() => {
      setProcessingStep((prev) => {
        if (prev < 5) return prev + 1;
        return prev;
      });
    }, 600);

    try {
      const report = await api.createDemoReport();
      clearInterval(interval);
      setProcessingStep(6);
      setTimeout(() => {
        navigate(`/reports/${report.id}`);
      }, 700);
    } catch (err) {
      clearInterval(interval);
      setIsProcessing(false);
      setError(err.message || 'Failed to process demo report.');
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select or drop a medical report file first.');
      return;
    }

    setError('');
    setIsProcessing(true);
    setProcessingStep(0);

    // Progression timer to show the transparent, meaningful stages
    const timer = setInterval(() => {
      setProcessingStep((prev) => {
        if (prev < 5) return prev + 1;
        return prev;
      });
    }, 700);

    try {
      const report = await api.uploadReport(selectedFile, notes);
      clearInterval(timer);
      setProcessingStep(6);
      setTimeout(() => {
        navigate(`/reports/${report.id}`);
      }, 700);
    } catch (err) {
      clearInterval(timer);
      setIsProcessing(false);
      setError(err.message || 'Report analysis encountered an issue.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
          onClick={handleTriggerDemo}
          disabled={isProcessing}
        >
          Try Demo Report
        </Button>
      </div>

      <div className="text-center max-w-lg mx-auto">
        <span className="text-xs uppercase font-bold tracking-wider text-medical-600">
          Document Intake
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
          Upload Medical Report
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Securely submit your laboratory test results for automated extraction, deterministic reference range checking, and clinical explanation.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError('')}
            className="text-rose-700 hover:bg-rose-100"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 clinical-shadow p-6 sm:p-10">
        {!isProcessing ? (
          <div className="space-y-6">
            <FileDropzone
              onFileSelect={(file) => {
                setSelectedFile(file);
                setError('');
              }}
              selectedFile={selectedFile}
              onRemoveFile={() => setSelectedFile(null)}
              disabled={isProcessing}
            />

            {/* Optional patient notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Optional Notes / Clinical Context
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Annual routine physical checkup, fasting test, etc."
                className="w-full bg-slate-50 border border-slate-200 focus:border-medical-500 focus:bg-white rounded-xl p-3 text-xs sm:text-sm text-slate-800 focus:outline-none transition-all"
              />
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full shadow-md shadow-medical-700/20"
                onClick={handleUploadAndAnalyze}
                disabled={!selectedFile}
                leftIcon={<Upload className="w-5 h-5" />}
              >
                Analyze Report With DocLens
              </Button>
            </div>
          </div>
        ) : (
          /* Realtime processing experience */
          <div className="py-6 text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-medical-50 text-medical-800 text-xs font-bold mb-4">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-medical-600" />
              <span>DocLens Clinical Engine Processing</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Analyzing Diagnostic Document
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Extracting parameters, verifying standard reference ranges, and generating your clinical summary.
            </p>

            <ProcessingSteps currentStepIndex={processingStep} />
          </div>
        )}
      </div>

      <div className="text-center text-[11px] text-slate-400">
        All documents are processed under strict privacy constraints. DocLens provides non-diagnostic informational insights.
      </div>
    </div>
  );
};

