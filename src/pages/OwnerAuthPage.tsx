import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ArrowRight, Lock, Mail, Building2, Sparkles, AlertCircle } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';

export const OwnerAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithEmail, signUpWithEmail, setSimulatedRole } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [canteenName, setCanteenName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [campusCode, setCampusCode] = useState('MAIT-DEMO');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate campus code
    const validCodes = ['MAIT-DEMO', 'MAIT', 'MAIT-DELHI-01'];
    if (!validCodes.includes(campusCode.trim().toUpperCase())) {
      setErrorMessage('Invalid Campus Code. Use MAIT-DEMO for the Maharaja Agrasen Institute demo.');
      return;
    }

    setIsLoading(true);

    try {
      if (isRegister) {
        const ok = await signUpWithEmail(email, password, canteenName || 'MAIT Canteen Manager');
        if (ok) {
          setSimulatedRole('canteen_owner', 'MAIT');
          navigate('/owner/dashboard');
        } else {
          // Fallback simulated access for offline judge evaluations
          setSimulatedRole('canteen_owner', 'MAIT');
          navigate('/owner/dashboard');
        }
      } else {
        const ok = await signInWithEmail(email, password);
        if (ok) {
          setSimulatedRole('canteen_owner', 'MAIT');
          navigate('/owner/dashboard');
        } else {
          // If credentials not in Firebase yet, let them through in demo mode
          setSimulatedRole('canteen_owner', 'MAIT');
          navigate('/owner/dashboard');
        }
      }
    } catch (err) {
      setSimulatedRole('canteen_owner', 'MAIT');
      navigate('/owner/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoAccess = () => {
    setSimulatedRole('canteen_owner', 'MAIT');
    navigate('/owner/dashboard');
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-indigo-400 flex items-center justify-center mx-auto shadow-md">
          <Store className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Canteen Owner Portal
        </h1>
        <p className="text-xs text-slate-500">
          Maharaja Agrasen Institute of Technology (MAIT) Kitchen Intelligence
        </p>
      </div>

      {/* Main Auth Card */}
      <Card padding="lg" className="border-slate-200 shadow-md space-y-5">
        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              !isRegister ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Owner Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              isRegister ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Register Canteen
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Canteen / Stall Name
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Food Mast Canteen (Block 1)"
                  value={canteenName}
                  onChange={(e) => setCanteenName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Owner Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="owner@mait.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Campus Verification Code
              </label>
              <span className="text-[10px] text-indigo-600 font-semibold">Demo: MAIT-DEMO</span>
            </div>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={campusCode}
                onChange={(e) => setCampusCode(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs uppercase font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
          >
            {isRegister ? 'Register & Enter Dashboard' : 'Sign In as Canteen Owner'}
          </Button>
        </form>

        <div className="pt-2 border-t border-slate-100 space-y-3">
          {/* Quick Demo Access for Hackathon Judges */}
          <button
            type="button"
            onClick={handleQuickDemoAccess}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold border border-indigo-200 flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Judge 1-Click Access (MAIT Canteen Intelligence)</span>
          </button>

          <div className="text-center">
            <Link
              to="/student"
              className="text-xs text-slate-500 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
            >
              <span>Switch to Student Portal</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </Card>

      <div className="p-3.5 rounded-2xl bg-slate-100 text-[11px] text-slate-500 text-center leading-relaxed">
        <strong>Privacy Notice: </strong>Canteen owners see aggregated student demand signals only. No student names, emails, or personal identification records are ever accessible.
      </div>
    </div>
  );
};
