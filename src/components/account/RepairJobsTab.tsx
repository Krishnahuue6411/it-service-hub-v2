'use client';

import React, { useState } from 'react';
import { MOCK_REPAIR_JOBS } from '../../data/accountData';
import { Wrench, Phone, MessageSquare, Plus, Check, Monitor, X, ShieldCheck } from 'lucide-react';

export const RepairJobsTab: React.FC = () => {
  const [showAnyDeskModal, setShowAnyDeskModal] = useState(false);
  const [anyDeskId, setAnyDeskId] = useState('');
  const [issueSummary, setIssueSummary] = useState('');

  const handleSupportRequest = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Remote Technical Support Ticket created! Technician assigned for AnyDesk ID: ${anyDeskId}`);
    setShowAnyDeskModal(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="font-black text-lg text-slate-900 leading-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-500" />
            <span>Live Repair Job Cards & Service Status</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time status of laptops, CCTV DVRs, and printers undergoing workshop repair
          </p>
        </div>

        <button
          onClick={() => setShowAnyDeskModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-amber-400 stroke-[3]" />
          <span>Log Repair / Remote Ticket</span>
        </button>
      </div>

      {/* Active Job Cards */}
      <div className="space-y-6">
        {MOCK_REPAIR_JOBS.map((job) => (
          <div
            key={job.ticketId}
            className="border-2 border-amber-400/80 bg-amber-50/20 rounded-2xl p-5 shadow-sm space-y-4"
          >
            {/* Ticket Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-900 text-amber-400 font-mono text-[10px] font-black px-2 py-0.5 rounded">
                    #{job.ticketId}
                  </span>
                  <span className="text-xs font-bold text-slate-500">Received: {job.receivedDate}</span>
                </div>
                <h4 className="font-extrabold text-base text-slate-900 mt-1">{job.deviceName}</h4>
                <p className="text-xs text-slate-600 font-medium mt-0.5">{job.problemDescription}</p>
              </div>

              {/* Technician Contact Box */}
              <div className="p-2.5 bg-slate-900 text-white rounded-xl flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                <div className="text-[11px]">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Technician</div>
                  <div className="font-bold text-white">{job.assignedTechnician}</div>
                </div>
                <div className="flex gap-1 pl-2 border-l border-slate-700">
                  <a
                    href={`tel:${job.technicianPhone}`}
                    className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`https://wa.me/${job.technicianPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Visual 4-Step Stepper */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 flex justify-between">
                <span>Current Stage: <strong className="text-amber-700">{job.statusText}</strong></span>
                <span>Estimated Cost: <strong className="text-slate-950">₹{job.estimatedCost.toLocaleString()}</strong></span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs font-extrabold">
                <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl border border-emerald-300">
                  1. Received at Workshop ✓
                </div>
                <div className="p-3 bg-amber-400 text-slate-950 rounded-xl shadow ring-2 ring-amber-400/40 animate-pulse">
                  2. In Diagnosis & Quote ⚡
                </div>
                <div className="p-3 bg-slate-100 text-slate-400 rounded-xl">
                  3. Repairing & Testing
                </div>
                <div className="p-3 bg-slate-100 text-slate-400 rounded-xl">
                  4. Ready for Pick / Dispatch
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* AnyDesk / Remote Support Request Modal */}
      {showAnyDeskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-900 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-amber-500" />
                <span>Request Remote AnyDesk Technical Support</span>
              </h3>
              <button onClick={() => setShowAnyDeskModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSupportRequest} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">9-Digit AnyDesk / TeamViewer ID</label>
                <input
                  type="text"
                  value={anyDeskId}
                  onChange={(e) => setAnyDeskId(e.target.value)}
                  placeholder="e.g. 984 210 334"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono text-slate-900 focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Issue Description / Symptoms</label>
                <textarea
                  rows={3}
                  value={issueSummary}
                  onChange={(e) => setIssueSummary(e.target.value)}
                  placeholder="Describe your printer connectivity or DVR software issue..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none text-slate-900 focus:border-amber-400"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs py-3 rounded-xl shadow transition"
                >
                  Connect Remote Support Technician Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
