'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Calculator,
  Calendar,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Download,
  Building2,
  DollarSign,
} from 'lucide-react';

export default function ReportsHubPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto text-slate-100">
      
      {/* Header */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-1">
        <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          Tax & Accounting Intelligence
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 mt-1">
          <FileText className="w-6 h-6 text-amber-400" />
          <span>CA Reports, GST Filings & Financial Analytics</span>
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Comprehensive statutory compliance, daily drawer cash reconciliations, and profit & loss statements
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: GST Reports */}
        <Link
          href="/dashboard/reports/gst"
          className="group bg-slate-950 border border-slate-800 hover:border-amber-400/50 p-6 rounded-3xl transition flex flex-col justify-between space-y-4 shadow-xl hover:scale-[1.01]"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-white group-hover:text-amber-400 transition">
              GST Tax Center (GSTR-1 & 3B)
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              CA-compliant Section 4 (B2B), Section 7 (B2C), and Section 12 (HSN summary) reports. One-click export to official GST offline Excel & JSON formats.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs font-bold text-amber-400">
            <span>View GST Reports</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </Link>

        {/* Card 2: Daybook */}
        <Link
          href="/dashboard/reports/daybook"
          className="group bg-slate-950 border border-slate-800 hover:border-blue-400/50 p-6 rounded-3xl transition flex flex-col justify-between space-y-4 shadow-xl hover:scale-[1.01]"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center text-blue-400">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-white group-hover:text-blue-400 transition">
              Daily Cashbook / Daybook
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time daily register of cash inflows, payouts, digital receipts (UPI/Bank), opening cash balance, and closing cash in drawer.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs font-bold text-blue-400">
            <span>Open Daybook Register</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </Link>

        {/* Card 3: P&L Statement */}
        <Link
          href="/dashboard/reports/profit-loss"
          className="group bg-slate-950 border border-slate-800 hover:border-emerald-400/50 p-6 rounded-3xl transition flex flex-col justify-between space-y-4 shadow-xl hover:scale-[1.01]"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-white group-hover:text-emerald-400 transition">
              Profit & Loss (P&L) Engine
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated sales turnover minus Cost of Goods Sold (COGS) based on inventory purchase prices. Gross margins, operational overheads, and net profit.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs font-bold text-emerald-400">
            <span>Analyze P&L Margins</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </Link>

      </div>

    </div>
  );
}
