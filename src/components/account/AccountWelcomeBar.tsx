'use client';

import React from 'react';
import { UserProfile } from '../../types';
import { 
  Building2, 
  ShieldCheck, 
  Package, 
  Wrench, 
  Award, 
  CreditCard,
  Sparkles
} from 'lucide-react';

interface AccountWelcomeBarProps {
  user: UserProfile;
}

export const AccountWelcomeBar: React.FC<AccountWelcomeBarProps> = ({ user }) => {
  return (
    <div className="bg-gradient-to-r from-[#0F172A] via-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-6">
      
      {/* User Welcome Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shrink-0">
            SV
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[3]" />
                {user.accountTier}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Client ID: #{user.clientId}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              Welcome back, {user.fullName}!
            </h1>
            <p className="text-xs text-amber-400 font-bold flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>{user.companyName} (GSTIN: {user.gstin})</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-3 shrink-0 self-start md:self-auto">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-[10px] text-slate-400 font-mono uppercase">B2B Loyalty Rewards</div>
            <div className="text-amber-400 font-black text-sm">₹{user.b2bCreditPoints.toLocaleString()} Available Credit</div>
          </div>
        </div>

      </div>

      {/* Quick Metrics Strip (4 Stat Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
        
        <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-extrabold uppercase">Active Orders</div>
            <div className="text-white font-black text-sm">{user.activeOrdersCount} In-Transit</div>
          </div>
        </div>

        <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-400/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-extrabold uppercase">Open Repair Tickets</div>
            <div className="text-white font-black text-sm">{user.openRepairTicketsCount} In-Diagnosis</div>
          </div>
        </div>

        <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-400/20 text-blue-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-extrabold uppercase">AMC Contracts</div>
            <div className="text-white font-black text-sm">{user.activeAmcContractsCount} Active (Dec 2026)</div>
          </div>
        </div>

        <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-400/20 text-indigo-400 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-extrabold uppercase">B2B Credit Balance</div>
            <div className="text-amber-400 font-black text-sm">₹{user.b2bCreditPoints.toLocaleString()}</div>
          </div>
        </div>

      </div>

    </div>
  );
};
