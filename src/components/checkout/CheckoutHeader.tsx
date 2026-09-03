'use client';

import React from 'react';
import { Lock, ShieldCheck, Headphones, ArrowLeft, Check } from 'lucide-react';

interface CheckoutHeaderProps {
  currentStep: number; // 1, 2, 3, 4
  onStepClick: (step: number) => void;
}

export const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({
  currentStep,
  onStepClick,
}) => {
  const steps = [
    { num: 1, label: 'Delivery Address' },
    { num: 2, label: 'Business / GST' },
    { num: 3, label: 'Payment Method' },
    { num: 4, label: 'Review & Pay' },
  ];

  const handleExit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Are you sure you want to leave checkout? Your items will remain saved in your cart.')) {
      window.location.href = '/cart';
    }
  };

  return (
    <header className="bg-[#0F172A] text-white sticky top-0 z-50 shadow-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo + Exit Warning */}
        <a href="/cart" onClick={handleExit} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-amber-400 text-base shadow">
            IT
          </div>
          <div>
            <div className="font-extrabold text-sm text-white leading-none flex items-center gap-1 group-hover:text-amber-400 transition">
              <ArrowLeft className="w-3.5 h-3.5" /> IT SERVICE HUB
            </div>
            <div className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">
              Secure Checkout
            </div>
          </div>
        </a>

        {/* Center: Step Progress Indicator */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4 text-xs">
          {steps.map((s, idx) => {
            const isDone = currentStep > s.num;
            const isActive = currentStep === s.num;

            return (
              <React.Fragment key={s.num}>
                {idx > 0 && (
                  <div className={`w-8 lg:w-12 h-0.5 ${currentStep >= s.num ? 'bg-amber-400' : 'bg-slate-700'}`} />
                )}
                <button
                  onClick={() => s.num < currentStep && onStepClick(s.num)}
                  disabled={s.num > currentStep}
                  className={`flex items-center gap-2 px-2.5 py-1 rounded-xl transition ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                      : isDone
                      ? 'bg-slate-800 text-emerald-400 font-bold hover:bg-slate-700'
                      : 'text-slate-500 font-medium cursor-not-allowed'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isActive ? 'bg-slate-950 text-amber-400' : isDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : s.num}
                  </span>
                  <span className="hidden lg:inline">{s.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Right: Security Padlock & Hotline */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit SSL Encrypted</span>
          </div>

          <a
            href="https://wa.me/918787828888?text=Need%20help%20with%20checkout%20on%20IT%20Service%20Hub"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold transition shadow"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">WhatsApp Help</span>
          </a>
        </div>

      </div>
    </header>
  );
};
