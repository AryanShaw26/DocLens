import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle, ArrowRight, AlertTriangle, PhoneCall } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const DisclaimerPage = () => {
  const { acceptDisclaimer } = useAuth();
  const navigate = useNavigate();

  const handleAccept = () => {
    acceptDisclaimer();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 sm:px-12 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white rounded-3xl border border-slate-200/90 clinical-shadow p-8 sm:p-12 animate-fade-in">
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
              Mandatory Informational Notice
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              DocLens Clinical Disclaimer
            </h1>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-y border-slate-100 py-6 my-6">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-950 font-medium">
            <h4 className="font-bold flex items-center gap-2 mb-1 text-sm text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              Not a Diagnostic Tool or Medical Provider
            </h4>
            <p className="text-xs text-rose-900/90 leading-relaxed">
              DocLens is an assistive health-information software designed solely to extract, organize, and explain laboratory values against configured reference ranges. It does NOT deliver medical diagnoses, treatment plans, prescriptions, or prognostic determinations.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900">Please carefully acknowledge the following:</h4>
            <ul className="space-y-2.5 list-disc pl-5">
              <li>
                <strong>Physician Consultation:</strong> All insights, flags, and review priority scores must be evaluated by a qualified medical professional who has access to your full physical examination and medical history.
              </li>
              <li>
                <strong>No Medication Advice:</strong> Never start, stop, or adjust prescription medications or supplements based on DocLens outputs without explicit consultation from your doctor.
              </li>
              <li>
                <strong>Laboratory Reference Variations:</strong> Reference ranges may differ between individual laboratories, geographical regions, patient age, and biological sex. DocLens uses standard clinical benchmarks that may differ from your testing laboratory.
              </li>
              <li>
                <strong>Emergency Symptoms:</strong> If you are experiencing chest pain, shortness of breath, acute neurological deficits, severe abdominal pain, or any life-threatening symptoms, immediately dial emergency services (e.g. 911 / 112) or go to the nearest emergency room.
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            By proceeding, you agree that you understand DocLens is an educational informational assistant.
          </p>

          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto shrink-0"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={handleAccept}
          >
            I Understand & Agree
          </Button>
        </div>
      </div>
    </div>
  );
};

