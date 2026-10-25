import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  FileText,
  GitCompare,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Upload,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';

export const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Overview', to: '/dashboard', icon: Activity },
    { label: 'My Reports', to: '/reports', icon: FileText },
    { label: 'Compare Reports', to: '/compare', icon: GitCompare },
    { label: 'Profile', to: '/profile', icon: User },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Universal Safety Banner */}
      <div className="bg-medical-950 text-slate-300 text-[11px] px-4 py-1.5 flex items-center justify-between border-b border-medical-900 select-none">
        <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-500 shrink-0" />
          <span>
            <strong>DocLens Medical Assistant:</strong> Information is non-diagnostic and does not replace evaluation by a qualified doctor.
          </span>
        </div>
        <Link
          to="/disclaimer"
          className="hidden sm:inline-block text-accent-400 hover:text-white underline text-[11px] ml-4 transition-colors"
        >
          View Disclaimer
        </Link>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/90 shrink-0">
          {/* Logo & Brand */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-medical-800 to-medical-600 flex items-center justify-center text-white shadow-md shadow-medical-900/10">
              <Activity className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
                DocLens
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-medical-600">
                Online Medical Officer
              </span>
            </div>
          </div>

          {/* Quick Action Upload */}
          <div className="p-4">
            <Button
              variant="primary"
              size="md"
              className="w-full shadow-sm"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={() => navigate('/upload')}
            >
              Upload Report
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                      isActive
                        ? 'bg-medical-50 text-medical-800 shadow-sm shadow-medical-100/50'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Account / Footer */}
          <div className="p-3 border-t border-slate-100">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-9 h-9 rounded-full bg-medical-100 text-medical-800 font-bold flex items-center justify-center text-sm shrink-0">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.full_name || 'Patient'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar for Mobile & Desktop Utility */}
          <header className="h-16 bg-white/80 backdrop-blur border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="font-semibold text-slate-800">DocLens Workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="capitalize font-medium text-medical-700">
                  {location.pathname.replace('/', '') || 'Overview'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                className="hidden sm:inline-flex"
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                onClick={() => navigate('/upload?mode=demo')}
              >
                Try Demo Report
              </Button>
            </div>
          </header>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 shadow-lg animate-slide-up">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold',
                        isActive
                          ? 'bg-medical-50 text-medical-800'
                          : 'text-slate-600 hover:bg-slate-50'
                      )
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-3">
                <span className="text-xs text-slate-500 truncate">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-600 font-semibold flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log out
                </button>
              </div>
            </div>
          )}

          {/* Page Canvas */}
          <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
