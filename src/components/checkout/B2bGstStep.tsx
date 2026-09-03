'use client';

import React, { useState } from 'react';
import { B2BProfile } from '../../types';
import { Building2, CheckCircle2, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';

interface B2bGstStepProps {
  isGstRequired: boolean;
  setIsGstRequired: (req: boolean) => void;
  b2bProfile: B2BProfile;
  setB2bProfile: React.Dispatch<React.SetStateAction<B2BProfile>>;
  onNext: () => void;
  onPrev: () => void;
}

export const B2bGstStep: React.FC<B2bGstStepProps> = ({
  isGstRequired,
  setIsGstRequired,
  b2bProfile,
  setB2bProfile,
  onNext,
  onPrev,
}) => {
  const [gstinInput, setGstinInput] = useState(b2bProfile.gstin || '');

  // 15-character GSTIN regex validation pattern
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  const handleGstinChange = (val: string) => {
    const uppercaseVal = val.toUpperCase().replace(/[^0-9A-Z]/g, '');
    setGstinInput(uppercaseVal);

    const isValid = gstinRegex.test(uppercaseVal);
    setB2bProfile((prev) => ({
      ...prev,
      gstin: uppercaseVal,
      isValidGstin: isValid,
    }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h3 className="font-black text-lg text-slate-900 leading-tight flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
              2
            </span>
            <span>B2B Tax Invoicing & GST Input Credit</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Essential for factories & businesses claiming 18% GSTR-3B tax credit
          </p>
        </div>

        <span className="bg-emerald-100 text-emerald-800 font-black text-xs px-3 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> 18% Tax Savings
        </span>
      </div>

      {/* Toggle Option */}
      <label className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:border-amber-400 transition">
        <input
          type="checkbox"
          checked={isGstRequired}
          onChange={(e) => setIsGstRequired(e.target.checked)}
          className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer mt-0.5"
        />
        <div>
          <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <span>Require Tax Invoice for GST Input Credit</span>
            <span className="bg-slate-900 text-amber-400 font-mono text-[10px] px-2 py-0.5 rounded">
              B2B Billing
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Check this box to input your GSTIN and Firm Name. A valid GST tax invoice with HSN codes will be included with your package.
          </p>
        </div>
      </label>

      {/* Expanded GST Form */}
      {isGstRequired && (
        <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-4 animate-in fade-in duration-200 border border-slate-800">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h4 className="font-extrabold text-sm text-white">Registered Business Profile</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
            <div>
              <label className="block text-slate-300 mb-1">Company / Firm Registered Name</label>
              <input
                type="text"
                value={b2bProfile.companyName}
                onChange={(e) => setB2bProfile((prev) => ({ ...prev, companyName: e.target.value }))}
                placeholder="e.g. PAIS Printing & Trading Pvt Ltd"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">
                15-Character GSTIN (Auto-Validating)
              </label>
              <input
                type="text"
                maxLength={15}
                value={gstinInput}
                onChange={(e) => handleGstinChange(e.target.value)}
                placeholder="e.g. 27AAAAA0000A1Z5"
                className={`w-full px-3 py-2 bg-slate-800 border rounded-xl font-mono text-white outline-none ${
                  gstinInput.length === 15 && b2bProfile.isValidGstin
                    ? 'border-emerald-500 ring-1 ring-emerald-500'
                    : 'border-slate-700 focus:border-amber-400'
                }`}
              />
            </div>
          </div>

          {/* Validation Feedback Badge */}
          {gstinInput.length > 0 && (
            <div className="text-xs">
              {b2bProfile.isValidGstin ? (
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    GSTIN Format Verified (State 27 • Maharashtra Trade Entity)
                  </span>
                  <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-black">
                    VALIDATED
                  </span>
                </div>
              ) : (
                <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>Entering 15-character GSTIN (Format: 27AAAAA0000A1Z5)</span>
                </div>
              )}
            </div>
          )}

          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Official GST Tax Invoice will be sent to your registered email & included inside shipment.</span>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onPrev}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
        >
          ← Back to Address
        </button>

        <button
          onClick={onNext}
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5"
        >
          <span>Continue to Payment Method →</span>
        </button>
      </div>

    </div>
  );
};
