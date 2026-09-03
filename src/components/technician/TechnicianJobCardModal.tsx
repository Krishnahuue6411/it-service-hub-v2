'use client';

import React, { useState } from 'react';
import { X, Wrench, Phone, MessageSquare, MapPin, CheckCircle2 } from 'lucide-react';
import { JobCardTicket, JobStatusType } from '../../types';

interface TechnicianJobCardModalProps {
  job: JobCardTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateJob: (updatedJob: JobCardTicket) => void;
}

export const TechnicianJobCardModal: React.FC<TechnicianJobCardModalProps> = ({
  job,
  isOpen,
  onClose,
  onUpdateJob,
}) => {
  const [techNotes, setTechNotes] = useState(job?.technicianNotes || '');
  const [status, setStatus] = useState<JobStatusType>(job?.status || 'Diagnosing');
  const [newPart, setNewPart] = useState('');
  const [partsList, setPartsList] = useState<string[]>(['Crucial 512GB NVMe SSD', 'Thermal Paste']);

  if (!isOpen || !job) return null;

  const statusOptions: JobStatusType[] = [
    'Received',
    'Diagnosing',
    'Approved / Parts Ordered',
    'Repaired',
    'Delivered / Closed',
  ];

  const handleAddPart = () => {
    if (newPart.trim()) {
      setPartsList([...partsList, newPart.trim()]);
      setNewPart('');
    }
  };

  const handleSave = () => {
    const updated: JobCardTicket = {
      ...job,
      status,
      technicianNotes: techNotes,
    };
    onUpdateJob(updated);
    alert(`Repair Job Card #${job.jobId} updated by Field Technician!`);
    onClose();
  };

  const handleWhatsAppUpdate = () => {
    const message = `IT Service Hub Workshop Update 🛠️\nJob Card #${job.jobId}\nDevice: ${job.deviceModel}\nNew Status: ${status}\nTech Notes: ${techNotes || 'Diagnostic work in progress.'}\nWhatsApp Support: +91 98765 43210`;
    window.open(`https://wa.me/91${job.clientPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <span>Technician Field Action</span>
              <span className="font-mono text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                #{job.jobId}
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Device: {job.deviceModel}</p>
          </div>
        </div>

        {/* Customer & Location Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
            <span>Customer: {job.clientName}</span>
            <div className="flex items-center gap-2">
              <a
                href={`tel:${job.clientPhone}`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-lg transition flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </a>

              <button
                type="button"
                onClick={handleWhatsAppUpdate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-lg transition flex items-center gap-1"
              >
                <MessageSquare className="w-3 h-3" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>M45 MIDC Nagapur Industrial Zone, Ahilyanagar</span>
          </div>

          <div className="text-xs text-slate-700 bg-white border border-slate-200 p-2.5 rounded-xl mt-2 font-medium">
            <span className="font-extrabold text-amber-600">Reported Issue: </span>
            {job.reportedIssue}
          </div>
        </div>

        {/* Status State Machine Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-900 block">
            Update Repair Stage
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as JobStatusType)}
            className="w-full text-xs font-extrabold p-3 rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 focus:border-amber-500 outline-none cursor-pointer"
          >
            {statusOptions.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* Technician Work Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-900 block">
            Technician Diagnostic Notes & Work Done
          </label>
          <textarea
            value={techNotes}
            onChange={(e) => setTechNotes(e.target.value)}
            placeholder="Document IC component replacements, OS reinstallation, RAM upgrade, or benchmark test results..."
            rows={3}
            className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:border-amber-500 outline-none font-medium"
          ></textarea>
        </div>

        {/* Parts Consumed List */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-900 block">
            Spare Parts Consumed / Installed
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPart}
              onChange={(e) => setNewPart(e.target.value)}
              placeholder="e.g. 512GB M.2 NVMe SSD"
              className="flex-1 text-xs p-2 rounded-xl border border-slate-200 outline-none font-medium"
            />
            <button
              type="button"
              onClick={handleAddPart}
              className="bg-slate-900 text-white font-bold text-xs px-3 py-2 rounded-xl"
            >
              + Add Part
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {partsList.map((part, i) => (
              <span key={i} className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                🔧 {part}
              </span>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition shadow flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save & Notify Customer</span>
          </button>
        </div>

      </div>
    </div>
  );
};
