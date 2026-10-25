import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, ShieldCheck, Heart, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="pb-4 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Patient Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your account identity, security preferences, and report history.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 clinical-shadow p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-medical-800 text-white font-black text-2xl flex items-center justify-center shadow-md">
            {user?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'P'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.full_name || 'DocLens Patient'}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-2">
              <CheckCircle2 className="w-3 h-3" /> Account Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Account ID</span>
            <p className="text-sm font-mono font-bold text-slate-800 mt-1">#{user?.id || '101'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Created At</span>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'October 2026'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-medical-50/70 border border-medical-200 text-xs text-medical-900 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-medical-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Medical Data Privacy:</span>
            <p className="mt-0.5 text-slate-600 leading-relaxed">
              Your test reports and health metrics are isolated and tied strictly to your authenticated session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

