import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AIChatPanel } from '../components/ai/AIChatPanel';
import { api } from '../services/api';
import { Skeleton } from '../components/ui/Skeleton';
import { ArrowLeft, FileText } from 'lucide-react';

export const AssistantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userReports = await api.getReports();
        setReports(userReports || []);

        if (id) {
          const detail = await api.getReport(id);
          setReport(detail);
        } else if (userReports && userReports.length > 0) {
          const detail = await api.getReport(userReports[0].id);
          setReport(detail);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto h-[600px] py-6">
        <Skeleton className="h-full w-full rounded-3xl" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No report selected</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Please upload or select a report to chat with the AI assistant.
        </p>
        <button
          onClick={() => navigate('/upload')}
          className="text-xs font-bold text-medical-700 hover:underline"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/reports/${report.id}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Analysis Dashboard</span>
        </button>

        {reports.length > 1 && (
          <select
            value={report.id}
            onChange={(e) => navigate(`/reports/${e.target.value}/assistant`)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-medical-500"
          >
            {reports.map((r) => (
              <option key={r.id} value={r.id}>
                Switch: {r.original_filename}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <AIChatPanel reportId={report.id} reportName={report.original_filename} />
      </div>
    </div>
  );
};

