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
import { loginClient } from '../../actions/client-portal-actions';

export default function SmartLoginPage() {
  const router = useRouter();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redirectingTo, setRedirectingTo] = useState<string | null>(null);

  // Handle Login Authentication & Smart Redirection
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim() || !password.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setRedirectingTo(null);

    try {
      const res = await loginClient(emailOrPhone, password);

      if (res.success && res.redirectUrl) {
        setRedirectingTo(res.redirectUrl);
        // Instant redirect based on client's assigned business_type
        setTimeout(() => {
          router.push(res.redirectUrl);
        }, 400);
      } else {
        setErrorMessage(res.error || 'Invalid credentials or account suspended.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
      setIsLoading(false);
    }
  };

  // Quick Demo Auto-Fill
  const handleQuickDemoFill = (email: string) => {
    setEmailOrPhone(email);
    setPassword('Welcome@123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-amber-400 selection:text-slate-950">
      
      {/* Container Box */}
      <div className="w-full max-w-md space-y-6">
        
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-xs font-mono text-amber-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Multi-Tenant Business Portal</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white">
            Client Portal Login
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Log in once &ndash; the smart engine auto-detects your business type and directs you to your software
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
          
          {/* Status / Error Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {redirectingTo && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <div className="font-bold">
                Access Verified! Routing to <code className="text-white font-mono">{redirectingTo}</code>...
              </div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            
            {/* Email or Phone Input */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="e.g. xerox@shreeprint.com or 9822114455"
                  className="w-full pl-9 pr-3.5 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 transition"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Account Password
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
              disabled={isLoading || Boolean(redirectingTo)}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-[0.99] disabled:opacity-50 text-slate-950 font-black rounded-2xl text-xs shadow-xl transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Verifying & Routing...' : 'Log In to My Business Portal'}</span>
            </button>

          </form>

          {/* Quick Demo Pre-fills */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">
              1-Click Demo Credentials (Test Auto-Routing)
            </div>

            <div className="grid grid-cols-1 gap-2">
              
              <button
                type="button"
                onClick={() => handleQuickDemoFill('xerox@shreeprint.com')}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center">
                    <Copy className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-[11px] leading-tight">Shree Xerox Center</div>
                    <div className="text-[10px] text-slate-500 font-mono">business_type: 'XEROX'</div>
                  </div>
                </div>
                <div className="text-[10px] text-cyan-400 font-mono font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  <span>/portal/xerox</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoFill('press@omkarpress.com')}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center">
                    <Printer className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-[11px] leading-tight">Omkar Printing Press</div>
                    <div className="text-[10px] text-slate-500 font-mono">business_type: 'PRINTING_PRESS'</div>
                  </div>
                </div>
                <div className="text-[10px] text-indigo-400 font-mono font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  <span>/dashboard/billing/new</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoFill('erp@mahavirretail.com')}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl transition flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-950 text-amber-400 flex items-center justify-center">
                    <Store className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-[11px] leading-tight">Mahavir Retail & IT ERP</div>
                    <div className="text-[10px] text-slate-500 font-mono">business_type: 'RETAIL_ERP'</div>
                  </div>
                </div>
                <div className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  <span>/dashboard</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>

            </div>
          </div>

        </div>

        {/* Footer Admin Link */}
        <div className="text-center text-xs text-slate-500">
          Super Administrator?{' '}
          <Link href="/admin/clients" className="text-amber-400 hover:underline font-bold">
            Open Master Client Console &rarr;
          </Link>
        </div>

      </div>

    </div>
  );
}
