import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Upload, Sparkles, Trash2, ChevronRight, Search, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { api } from '../services/api';

export const ReportsListPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await api.getReports();
      setReports(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }
    setDeletingId(id);
    try {
      await api.deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete report.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReports = reports.filter((r) =>
    (r.original_filename || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.patient_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Medical Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access past laboratory investigations, trends, and clinical analyses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
            onClick={() => navigate('/upload?mode=demo')}
          >
            Try Demo Report
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Upload className="w-3.5 h-3.5" />}
            onClick={() => navigate('/upload')}
          >
            Upload New Report
          </Button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search reports by filename or patient name..."
          className="w-full bg-white border border-slate-200 focus:border-medical-500 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none clinical-shadow transition-all"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 clinical-shadow divide-y divide-slate-100 overflow-hidden">
          {filteredReports.map((r) => (
            <div
              key={r.id}
              onClick={() => navigate(`/reports/${r.id}`)}
              className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-medical-50 text-medical-700 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 stroke-[1.8]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    {r.original_filename}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                    <span>{r.patient_name || 'Patient'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {r.report_date || 'Recent'}
                    </span>
                    <span>•</span>
                    <span>{r.parameters_count} tests</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold font-mono text-slate-900">
                    Review Priority: {r.review_priority || 0}/100
                  </span>
                  <div className="mt-0.5">
                    <span
                      className={`text-xs font-semibold ${
                        r.abnormalities_count > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {r.abnormalities_count} attention finding(s)
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDelete(e, r.id)}
                  disabled={deletingId === r.id}
                  title="Delete Report"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No reports found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery ? 'Try a different search query' : 'Upload your first medical report to begin.'}
          </p>
        </div>
      )}
    </div>
  );
};

