import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, User, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, fullName);
      navigate('/disclaimer');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
              Create your account
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Start transforming complex diagnostic reports into clear, structured insights.
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
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-medical-500 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none transition-all"
                />
              </div>
            </div>

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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-medical-500 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none transition-all"
                />
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
              Create Account
            </Button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-medical-700 font-bold hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          By registering, you agree to our non-diagnostic medical terms and clinical informational policy.
        </div>
      </div>

      {/* Right Product Showcase Banner */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-medical-900 via-medical-800 to-slate-950 p-16 flex-col justify-between text-white relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Patient-First Clinical Intelligence</span>
        </div>

        <div className="max-w-md">
          <h2 className="text-3xl font-extrabold tracking-tight leading-snug">
            Your Online Medical Officer
          </h2>
          <p className="mt-4 text-sm text-slate-300 leading-relaxed">
            Gain immediate insight into blood, metabolic, lipid, kidney, and liver panels with complete reference range clarity.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-xs text-slate-300">
          <p className="font-semibold text-white">Strict Security Standard</p>
          <p className="mt-1">
            JWT session authentication, password hashing, and zero hard-coded credentials protect your account.
          </p>
        </div>
      </div>
    </div>
  );
};

