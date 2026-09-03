'use client';

import React from 'react';
import { MOCK_JOB_CARDS, MOCK_ADMIN_PRODUCTS, MOCK_AMC_RECORDS } from '../../data/adminData';
import { 
  TrendingUp, 
  Wrench, 
  Building2, 
  AlertTriangle, 
  ArrowUpRight, 
  PackageCheck, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

export const OverviewModule: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* 4 Dynamic Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Monthly Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Monthly Store Revenue</span>
            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +14% MoM
            </span>
          </div>
          <div className="text-2xl font-black text-slate-950">₹1,84,500</div>
          <div className="text-[11px] text-slate-400 font-medium">Includes B2B GST sales & local AMC fees</div>
        </div>

        {/* KPI 2: Active Repair Jobs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Active Workshop Repairs</span>
            <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-black">
              8 Jobs
            </span>
          </div>
          <div className="text-2xl font-black text-slate-950">8 In-Progress</div>
          <div className="text-[11px] text-amber-700 font-bold">2 Waiting for OEM parts delivery</div>
        </div>

        {/* KPI 3: Active AMC Contracts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>Active AMC Contracts</span>
            <span className="text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full font-black">
              14 MIDC
            </span>
          </div>
          <div className="text-2xl font-black text-slate-950">14 Factories</div>
          <div className="text-[11px] text-slate-500 font-medium">MIDC Nagapur & Ahilyanagar Plants</div>
        </div>

        {/* KPI 4: Low Stock Alerts */}
        <div className="bg-white border-2 border-rose-200 bg-rose-50/30 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-rose-800 font-bold">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
          </div>
          <div className="text-2xl font-black text-rose-950">3 Items Low</div>
          <div className="text-[11px] text-rose-700 font-extrabold">Crucial NVMe 512GB & Hikvision Dome</div>
        </div>

      </div>

      {/* Recent Digital Repair Tickets Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-500" />
            <span>Recent Repair Job Cards (Live Status)</span>
          </h3>
          <span className="text-xs text-slate-500 font-bold">Showing latest 3 workshop tickets</span>
        </div>

        <div className="divide-y divide-slate-100">
          {MOCK_JOB_CARDS.map((job) => (
            <div key={job.jobId} className="py-3 first:pt-0 flex items-center justify-between gap-4 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    #{job.jobId}
                  </span>
                  <strong className="text-slate-900">{job.deviceModel}</strong>
                </div>
                <div className="text-slate-500 font-medium mt-0.5">
                  Client: {job.clientName} • Issue: {job.reportedIssue}
                </div>
              </div>

              <div className="text-right shrink-0 space-y-1">
                <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full block">
                  {job.status}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">Tech: {job.assignedTechnician}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
