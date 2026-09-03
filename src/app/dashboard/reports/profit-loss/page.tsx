'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  DollarSign,
  PieChart,
  Percent,
  CheckCircle2,
  Building2,
  Layers,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { Business, ProfitLossStatement, Item } from '../../../../types/erp';
import { getBusinessProfile, getProfitLossData, getItems } from '../../../../actions/erp-actions';
import { INITIAL_ERP_BUSINESS, MOCK_ERP_ITEMS } from '../../../../lib/erp/erp-mock-data';

export default function ProfitLossPage() {
  const [business, setBusiness] = useState<Business>(INITIAL_ERP_BUSINESS);
  const [statement, setStatement] = useState<ProfitLossStatement | null>(null);
  const [items, setItems] = useState<Item[]>(MOCK_ERP_ITEMS);

  useEffect(() => {
    async function load() {
      try {
        const [bData, plData, iData] = await Promise.all([
          getBusinessProfile(),
          getProfitLossData(),
          getItems(),
        ]);
        if (bData) setBusiness(bData);
        if (plData) setStatement(plData);
        if (iData && iData.length > 0) setItems(iData);
      } catch (err) {
        console.warn('P&L fallback state:', err);
      }
    }
    load();
  }, []);

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
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <span>Profit & Loss (P&L) Engine</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Financial performance statement based on sales turnover, Cost of Goods Sold (COGS), and operating margins
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print Statement</span>
        </button>
      </div>

      {statement && (
        <div className="space-y-6">
          
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            {/* Sales Revenue */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Total Sales Revenue</div>
              <div className="text-2xl font-mono font-black text-white">
                ₹{statement.sales_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-500">Net taxable turnover</div>
            </div>

            {/* COGS */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-1">
              <div className="text-[11px] font-bold text-rose-400 uppercase">Cost of Goods Sold (COGS)</div>
              <div className="text-2xl font-mono font-black text-rose-400">
                ₹{statement.cost_of_goods_sold.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-500">Direct material procurement cost</div>
            </div>

            {/* Gross Profit & Margin */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-1">
              <div className="text-[11px] font-bold text-emerald-400 uppercase">Gross Profit</div>
              <div className="text-2xl font-mono font-black text-emerald-400">
                ₹{statement.gross_profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] font-black text-emerald-400/80">
                {statement.gross_margin_percentage}% Margin
              </div>
            </div>

            {/* Net Profit */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-1">
              <div className="text-[11px] font-bold text-amber-400 uppercase">Net Profit (EBIT)</div>
              <div className="text-2xl font-mono font-black text-amber-400">
                ₹{statement.net_profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] font-black text-amber-400/80">
                {statement.net_profit_percentage}% Net Margin
              </div>
            </div>

          </div>

          {/* Structured Income Statement Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="font-extrabold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Comprehensive Financial Income Statement
            </div>

            <div className="space-y-3 text-xs font-mono">
              
              {/* Revenue Section */}
              <div className="space-y-1.5">
                <div className="font-sans font-black text-slate-300 uppercase text-[11px]">1. Operating Revenue</div>
                <div className="flex justify-between py-2 px-3 bg-slate-900/60 rounded-xl">
                  <span className="font-sans text-slate-300">Gross Sales of Goods & Industrial Services</span>
                  <span className="font-bold text-white">₹{statement.sales_revenue.toFixed(2)}</span>
                </div>
              </div>

              {/* COGS Section */}
              <div className="space-y-1.5 pt-2">
                <div className="font-sans font-black text-slate-300 uppercase text-[11px]">2. Cost of Sales (COGS)</div>
                <div className="flex justify-between py-2 px-3 bg-slate-900/60 rounded-xl">
                  <span className="font-sans text-slate-300">Raw Material Consumption & Hardware Component Cost</span>
                  <span className="font-bold text-rose-400">-₹{statement.cost_of_goods_sold.toFixed(2)}</span>
                </div>
              </div>

              {/* Gross Profit Strip */}
              <div className="flex justify-between py-3 px-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl font-black text-sm">
                <span className="font-sans text-emerald-400 uppercase">GROSS PROFIT (Margin: {statement.gross_margin_percentage}%)</span>
                <span className="text-emerald-400">₹{statement.gross_profit.toFixed(2)}</span>
              </div>

              {/* Operating Expenses */}
              <div className="space-y-1.5 pt-2">
                <div className="font-sans font-black text-slate-300 uppercase text-[11px]">3. Operating Expenses & Overheads</div>
                <div className="flex justify-between py-2 px-3 bg-slate-900/60 rounded-xl">
                  <span className="font-sans text-slate-300">Logistics, Courier, Workshop Utilities & Maintenance</span>
                  <span className="font-bold text-rose-400">-₹{statement.operating_expenses.toFixed(2)}</span>
                </div>
              </div>

              {/* Net Profit Strip */}
              <div className="flex justify-between py-3 px-4 bg-amber-950/40 border border-amber-800/60 rounded-xl font-black text-base">
                <span className="font-sans text-amber-400 uppercase">NET PROFIT FOR PERIOD ({statement.net_profit_percentage}%)</span>
                <span className="text-amber-400 font-mono">₹{statement.net_profit.toFixed(2)}</span>
              </div>

            </div>
          </div>

          {/* Item Margin Analysis Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 font-extrabold text-xs text-white uppercase tracking-wider">
              Product SKU Profitability & Margin Contribution
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-extrabold text-[10px] uppercase">
                    <th className="py-3 px-3">Item / SKU Description</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3 text-right">Purchase Cost (₹)</th>
                    <th className="py-3 px-3 text-right">Selling Rate (₹)</th>
                    <th className="py-3 px-3 text-right">Gross Margin (₹)</th>
                    <th className="py-3 px-3 text-center">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {items.map((item) => {
                    const margin = item.selling_price - item.purchase_price;
                    const marginPct = item.selling_price > 0 ? (margin / item.selling_price) * 100 : 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3 font-sans font-bold text-white">{item.name}</td>
                        <td className="py-2.5 px-3 font-sans">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                            {item.item_type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400">₹{item.purchase_price.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-200">₹{item.selling_price.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">₹{margin.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-amber-400">
                          {marginPct.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
