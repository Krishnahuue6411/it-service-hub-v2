'use client';

import React, { useState } from 'react';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';
import { PRODUCTS_DATABASE, INITIAL_LOCATION } from '../../../data/mockData';
import { LocationInfo, CartItem } from '../../../types';
import { exportToCSV } from '../../../lib/export/exportHelpers';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Building2,
  TrendingUp,
  FileText,
  CheckCircle2,
  DollarSign,
  PieChart,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
} from 'lucide-react';

export default function AdminTaxReportsPage() {
  const [location] = useState<LocationInfo>(INITIAL_LOCATION);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [cartItems] = useState<CartItem[]>([]);
  const [activeReportTab, setActiveReportTab] = useState<'gstr1' | 'gstr3b' | 'pnl'>('gstr1');
  const [selectedQuarter, setSelectedQuarter] = useState('Q2 (Jul - Sep 2026)');

  // Mock Tax Invoices Dataset for GSTR-1 & GSTR-3B
  const mockTaxInvoices = [
    {
      invoiceNo: 'INV-2026-8894',
      date: '2026-08-28',
      clientName: 'PAIS Printing & Trading Pvt Ltd',
      gstin: '27AIKPV9768Q1ZP',
      hsnCode: '847170',
      taxableSubtotal: 8895.76,
      cgst: 800.62,
      sgst: 800.62,
      igst: 0,
      grandTotal: 10497.00,
      type: 'B2B Corporate',
    },
    {
      invoiceNo: 'INV-2026-8895',
      date: '2026-08-29',
      clientName: 'Sunil Vahurwagh',
      gstin: '27AAAAA0000A1Z5',
      hsnCode: '852580',
      taxableSubtotal: 12500.00,
      cgst: 1125.00,
      sgst: 1125.00,
      igst: 0,
      grandTotal: 14750.00,
      type: 'B2B Corporate',
    },
    {
      invoiceNo: 'INV-2026-8896',
      date: '2026-08-30',
      clientName: 'Walk-in Retail Client (MIDC Plant 2)',
      gstin: 'URP (Unregistered)',
      hsnCode: '847170',
      taxableSubtotal: 5083.90,
      cgst: 457.55,
      sgst: 457.55,
      igst: 0,
      grandTotal: 5999.00,
      type: 'B2C Retail',
    },
  ];

  // Financial P&L Breakdown Metrics
  const grossSalesRevenue = 184500.00;
  const hardwarePurchaseCost = 112400.00;
  const technicianCommissions = 18500.00;
  const workshopOverheads = 9200.00;
  const netOperatingProfit = grossSalesRevenue - (hardwarePurchaseCost + technicianCommissions + workshopOverheads);
  const profitMarginPercent = ((netOperatingProfit / grossSalesRevenue) * 100).toFixed(1);

  // Totals for GSTR-1
  const totalTaxable = mockTaxInvoices.reduce((sum, i) => sum + i.taxableSubtotal, 0);
  const totalCgst = mockTaxInvoices.reduce((sum, i) => sum + i.cgst, 0);
  const totalSgst = mockTaxInvoices.reduce((sum, i) => sum + i.sgst, 0);
  const totalGstPaid = totalCgst + totalSgst;
  const grandTotalSales = mockTaxInvoices.reduce((sum, i) => sum + i.grandTotal, 0);

  const handleExportGstr1CSV = () => {
    exportToCSV({
      filename: `GSTR1_Outward_Supplies_${selectedQuarter.replace(/\s+/g, '_')}.csv`,
      data: mockTaxInvoices.map((inv) => ({
        Invoice_Number: inv.invoiceNo,
        Invoice_Date: inv.date,
        Client_Name: inv.clientName,
        Client_GSTIN: inv.gstin,
        HSN_SAC_Code: inv.hsnCode,
        Taxable_Value_INR: inv.taxableSubtotal.toFixed(2),
        CGST_9_Percent_INR: inv.cgst.toFixed(2),
        SGST_9_Percent_INR: inv.sgst.toFixed(2),
        IGST_18_Percent_INR: inv.igst.toFixed(2),
        Grand_Total_INR: inv.grandTotal.toFixed(2),
        Supply_Type: inv.type,
      })),
    });
  };

  const handlePrintCAReport = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12 selection:bg-amber-400 selection:text-slate-950">
      <Header
        location={location}
        onOpenLocationModal={() => {}}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        cartItems={cartItems}
        onOpenCartDrawer={() => {}}
        allProducts={PRODUCTS_DATABASE}
        onSelectSearchProduct={() => {}}
      />

      {/* Reports Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 border-b border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  CA Certified Compliance Engine
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-400 font-medium">Ahilyanagar MIDC Tax Sector</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Automated GST & Business Tax Filing Reports
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Generate itemized GSTR-1 outward supplies, GSTR-3B monthly ITC summaries, and P&L financial statements
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportGstr1CSV}
                className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-extrabold text-xs px-4 py-3 rounded-2xl border border-slate-700 transition shadow flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Excel / CSV</span>
              </button>

              <button
                type="button"
                onClick={handlePrintCAReport}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl transition shadow-lg flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print CA Audit Report</span>
              </button>
            </div>

          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-slate-400 text-xs font-extrabold uppercase flex justify-between">
                <span>Taxable Turnover</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white mt-2">
                ₹{totalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Net sales before GST</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-amber-400 text-xs font-extrabold uppercase flex justify-between">
                <span>Output GST Collected</span>
                <Building2 className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 mt-2">
                ₹{totalGstPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">CGST (9%) + SGST (9%)</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-blue-400 text-xs font-extrabold uppercase flex justify-between">
                <span>Eligible Input Credit (ITC)</span>
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-blue-400 mt-2">
                ₹{(totalGstPaid * 0.75).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Hardware purchase tax credit</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="text-emerald-400 text-xs font-extrabold uppercase flex justify-between">
                <span>Net Operating Profit</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-2">
                ₹{netOperatingProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                Net Margin: <strong className="text-emerald-400">{profitMarginPercent}%</strong>
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Main Report Tables Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
        
        {/* Report Tab Navigator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'gstr1', label: 'GSTR-1 Outward Supplies', icon: FileSpreadsheet },
              { id: 'gstr3b', label: 'GSTR-3B Monthly ITC Summary', icon: ShieldCheck },
              { id: 'pnl', label: 'Profit & Loss Statement (P&L)', icon: PieChart },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveReportTab(tab.id as any)}
                  className={`text-xs font-extrabold px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
                    activeReportTab === tab.id
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Filing Period:</span>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="bg-slate-950 text-white border border-slate-700 text-xs font-bold py-1.5 px-3 rounded-xl outline-none"
            >
              <option value="Q2 (Jul - Sep 2026)">Q2 (Jul - Sep 2026)</option>
              <option value="Q1 (Apr - Jun 2026)">Q1 (Apr - Jun 2026)</option>
            </select>
          </div>
        </div>

        {/* TAB 1: GSTR-1 OUTWARD SUPPLIES TABLE */}
        {activeReportTab === 'gstr1' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-black text-white text-lg flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                  <span>GSTR-1 Outward B2B & B2C Tax Invoices</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Itemized outward tax invoice register for GST portal upload (JSON / CSV Format)
                </p>
              </div>

              <span className="text-xs text-slate-400 font-bold bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                Total Invoices: <strong className="text-white">{mockTaxInvoices.length}</strong>
              </span>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-white font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Invoice #</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Client & GSTIN</th>
                      <th className="p-3.5">HSN Code</th>
                      <th className="p-3.5 text-right">Taxable Subtotal</th>
                      <th className="p-3.5 text-right">CGST (9%)</th>
                      <th className="p-3.5 text-right">SGST (9%)</th>
                      <th className="p-3.5 text-right">Grand Total</th>
                      <th className="p-3.5 text-center">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
                    {mockTaxInvoices.map((inv) => (
                      <tr key={inv.invoiceNo} className="hover:bg-slate-800/50 transition">
                        <td className="p-3.5 font-bold font-mono text-amber-400">#{inv.invoiceNo}</td>
                        <td className="p-3.5">{inv.date}</td>
                        <td className="p-3.5">
                          <div className="font-extrabold text-white">{inv.clientName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{inv.gstin}</div>
                        </td>
                        <td className="p-3.5 font-mono text-amber-300">{inv.hsnCode}</td>
                        <td className="p-3.5 text-right font-bold text-white">
                          ₹{inv.taxableSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-right font-semibold text-emerald-400">
                          ₹{inv.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-right font-semibold text-emerald-400">
                          ₹{inv.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-right font-black text-amber-400">
                          ₹{inv.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                            {inv.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GSTR-3B MONTHLY ITC SUMMARY */}
        {activeReportTab === 'gstr3b' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="font-black text-white text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>GSTR-3B Tax Summary & Input Tax Credit (ITC)</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Summary of monthly tax liability vs. eligible hardware purchase input credits
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">1. Outward Taxable Turnover</div>
                <div className="text-xl font-black text-white">₹{totalTaxable.toLocaleString('en-IN')}</div>
                <div className="text-xs text-amber-400 font-semibold">Total Output Tax: ₹{totalGstPaid.toLocaleString('en-IN')}</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">2. Eligible ITC (GSTR-2B)</div>
                <div className="text-xl font-black text-emerald-400">₹{(totalGstPaid * 0.75).toLocaleString('en-IN')}</div>
                <div className="text-xs text-slate-400 font-semibold">Direct Vendor OEM Invoices</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">3. Net Cash Tax Payable</div>
                <div className="text-xl font-black text-amber-400">₹{(totalGstPaid * 0.25).toLocaleString('en-IN')}</div>
                <div className="text-xs text-emerald-400 font-semibold">Payable via PMT-06 Challan</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROFIT & LOSS STATEMENT (P&L) */}
        {activeReportTab === 'pnl' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="font-black text-white text-lg flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-400" />
                <span>Profit & Loss Financial Statement</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Comprehensive financial breakdown of hardware sales revenue against costs and technician payouts
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-2xl flex justify-between items-center text-xs font-bold">
                <span className="text-slate-300 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  <span>Gross Sales & Workshop Service Revenue</span>
                </span>
                <span className="text-emerald-400 text-sm font-black">₹{grossSalesRevenue.toLocaleString('en-IN')}</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl flex justify-between items-center text-xs font-bold">
                <span className="text-slate-300 flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-rose-400" />
                  <span>Hardware Vendor Purchase Cost (Crucial, Dell, Hikvision)</span>
                </span>
                <span className="text-rose-400 text-sm font-black">-₹{hardwarePurchaseCost.toLocaleString('en-IN')}</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl flex justify-between items-center text-xs font-bold">
                <span className="text-slate-300 flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-rose-400" />
                  <span>Field Technician Commission Payouts</span>
                </span>
                <span className="text-rose-400 text-sm font-black">-₹{technicianCommissions.toLocaleString('en-IN')}</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl flex justify-between items-center text-xs font-bold">
                <span className="text-slate-300 flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-rose-400" />
                  <span>Workshop Utilities & Delivery Overheads</span>
                </span>
                <span className="text-rose-400 text-sm font-black">-₹{workshopOverheads.toLocaleString('en-IN')}</span>
              </div>

              <div className="bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-800 p-5 rounded-2xl flex justify-between items-center text-sm font-black">
                <span className="text-emerald-400">NET OPERATING PROFIT MARGIN ({profitMarginPercent}%)</span>
                <span className="text-emerald-400 text-xl font-black">₹{netOperatingProfit.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}

      </section>

      <Footer />
    </main>
  );
}
