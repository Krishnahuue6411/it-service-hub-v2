'use client';

import React, { useState } from 'react';
import { SpecItem } from '../../types';
import { Table, Wrench, Download, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

interface TechSpecsTabsProps {
  specsTable: SpecItem[];
  installationSteps: string[];
  productName: string;
}

export const TechSpecsTabs: React.FC<TechSpecsTabsProps> = ({
  specsTable,
  installationSteps,
  productName,
}) => {
  const [activeTab, setActiveTab] = useState<'specs' | 'installation' | 'downloads'>('specs');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
      
      {/* Tab Buttons */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto scrollbar-none pb-2">
        <button
          onClick={() => setActiveTab('specs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'specs'
              ? 'bg-slate-950 text-amber-400 shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Technical Details & Specs</span>
        </button>

        <button
          onClick={() => setActiveTab('installation')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'installation'
              ? 'bg-slate-950 text-amber-400 shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Compatibility & Fitting Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('downloads')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'downloads'
              ? 'bg-slate-950 text-amber-400 shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Datasheet & Warranty Downloads</span>
        </button>
      </div>

      {/* TAB 1: Technical Details Table */}
      {activeTab === 'specs' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h4 className="font-extrabold text-slate-900 text-sm">
            Official Technical Specifications ({productName})
          </h4>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 text-xs">
            {specsTable.map((spec, idx) => (
              <div
                key={idx}
                className={`flex flex-col sm:flex-row p-3 ${
                  idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                }`}
              >
                <span className="w-full sm:w-60 font-bold text-slate-600 shrink-0">
                  {spec.label}
                </span>
                <span className="font-extrabold text-slate-900 mt-1 sm:mt-0">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Compatibility & Installation Guide */}
      {activeTab === 'installation' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-slate-900 text-sm">
              Step-by-Step Hardware Installation Guide
            </h4>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Free MIDC Technician Support
            </span>
          </div>

          <div className="space-y-3">
            {installationSteps.map((step, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <div className="text-xs text-slate-800 font-medium leading-relaxed pt-0.5">
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Datasheet & Warranty Downloads */}
      {activeTab === 'downloads' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h4 className="font-extrabold text-slate-900 text-sm">
            Official Datasheets & Direct Warranty Claim Process
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); alert('Downloading official product specification datasheet PDF...'); }}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-amber-400 transition flex items-center gap-3 group"
            >
              <div className="p-2.5 bg-rose-100 text-rose-700 rounded-lg group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-slate-900 group-hover:text-amber-600 transition">
                  Crucial P3 Plus Product Datasheet (PDF)
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Size: 1.8 MB • Version 2.4</div>
              </div>
            </a>

            <a
              href="#"
              onClick={(e) => { e.preventDefault(); alert('Direct 3-Year Brand Replacement warranty claim instructions loaded.'); }}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-amber-400 transition flex items-center gap-3 group"
            >
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-slate-900 group-hover:text-amber-600 transition">
                  3-Year Direct Replacement Warranty Guide
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Onsite Ahilyanagar RMA Process</div>
              </div>
            </a>
          </div>
        </div>
      )}

    </div>
  );
};
