'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LogIn,
  Lock,
  Mail,
  Copy,
  Printer,
  Store,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { loginClient } from '../../actions/client-actions';

export default function SmartLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redirectNotice, setRedirectNotice] = useState<string | null>(null);

  // Handle Form Submission & Dynamic Client-Type Routing
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setRedirectNotice(null);

    try {
      const res = await loginClient(email, password);

      if (res.success && res.redirectUrl) {
        setRedirectNotice(res.redirectUrl);
        // Instant client-type redirection
        setTimeout(() => {
          router.push(res.redirectUrl);
        }, 350);
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please check credentials.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
      setIsLoading(false);
    }
  };

  // Quick 1-click test credential fill
  const handleQuickFill = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('Welcome@123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-amber-400 selection:text-slate-950">
      
      <div className="w-full max-w-md space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-xs font-mono text-amber-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Multi-Tenant Business Portal</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white">
            Client Portal Login
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Log in through a single portal &ndash; you will immediately be routed to your designated business experience
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
          
          {/* Inactive or Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Successful Redirect Indicator */}
          {redirectNotice && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <div className="font-bold">
                Redirecting to <code className="text-white font-mono">{redirectNotice}</code>...
              </div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. xerox@shreeprint.com"
                  className="w-full pl-9 pr-3.5 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 transition"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Password
                </label>
                <span className="text-[10px] text-slate-500">Default: Welcome@123</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-3 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 transition"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || Boolean(redirectNotice)}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-[0.99] disabled:opacity-50 text-slate-950 font-black rounded-2xl text-xs shadow-xl transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Portal'}</span>
            </button>

          </form>

          {/* Quick Demo Pre-fills */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">
              1-Click Demo Accounts (Test Dynamic Routing)
            </div>

            <div className="grid grid-cols-1 gap-2">
              
              {/* Xerox Client */}
              <button
                type="button"
                onClick={() => handleQuickFill('xerox@shreeprint.com')}
                className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center">
                    <Copy className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-[11px]">Shree Xerox Center</div>
                    <div className="text-[10px] text-slate-500 font-mono">business_type: &apos;XEROX&apos;</div>
                  </div>
                </div>
                <div className="text-[10px] text-cyan-400 font-mono font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  <span>/portal/xerox</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>

              {/* Printing Press Client */}
              <button
                type="button"
                onClick={() => handleQuickFill('press@omkarpress.com')}
                className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center">
                    <Printer className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-[11px]">Omkar Printing Press</div>
                    <div className="text-[10px] text-slate-500 font-mono">business_type: &apos;PRINTING_PRESS&apos;</div>
                  </div>
                </div>
                <div className="text-[10px] text-indigo-400 font-mono font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  <span>/dashboard/billing/new</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>

              {/* Retail ERP Client */}
              <button
                type="button"
                onClick={() => handleQuickFill('erp@mahavirretail.com')}
                className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 rounded-xl transition flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-950 text-amber-400 flex items-center justify-center">
                    <Store className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-[11px]">Mahavir Retail ERP</div>
                    <div className="text-[10px] text-slate-500 font-mono">business_type: &apos;RETAIL_ERP&apos;</div>
                  </div>
                </div>
                <div className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  <span>/dashboard</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>

              {/* Super Admin */}
              <button
                type="button"
                onClick={() => handleQuickFill('admin@it-hub.com')}
                className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-[11px]">Super Administrator</div>
                    <div className="text-[10px] text-slate-500 font-mono">admin master</div>
                  </div>
                </div>
                <div className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  <span>/admin/clients</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
