'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Printer,
  ChevronRight,
  Clock,
  Building2,
  Wallet,
} from 'lucide-react';
import { Business, DaybookSummary } from '../../../../types/erp';
import { getBusinessProfile, getDaybookData } from '../../../../actions/erp-actions';
import { INITIAL_ERP_BUSINESS } from '../../../../lib/erp/erp-mock-data';

export default function DaybookPage() {
  const [business, setBusiness] = useState<Business>(INITIAL_ERP_BUSINESS);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [daybook, setDaybook] = useState<DaybookSummary | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [bData, dbData] = await Promise.all([
          getBusinessProfile(),
          getDaybookData(INITIAL_ERP_BUSINESS.id, selectedDate),
        ]);
        if (bData) setBusiness(bData);
        if (dbData) setDaybook(dbData);
      } catch (err) {
        console.warn('Daybook fallback state:', err);
      }
    }
    load();
  }, [selectedDate]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl print:hidden">
        <div className="space-y-1">
          <Link
            href="/dashboard/reports"
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition pb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Reports Hub</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-400" />
            <span>Daily Cashbook / Daybook</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Chronological audit of cash drawer opening balance, daily inflows, vendor payouts, and digital receipts
          </p>
        </div>

        {/* Date Selector & Print */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white rounded-xl outline-none focus:border-blue-400"
          />

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Daybook</span>
          </button>
        </div>
      </div>

      {daybook && (
        <div className="space-y-6">
          
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            {/* Opening Balance */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Morning Opening Float</div>
              <div className="text-xl font-mono font-black text-white">
                ₹{daybook.opening_cash_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-500">Drawer starting cash</div>
            </div>

            {/* Cash Inflow */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
              <div className="text-[11px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Cash Inflows
              </div>
              <div className="text-xl font-mono font-black text-emerald-400">
                +₹{daybook.cash_inflows.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-500">Sales & party cash receipts</div>
            </div>

            {/* Cash Outflow */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
              <div className="text-[11px] font-bold text-rose-400 uppercase flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Cash Outflows
              </div>
              <div className="text-xl font-mono font-black text-rose-400">
                -₹{daybook.cash_outflows.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-500">Vendor payouts & expenses</div>
            </div>

            {/* Closing Cash in Drawer */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
              <div className="text-[11px] font-bold text-blue-400 uppercase flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" /> Closing Cash in Drawer
              </div>
              <div className="text-2xl font-mono font-black text-blue-400">
                ₹{daybook.closing_cash_drawer.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-500">Physical drawer cash balance</div>
            </div>

          </div>

          {/* Digital Receipts Strip */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-300 uppercase tracking-wider">Digital Bank & UPI Receipts:</span>
              <span className="font-mono text-slate-300">
                UPI/QR: <strong className="text-emerald-400">₹{daybook.digital_receipts_upi.toLocaleString('en-IN')}</strong>
              </span>
              <span className="font-mono text-slate-300">
                Bank Transfer (NEFT/RTGS): <strong className="text-blue-400">₹{daybook.digital_receipts_bank.toLocaleString('en-IN')}</strong>
              </span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Direct settlement to verified bank account
            </div>
          </div>

          {/* Chronological Register Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 font-extrabold text-xs text-white uppercase tracking-wider">
              Chronological Transaction Audit Register for {selectedDate}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-extrabold text-[10px] uppercase">
                    <th className="py-3 px-3">Time</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Customer / Vendor Party</th>
                    <th className="py-3 px-3">Ref / Voucher #</th>
                    <th className="py-3 px-3">Mode</th>
                    <th className="py-3 px-3 text-right">Inflow (जमा)</th>
                    <th className="py-3 px-3 text-right">Outflow (नावे)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {daybook.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                        No transactions recorded for {selectedDate}.
                      </td>
                    </tr>
                  ) : (
                    daybook.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3 text-slate-400">{tx.time}</td>
                        <td className="py-2.5 px-3 font-sans">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                            tx.inflow > 0
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {tx.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans font-bold text-white">{tx.entity_name}</td>
                        <td className="py-2.5 px-3 text-slate-400">{tx.reference_no}</td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] font-bold text-amber-400">{tx.mode}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                          {tx.inflow > 0 ? `₹${tx.inflow.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-rose-400">
                          {tx.outflow > 0 ? `₹${tx.outflow.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
