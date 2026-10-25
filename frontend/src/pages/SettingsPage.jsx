import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Shield, Bell, Trash2, Key, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="pb-4 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize notifications, review safety indicators, and configure clinical account rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 clinical-shadow p-6 sm:p-8 space-y-5">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Clinical Indicators & Units
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Standard Lab Unit System</p>
                <p className="text-xs text-slate-500">Show units in standard US / International clinical formats (mg/dL, g/dL, %)</p>
              </div>
              <span className="text-xs font-bold text-medical-700 bg-medical-50 px-3 py-1 rounded-lg border border-medical-200">
                Standard
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Concerning Combination Alerts</p>
                <p className="text-xs text-slate-500">Highlight multi-parameter risk patterns prominently</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded text-medical-600 focus:ring-medical-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Plain-Language Summaries</p>
                <p className="text-xs text-slate-500">Enable AI conversational explanation for medical findings</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded text-medical-600 focus:ring-medical-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button type="submit" variant="primary" size="sm">
              Save Preferences
            </Button>
            {saved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved successfully
              </span>
            )}
          </div>
        </div>

        {/* Data Management & Deletion */}
        <div className="bg-white rounded-3xl border border-slate-200/90 clinical-shadow p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-slate-900 text-rose-700">
            Account Management & Data Privacy
          </h3>
          <p className="text-xs text-slate-500">
            You can export your complete report history or permanently log out of your session.
          </p>
          <div className="pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={logout}
              className="text-rose-600 hover:bg-rose-50 border-rose-200"
            >
              Sign Out of Account
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

