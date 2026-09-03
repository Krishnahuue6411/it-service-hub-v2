'use client';

import React, { useState } from 'react';
import { AdminInvoice } from '../../types';
import { MOCK_ADMIN_INVOICES } from '../../data/adminData';
import { FileText, Plus, Download, MessageSquare, Building2, Check, X, Filter } from 'lucide-react';

interface InvoicesModuleProps {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
}

export const InvoicesModule: React.FC<InvoicesModuleProps> = ({
  showAddModal,
  setShowAddModal,
}) => {
  const [invoices, setInvoices] = useState<AdminInvoice[]>(MOCK_ADMIN_INVOICES);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Form State for Tax Invoice Generator
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [taxableAmount, setTaxableAmount] = useState('');

  const filteredInvoices = invoices.filter(
    (inv) => statusFilter === 'All' || inv.status === statusFilter
  );

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !taxableAmount) {
      alert('Please enter company name and taxable amount');
      return;
    }

    const taxVal = Number(taxableAmount);
    const cgst = Math.round((taxVal * 0.09) * 100) / 100;
    const sgst = Math.round((taxVal * 0.09) * 100) / 100;
    const total = taxVal + cgst + sgst;

    const newInv: AdminInvoice = {
      invoiceId: `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      orderId: `IT-SH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: clientName || 'B2B Client',
      companyName,
      gstin: gstin.toUpperCase() || 'UNREGISTERED',
      date: 'Today',
      hsnCode: '847170',
      taxableAmount: taxVal,
      cgstAmount: cgst,
      sgstAmount: sgst,
      totalAmount: total,
      status: 'Paid',
    };

    setInvoices((prev) => [newInv, ...prev]);
    setShowAddModal(false);
    alert(`Official GST Tax Invoice #${newInv.invoiceId} generated for ${companyName}!`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="font-black text-lg text-slate-900 leading-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <span>B2B Orders & GST Invoice Generator</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Auto-generate CGST 9% + SGST 9% B2B tax invoices with GSTR-1 metadata
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="B2B Credit Pending">B2B Credit Pending</option>
            <option value="Overdue">Overdue</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition shadow flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Generate Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Invoice & Order ID</th>
                <th className="p-3.5">Company & GSTIN</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Taxable</th>
                <th className="p-3.5 text-right">CGST (9%)</th>
                <th className="p-3.5 text-right">SGST (9%)</th>
                <th className="p-3.5 text-right">Grand Total</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
              {filteredInvoices.map((inv) => (
                <tr key={inv.invoiceId} className="hover:bg-slate-50 transition">
                  <td className="p-3.5">
                    <div className="font-extrabold text-slate-900 font-mono">{inv.invoiceId}</div>
                    <div className="text-[10px] text-amber-700 font-bold font-mono">#{inv.orderId}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{inv.companyName}</div>
                    <div className="font-mono text-[10px] text-slate-500">GSTIN: {inv.gstin}</div>
                  </td>

                  <td className="p-3.5">{inv.date}</td>
                  <td className="p-3.5 text-right font-bold">₹{inv.taxableAmount.toLocaleString()}</td>
                  <td className="p-3.5 text-right">₹{inv.cgstAmount.toFixed(2)}</td>
                  <td className="p-3.5 text-right">₹{inv.sgstAmount.toFixed(2)}</td>
                  <td className="p-3.5 text-right font-black text-emerald-700">₹{inv.totalAmount.toLocaleString()}</td>

                  <td className="p-3.5 text-center">
                    <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                      {inv.status}
                    </span>
                  </td>

                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => alert(`Downloading PDF for Invoice ${inv.invoiceId}...`)}
                        className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                      <button
                        onClick={() => {
                          const text = `Official GST Tax Invoice #${inv.invoiceId} from IT Service Hub.\nTotal Paid: ₹${inv.totalAmount.toLocaleString()}\nGSTIN: ${inv.gstin}`;
                          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
                        title="Share to WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Tax Invoice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-900 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                <span>Generate B2B Tax Invoice</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Company / Firm Name *</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="PAIS Printing & Trading Pvt Ltd"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">15-Character GSTIN</label>
                <input
                  type="text"
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="27AIKPV9768Q1ZP"
                  className="w-full px-3 py-2 border rounded-xl outline-none font-mono focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Taxable Subtotal Base Amount (₹) *</label>
                <input
                  type="number"
                  value={taxableAmount}
                  onChange={(e) => setTaxableAmount(e.target.value)}
                  placeholder="8895.76"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-amber-400"
                  required
                />
              </div>

              {taxableAmount && (
                <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1 text-xs font-mono">
                  <div className="flex justify-between"><span>CGST (9%):</span><span>₹{(Number(taxableAmount) * 0.09).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>SGST (9%):</span><span>₹{(Number(taxableAmount) * 0.09).toFixed(2)}</span></div>
                  <div className="flex justify-between font-black text-amber-400 pt-1 border-t border-slate-800">
                    <span>Grand Total Invoice:</span>
                    <span>₹{(Number(taxableAmount) * 1.18).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs py-3 rounded-xl shadow transition"
                >
                  Generate Tax Invoice & PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
