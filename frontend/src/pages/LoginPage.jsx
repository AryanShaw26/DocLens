import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Left Form Section */}
      <div className="flex-1 flex flex-col justify-between p-8 sm:p-12 lg:p-16 max-w-xl mx-auto w-full">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-medical-800 to-medical-600 flex items-center justify-center text-white shadow-sm">
              <Activity className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">DocLens</span>
          </Link>
        </div>

        <div className="my-10">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign in to DocLens
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Access your medical analyses, report history, and clinical insights.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-medical-500 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-medical-500 focus:bg-white rounded-xl pl-10 pr-11 py-3 text-sm text-slate-900 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Credentials helper */}
          <div className="mt-6 p-3.5 rounded-xl bg-medical-50/70 border border-medical-100 text-xs text-medical-900">
            <span className="font-bold flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-medical-600" /> Hackathon Fast Login / Demo:
            </span>
            <p className="text-[11px] text-slate-600">
              New here? You can register in seconds, or click below to create an instant account.
            </p>
          </div>

          <div className="mt-8 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-medical-700 font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Secure, encrypted medical data management. Non-diagnostic informational product.
        </div>
      </div>

      {/* Right Product Showcase Banner */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-medical-900 via-medical-800 to-slate-950 p-16 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Patient-First Clinical Intelligence</span>
        </div>

        <div className="max-w-md">
          <h2 className="text-3xl font-extrabold tracking-tight leading-snug">
            "The patient should understand what happened, why it matters, and what to do next."
          </h2>
          <p className="mt-4 text-sm text-slate-300 leading-relaxed">
            DocLens bridges the communication gap between raw clinical metrics and everyday health awareness.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-xs text-slate-300">
          <p className="font-semibold text-white">Continuous Deterministic Safety</p>
          <p className="mt-1">
            Every test result is independently normalized and checked against peer-reviewed laboratory limits.
          </p>
        </div>
      </div>
    </div>
  );
};

