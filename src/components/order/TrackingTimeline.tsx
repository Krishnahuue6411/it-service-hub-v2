'use client';

import React from 'react';
import { TrackingStep } from '../../types';
import { Check, PackageCheck, Truck, ShieldCheck, Phone, MessageSquare, User } from 'lucide-react';

interface TrackingTimelineProps {
  steps: TrackingStep[];
  technicianName: string;
  technicianPhone: string;
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({
  steps,
  technicianName,
  technicianPhone,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Header & Technician Call Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="font-black text-lg text-slate-900 leading-tight flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <span>Live Order Dispatch & Setup Tracking</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Blinkit-style real-time delivery status for Ahilyanagar MIDC
          </p>
        </div>

        {/* Assigned Technician Quick Contact Card */}
        <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center gap-3 self-start sm:self-auto border border-slate-800 shadow">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Assigned Field Specialist
            </div>
            <div className="text-xs font-black text-white">{technicianName}</div>
          </div>
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
            <a
              href={`tel:${technicianPhone}`}
              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
              title="Call Technician"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
            <a
              href={`https://wa.me/${technicianPhone.replace(/\D/g, '')}?text=Hi%20Vikram,%20checking%20status%20of%20order%20IT-SH-2026-8894`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
              title="WhatsApp Technician"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 4-Stage Stepper Visual Bar */}
      <div className="relative pt-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step, idx) => {
            return (
              <div
                key={step.id}
                className={`p-4 rounded-2xl border-2 transition-all relative flex flex-col justify-between ${
                  step.isActive
                    ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-md'
                    : step.isCompleted
                    ? 'border-slate-300 bg-slate-50'
                    : 'border-slate-200 bg-white opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                      step.isCompleted
                        ? 'bg-emerald-600 text-white'
                        : step.isActive
                        ? 'bg-amber-400 text-slate-950 animate-bounce'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {step.isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
                    </span>

                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      {step.timestamp}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-xs text-slate-900">{step.title}</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 leading-tight">
                    {step.subtitle}
                  </p>
                </div>

                {step.isActive && (
                  <div className="mt-3 pt-2 border-t border-emerald-200 flex items-center gap-1.5 text-[10px] font-black text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                    <span>Active In-Transit Stage</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
