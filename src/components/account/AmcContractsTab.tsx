'use client';

import React from 'react';
import { MOCK_AMC_CONTRACTS } from '../../data/accountData';
import { Building2, Calendar, ShieldCheck, Phone, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const AmcContractsTab: React.FC = () => {
  const contract = MOCK_AMC_CONTRACTS[0];

  const handleRequestEmergency = () => {
    alert('Emergency On-Site Technical Visit requested for MIDC Plant 1! Dispatch assigned within 2 hours.');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="font-black text-lg text-slate-900 leading-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            <span>B2B AMC & Maintenance Contracts</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Active annual hardware maintenance contracts & preventative service schedule
          </p>
        </div>

        <button
          onClick={handleRequestEmergency}
          className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center gap-1.5"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Request Emergency On-Site Visit</span>
        </button>
      </div>

      {/* Contract Details Card */}
      <div className="border-2 border-slate-900 bg-slate-950 text-white rounded-2xl p-6 shadow-xl space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              ACTIVE AMC PARTNER
            </span>
            <h4 className="font-extrabold text-lg text-white mt-1.5">{contract.title}</h4>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Contract ID: #{contract.contractId}</p>
          </div>

          <div className="text-right text-xs">
            <div className="text-slate-400 font-bold text-[10px] uppercase">VALIDITY PERIOD</div>
            <div className="text-amber-400 font-bold">{contract.validFrom} to {contract.validTo}</div>
          </div>
        </div>

        {/* Visit Counter */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400 font-bold">Preventative Maintenance Visits:</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              {contract.completedVisits} of {contract.totalVisits} Quarterly Visits Completed
            </div>
          </div>

          <div className="text-xs text-slate-300 font-bold bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Next Visit: <strong>{contract.nextScheduledVisit}</strong></span>
          </div>
        </div>

        {/* Covered Asset Inventory */}
        <div className="space-y-2">
          <h5 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
            Covered Assets Inventory Under AMC:
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {contract.coveredAssets.map((asset, i) => (
              <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
                <div className="text-2xl font-black text-amber-400">{asset.count}</div>
                <div className="text-[11px] text-slate-300 font-bold mt-0.5">{asset.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
