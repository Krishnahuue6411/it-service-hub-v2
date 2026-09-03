'use client';

import React from 'react';
import { MOCK_TAX_INVOICES } from '../../data/accountData';
import { FileText, Download, Building2, CheckCircle2, FileSpreadsheet } from 'lucide-react';

export const GstTaxCenterTab: React.FC = () => {

  const handleExportZip = () => {
    alert('Generating GSTR-2B Tax Statements & ZIP archive of all 2026 Tax Invoices for Chartered Accountant (CA) filing...');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="font-black text-lg text-slate-900 leading-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            <span>GST Invoices & Statements (B2B Tax Center)</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Download itemized tax invoices for GSTR-2B 18% Input Tax Credit filing
          </p>
        </div>

        <button
          onClick={handleExportZip}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center gap-1.5"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export All 2026 Invoices (ZIP / Excel for CA)</span>
        </button>
      </div>

      {/* Financial Transactions Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Invoice No</th>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">HSN Code</th>
                <th className="p-3.5 text-right">Taxable Value</th>
                <th className="p-3.5 text-right">CGST (9%)</th>
                <th className="p-3.5 text-right">SGST (9%)</th>
                <th className="p-3.5 text-right">Total Invoice</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
              {MOCK_TAX_INVOICES.map((inv) => (
                <tr key={inv.invoiceNo} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 font-bold font-mono text-slate-900">{inv.invoiceNo}</td>
                  <td className="p-3.5 font-mono text-amber-700 font-bold">#{inv.orderId}</td>
                  <td className="p-3.5">{inv.invoiceDate}</td>
                  <td className="p-3.5 font-mono">{inv.hsnCode}</td>
                  <td className="p-3.5 text-right font-bold">₹{inv.taxableValue.toLocaleString()}</td>
                  <td className="p-3.5 text-right">₹{inv.cgstAmount.toFixed(2)}</td>
                  <td className="p-3.5 text-right">₹{inv.sgstAmount.toFixed(2)}</td>
                  <td className="p-3.5 text-right font-black text-emerald-700">₹{inv.totalAmount.toLocaleString()}</td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => alert(`Downloading PDF for ${inv.invoiceNo}...`)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
