'use client';

import React, { useState } from 'react';
import { AdminService, AMCRecord } from '../../types';
import { MOCK_ADMIN_SERVICES, MOCK_AMC_RECORDS } from '../../data/adminData';
import { Wrench, Building2, Plus, Calendar, Check, X } from 'lucide-react';

interface ServicesAmcModuleProps {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
}

export const ServicesAmcModule: React.FC<ServicesAmcModuleProps> = ({
  showAddModal,
  setShowAddModal,
}) => {
  const [services, setServices] = useState<AdminService[]>(MOCK_ADMIN_SERVICES);
  const [amcRecords, setAmcRecords] = useState<AMCRecord[]>(MOCK_AMC_RECORDS);

  // Form State for Add Service
  const [name, setName] = useState('');
  const [category, setCategory] = useState('CCTV Maintenance');
  const [description, setDescription] = useState('');
  const [baseFee, setBaseFee] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('2-3 Hours');
  const [amcFrequency, setAmcFrequency] = useState<'Quarterly' | 'Half-Yearly' | 'Annual'>('Quarterly');
  const [freeVisitsCount, setFreeVisitsCount] = useState('4');

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !baseFee) {
      alert('Please fill out service name and base fee');
      return;
    }

    const newSrv: AdminService = {
      id: `srv-${Date.now()}`,
      name,
      category,
      description,
      baseFee: Number(baseFee),
      estimatedHours,
      amcFrequency,
      freeVisitsCount: Number(freeVisitsCount),
      isActive: true,
    };

    setServices((prev) => [newSrv, ...prev]);
    setShowAddModal(false);
    alert(`Service "${name}" created successfully!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Services Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-black text-lg text-slate-900 leading-tight flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-500" />
              <span>B2B Services & AMC Package Catalog</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Define service offerings, hourly labor rates, and preventative AMC visit packages
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition shadow flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create B2B Service</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((s) => (
            <div key={s.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="bg-slate-900 text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                  {s.category}
                </span>
                <span className="text-emerald-700 font-black text-sm">₹{s.baseFee.toLocaleString()}</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">{s.name}</h4>
              <p className="text-xs text-slate-600 leading-snug">{s.description}</p>
              <div className="text-[11px] text-slate-500 font-bold flex justify-between pt-1 border-t border-slate-200">
                <span>Est Time: {s.estimatedHours}</span>
                <span>AMC: {s.amcFrequency} ({s.freeVisitsCount} Visits)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AMC Factory Records Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <h3 className="font-black text-lg text-slate-900 leading-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            <span>Active Factory AMC Client Contracts (14 Active)</span>
          </h3>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {amcRecords.map((amc) => (
            <div key={amc.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">{amc.companyName}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    {amc.status}
                  </span>
                </div>
                <div className="text-slate-500 font-medium mt-0.5">
                  Contact: {amc.clientName} • GSTIN: <strong className="font-mono text-slate-800">{amc.gstin}</strong>
                </div>
                <div className="text-slate-400 text-[10px] font-mono">Validity: {amc.validityRange}</div>
              </div>

              <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-right shrink-0">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Visits Status</div>
                <div className="font-black text-amber-400">{amc.completedVisits} of {amc.totalVisits} Visits Completed</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-900 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Create New B2B Service</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Service Title *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Industrial CCTV Maintenance"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Preventative service checklist details..."
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1">Base Service Fee (₹) *</label>
                  <input
                    type="number"
                    value={baseFee}
                    onChange={(e) => setBaseFee(e.target.value)}
                    placeholder="3500"
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Est Completion Hours</label>
                  <input
                    type="text"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    placeholder="3-4 Hours"
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1">AMC Frequency</label>
                  <select
                    value={amcFrequency}
                    onChange={(e) => setAmcFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-amber-400"
                  >
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Free Visits Count</label>
                  <input
                    type="number"
                    value={freeVisitsCount}
                    onChange={(e) => setFreeVisitsCount(e.target.value)}
                    placeholder="4"
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs py-3 rounded-xl shadow transition"
                >
                  Save Service Offering
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
