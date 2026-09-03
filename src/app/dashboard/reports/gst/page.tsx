'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Download,
  FileSpreadsheet,
  FileCode,
  ArrowLeft,
  Building2,
  Table,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { Business, Gstr1Summary, Gstr3bSummary } from '../../../../types/erp';
import { getBusinessProfile, getGstr1Data, getGstr3bData } from '../../../../actions/erp-actions';
import { INITIAL_ERP_BUSINESS } from '../../../../lib/erp/erp-mock-data';

export default function GstReportsPage() {
  const [business, setBusiness] = useState<Business>(INITIAL_ERP_BUSINESS);
  const [activeTab, setActiveTab] = useState<'GSTR1' | 'GSTR3B'>('GSTR1');
  const [gstr1SubTab, setGstr1SubTab] = useState<'B2B' | 'B2C' | 'HSN'>('B2B');
  const [gstr1, setGstr1] = useState<Gstr1Summary | null>(null);
  const [gstr3b, setGstr3b] = useState<Gstr3bSummary | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [bData, g1Data, g3Data] = await Promise.all([
          getBusinessProfile(),
          getGstr1Data(),
          getGstr3bData(),
        ]);
        if (bData) setBusiness(bData);
        if (g1Data) setGstr1(g1Data);
        if (g3Data) setGstr3b(g3Data);
      } catch (err) {
        console.warn('GST reports fallback state:', err);
      }
    }
    loadData();
  }, []);

  // Export GSTR-1 as JSON (CA & GST Offline Tool Format)
  const handleExportJson = () => {
    if (!gstr1) return;
    const exportPayload = {
      gstin: business.gstin || '27AABCP1234F1Z5',
      fp: '082026', // August 2026
      version: 'GST_OFFLINE_TOOL_V1.3',
      hash: 'hash_' + Date.now(),
      b2b: gstr1.b2b_invoices.map((inv) => ({
        ctin: inv.customer_gstin,
        inv: [
          {
            inum: inv.invoice_number,
            idt: inv.invoice_date,
            val: inv.total_invoice_value,
            pos: '27',
            rchrg: 'N',
            inv_typ: 'R',
            itms: [
              {
                num: 1,
                itm_det: {
                  txval: inv.taxable_value,
                  rt: inv.tax_rate,
                  camt: inv.cgst_amount,
                  samt: inv.sgst_amount,
                  csamt: 0.0,
                },
              },
            ],
          },
        ],
      })),
      hsn: {
        data: gstr1.hsn_summary.map((hsn, idx) => ({
          num: idx + 1,
          hsn_sc: hsn.hsn_code,
          desc: hsn.description,
          uqc: hsn.uqc,
          qty: hsn.total_quantity,
          val: hsn.total_value,
          txval: hsn.taxable_value,
          iamt: hsn.integrated_tax,
          camt: hsn.central_tax,
          samt: hsn.state_tax,
          csamt: 0.0,
        })),
      },
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GSTR1_${business.gstin || 'B2B'}_AUG2026.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export GSTR-1 as Excel (CSV format)
  const handleExportCsv = () => {
    if (!gstr1) return;
    let csvContent = 'data:text/csv;charset=utf-8,';

    // Section 4 B2B
    csvContent += 'SECTION 4: B2B TAX INVOICES\r\n';
    csvContent += 'Invoice Number,Invoice Date,Customer Name,Customer GSTIN,Taxable Value,Tax Rate %,CGST,SGST,IGST,Grand Total\r\n';
    gstr1.b2b_invoices.forEach((i) => {
      csvContent += `"${i.invoice_number}","${i.invoice_date}","${i.customer_name}","${i.customer_gstin}",${i.taxable_value},${i.tax_rate},${i.cgst_amount},${i.sgst_amount},${i.igst_amount},${i.total_invoice_value}\r\n`;
    });

    csvContent += '\r\nSECTION 12: HSN-WISE SUMMARY OF OUTWARD SUPPLIES\r\n';
    csvContent += 'HSN/SAC Code,Description,UQC,Total Qty,Total Value,Taxable Value,Integrated Tax,Central Tax,State Tax\r\n';
    gstr1.hsn_summary.forEach((h) => {
      csvContent += `"${h.hsn_code}","${h.description}","${h.uqc}",${h.total_quantity},${h.total_value},${h.taxable_value},${h.integrated_tax},${h.central_tax},${h.state_tax}\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GSTR1_REPORT_${business.gstin || 'B2B'}_AUG2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <Link
            href="/dashboard/reports"
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition pb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Reports Hub</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <span>GST & CA Tax Filing Center</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Generate CA-compliant GSTR-1 & GSTR-3B filings with instant one-click Excel & JSON exports
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Excel (CSV)</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl font-black text-xs flex items-center gap-1.5 transition shadow-lg"
          >
            <FileCode className="w-4 h-4" />
            <span>Download GSTR-1 JSON</span>
          </button>
        </div>
      </div>

      {/* Main Tabs (GSTR-1 vs GSTR-3B) */}
      <div className="flex bg-slate-950 border border-slate-800 p-1.5 rounded-2xl text-xs font-bold w-fit">
        <button
          onClick={() => setActiveTab('GSTR1')}
          className={`px-5 py-2 rounded-xl transition ${
            activeTab === 'GSTR1' ? 'bg-amber-400 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          GSTR-1 (Outward Supplies Return)
        </button>
        <button
          onClick={() => setActiveTab('GSTR3B')}
          className={`px-5 py-2 rounded-xl transition ${
            activeTab === 'GSTR3B' ? 'bg-amber-400 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          GSTR-3B (Tax Liability & ITC Summary)
        </button>
      </div>

      {/* TAB 1: GSTR-1 Filing */}
      {activeTab === 'GSTR1' && gstr1 && (
        <div className="space-y-6">
          
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Total Taxable Turnover</div>
              <div className="text-xl font-mono font-black text-white">
                ₹{gstr1.total_taxable_turnover.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
              <div className="text-[11px] font-bold text-blue-400 uppercase">Central Tax (CGST)</div>
              <div className="text-xl font-mono font-black text-white">
                ₹{gstr1.total_cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
              <div className="text-[11px] font-bold text-blue-400 uppercase">State Tax (SGST)</div>
              <div className="text-xl font-mono font-black text-white">
                ₹{gstr1.total_sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
              <div className="text-[11px] font-bold text-emerald-400 uppercase">Total Tax Collected</div>
              <div className="text-xl font-mono font-black text-emerald-400">
                ₹{gstr1.total_tax_collected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Sub-Tabs: B2B, B2C, HSN */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            
            <div className="flex border-b border-slate-800 pb-3 gap-3 text-xs font-bold">
              <button
                onClick={() => setGstr1SubTab('B2B')}
                className={`pb-2 transition ${
                  gstr1SubTab === 'B2B'
                    ? 'text-amber-400 border-b-2 border-amber-400 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Section 4: B2B Invoices ({gstr1.b2b_invoices.length})
              </button>

              <button
                onClick={() => setGstr1SubTab('B2C')}
                className={`pb-2 transition ${
                  gstr1SubTab === 'B2C'
                    ? 'text-amber-400 border-b-2 border-amber-400 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Section 7: B2C Small Retail ({gstr1.b2c_invoices.length})
              </button>

              <button
                onClick={() => setGstr1SubTab('HSN')}
                className={`pb-2 transition ${
                  gstr1SubTab === 'HSN'
                    ? 'text-amber-400 border-b-2 border-amber-400 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Section 12: HSN-Wise Summary ({gstr1.hsn_summary.length})
              </button>
            </div>

            {/* Sub-Tab 1: Section 4 B2B Invoices Table */}
            {gstr1SubTab === 'B2B' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-extrabold text-[10px] uppercase">
                      <th className="py-3 px-3">Invoice #</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Customer Name</th>
                      <th className="py-3 px-3">Customer GSTIN</th>
                      <th className="py-3 px-3 text-right">Taxable Value</th>
                      <th className="py-3 px-3 text-right">CGST</th>
                      <th className="py-3 px-3 text-right">SGST</th>
                      <th className="py-3 px-3 text-right">Total Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {gstr1.b2b_invoices.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                          No B2B registered customer invoices found for this period.
                        </td>
                      </tr>
                    ) : (
                      gstr1.b2b_invoices.map((inv, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-3 font-bold text-white">{inv.invoice_number}</td>
                          <td className="py-2.5 px-3 text-slate-400">{inv.invoice_date}</td>
                          <td className="py-2.5 px-3 font-sans font-bold text-slate-200">{inv.customer_name}</td>
                          <td className="py-2.5 px-3 text-amber-400">{inv.customer_gstin}</td>
                          <td className="py-2.5 px-3 text-right text-slate-200">₹{inv.taxable_value.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right text-slate-400">₹{inv.cgst_amount.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right text-slate-400">₹{inv.sgst_amount.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-black text-white">₹{inv.total_invoice_value.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sub-Tab 2: Section 7 B2C Invoices */}
            {gstr1SubTab === 'B2C' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-extrabold text-[10px] uppercase">
                      <th className="py-3 px-3">Invoice #</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3 text-right">Taxable Value</th>
                      <th className="py-3 px-3 text-right">CGST</th>
                      <th className="py-3 px-3 text-right">SGST</th>
                      <th className="py-3 px-3 text-right">Grand Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {gstr1.b2c_invoices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                          No consumer / B2C sales recorded for this period.
                        </td>
                      </tr>
                    ) : (
                      gstr1.b2c_invoices.map((inv, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-3 font-bold text-white">{inv.invoice_number}</td>
                          <td className="py-2.5 px-3 text-slate-400">{inv.invoice_date}</td>
                          <td className="py-2.5 px-3 text-right text-slate-200">₹{inv.taxable_value.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right text-slate-400">₹{inv.cgst_amount.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right text-slate-400">₹{inv.sgst_amount.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-black text-white">₹{inv.grand_total.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sub-Tab 3: Section 12 HSN Summary */}
            {gstr1SubTab === 'HSN' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-extrabold text-[10px] uppercase">
                      <th className="py-3 px-3">HSN/SAC Code</th>
                      <th className="py-3 px-3">Item Description</th>
                      <th className="py-3 px-3 text-center">UQC</th>
                      <th className="py-3 px-3 text-right">Total Qty</th>
                      <th className="py-3 px-3 text-right">Taxable Value</th>
                      <th className="py-3 px-3 text-right">CGST</th>
                      <th className="py-3 px-3 text-right">SGST</th>
                      <th className="py-3 px-3 text-right">Total Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {gstr1.hsn_summary.map((hsn, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3 font-bold text-amber-400">{hsn.hsn_code}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-200">{hsn.description}</td>
                        <td className="py-2.5 px-3 text-center text-slate-400">{hsn.uqc}</td>
                        <td className="py-2.5 px-3 text-right text-white font-bold">{hsn.total_quantity}</td>
                        <td className="py-2.5 px-3 text-right text-slate-300">₹{hsn.taxable_value.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-400">₹{hsn.central_tax.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-400">₹{hsn.state_tax.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-black text-white">₹{hsn.total_value.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB 2: GSTR-3B Tax Liability & Input Tax Credit (ITC) Summary */}
      {activeTab === 'GSTR3B' && gstr3b && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 3.1 Outward Liability */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 uppercase">
                  Section 3.1
                </span>
                <h2 className="text-base font-black text-white mt-1">
                  Outward Taxable Supplies
                </h2>
                <p className="text-xs text-slate-400">Total sales tax liability</p>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Taxable Value:</span>
                  <span className="text-white font-bold">₹{gstr3b.outward_taxable_supplies.total_taxable_value.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>CGST Output:</span>
                  <span className="text-white">₹{gstr3b.outward_taxable_supplies.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>SGST Output:</span>
                  <span className="text-white">₹{gstr3b.outward_taxable_supplies.sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>IGST Output:</span>
                  <span className="text-white">₹{gstr3b.outward_taxable_supplies.igst.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between font-black text-sm text-amber-400">
                  <span>Total Output Tax:</span>
                  <span>₹{(gstr3b.outward_taxable_supplies.cgst + gstr3b.outward_taxable_supplies.sgst + gstr3b.outward_taxable_supplies.igst).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* 4.0 Eligible ITC */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20 uppercase">
                  Section 4.0
                </span>
                <h2 className="text-base font-black text-white mt-1">
                  Eligible Input Tax Credit (ITC)
                </h2>
                <p className="text-xs text-slate-400">Tax paid on vendor purchase bills</p>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Purchase Inward Value:</span>
                  <span className="text-white font-bold">₹{gstr3b.eligible_itc.total_taxable_value.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>CGST Paid (ITC):</span>
                  <span className="text-white">₹{gstr3b.eligible_itc.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>SGST Paid (ITC):</span>
                  <span className="text-white">₹{gstr3b.eligible_itc.sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>IGST Paid (ITC):</span>
                  <span className="text-white">₹{gstr3b.eligible_itc.igst.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between font-black text-sm text-blue-400">
                  <span>Total Available ITC:</span>
                  <span>₹{(gstr3b.eligible_itc.cgst + gstr3b.eligible_itc.sgst + gstr3b.eligible_itc.igst).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* 5.0 Net Tax Payable */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20 uppercase">
                  Section 5.0
                </span>
                <h2 className="text-base font-black text-white mt-1">
                  Net Tax Payable in Cash
                </h2>
                <p className="text-xs text-slate-400">Output Liability minus Eligible ITC</p>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Net CGST Payable:</span>
                  <span className="text-white font-bold">₹{gstr3b.net_tax_payable.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Net SGST Payable:</span>
                  <span className="text-white font-bold">₹{gstr3b.net_tax_payable.sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Net IGST Payable:</span>
                  <span className="text-white font-bold">₹{gstr3b.net_tax_payable.igst.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between font-black text-base text-emerald-400">
                  <span>NET CASH CHALLAN:</span>
                  <span>₹{gstr3b.net_tax_payable.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
