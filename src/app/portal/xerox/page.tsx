'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Copy,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Eye,
  FileText,
  Layers,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { XeroxDailyLog, CreateXeroxLogDTO } from '../../../types/xerox-tracker';
import {
  getXeroxDailyLogs,
  createXeroxDailyLog,
  deleteXeroxDailyLog,
} from '../../../actions/xerox-tracker-actions';

export default function XeroxPortalPage() {
  const [logs, setLogs] = useState<XeroxDailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State: Add Today's Entry
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [logDate, setLogDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [startReading, setStartReading] = useState<number>(43350);
  const [endReading, setEndReading] = useState<number>(44600);
  const [ratePerPrint, setRatePerPrint] = useState<number>(2.0);
  const [paperRims, setPaperRims] = useState<number>(2);
  const [costPerRim, setCostPerRim] = useState<number>(250);
  const [otherExpenses, setOtherExpenses] = useState<number>(150);
  const [notes, setNotes] = useState<string>('JK Copier A4 + Toner refill');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State: View Entry Details
  const [viewLog, setViewLog] = useState<XeroxDailyLog | null>(null);

  // Fetch logs on load
  useEffect(() => {
    async function load() {
      try {
        const data = await getXeroxDailyLogs();
        if (data && data.length > 0) {
          setLogs(data);
          // Pre-populate next start reading from latest log's end reading
          const latest = data[0];
          if (latest && latest.machine_end_reading) {
            setStartReading(latest.machine_end_reading);
            setEndReading(latest.machine_end_reading + 1200);
          }
        }
      } catch (err) {
        console.warn('Xerox logs loading fallback:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Live Auto-Calculations for the Add Modal
  const calcTotalPrints = Math.max(0, endReading - startReading);
  const calcGrossRevenue = calcTotalPrints * ratePerPrint;
  const calcPaperCost = paperRims * costPerRim;
  const calcTotalExpenses = calcPaperCost + otherExpenses;
  const calcNetProfit = calcGrossRevenue - calcTotalExpenses;

  // Aggregate KPI Calculations (Latest/Today's Log or Past 7 Days)
  const todayLog = logs.length > 0 ? logs[0] : null;
  const totalMonthPrints = logs.reduce((sum, l) => sum + l.total_prints_done, 0);
  const totalMonthRevenue = logs.reduce((sum, l) => sum + l.gross_revenue, 0);
  const totalMonthExpenses = logs.reduce(
    (sum, l) => sum + (l.total_paper_cost + l.other_expenses),
    0
  );
  const totalMonthProfit = logs.reduce((sum, l) => sum + l.net_profit, 0);

  // Handle Save Entry
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (endReading < startReading) {
      alert('End reading cannot be less than start reading!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateXeroxLogDTO = {
        client_id: 'c-001',
        log_date: logDate,
        paper_rims_bought: Number(paperRims) || 0,
        paper_cost_per_rim: Number(costPerRim) || 0,
        machine_start_reading: Number(startReading) || 0,
        machine_end_reading: Number(endReading) || 0,
        rate_per_print: Number(ratePerPrint) || 2.0,
        other_expenses: Number(otherExpenses) || 0,
        notes: notes.trim(),
      };

      const res = await createXeroxDailyLog(payload);
      if (res.success && res.data) {
        setLogs((prev) => [res.data!, ...prev.filter((l) => l.log_date !== res.data!.log_date)]);
        setIsAddModalOpen(false);
        // Pre-fill next start reading
        setStartReading(res.data.machine_end_reading);
        setEndReading(res.data.machine_end_reading + 1000);
      } else {
        alert(res.error || 'Failed to save daily entry');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred while saving entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Entry
  const handleDeleteEntry = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this daily record?')) return;
    await deleteXeroxDailyLog(logId);
    setLogs((prev) => prev.filter((l) => l.id !== logId));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 selection:bg-cyan-400 selection:text-slate-950">
      
      {/* Top Header Card */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl mb-6 print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Copy className="w-3 h-3" />
              <span>Client 1 &bull; Shree Xerox Center</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">Daily Meter & Expenses Tracker</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <span>Daily Xerox & Printing Tracker</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Track daily machine counter readings, paper rim consumption, operating expenses, and net shop profit
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Monthly Summary</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-xl transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Today&apos;s Entry</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 1. TOP KPI SUMMARY CARDS (Today's Pulse) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Prints Done */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Prints Done
              </span>
              <div className="w-8 h-8 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center">
                <Copy className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-mono font-black text-white">
              {todayLog
                ? todayLog.total_prints_done.toLocaleString('en-IN')
                : '0'}{' '}
              <span className="text-xs font-sans font-bold text-slate-400">Pages</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {todayLog
                ? `Meter: ${todayLog.machine_start_reading} → ${todayLog.machine_end_reading}`
                : 'No entry logged for today'}
            </div>
          </div>

          {/* Card 2: Gross Revenue */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Revenue (₹)
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-mono font-black text-blue-400">
              ₹
              {todayLog
                ? todayLog.gross_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                : '0.00'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {todayLog ? `@ ₹${todayLog.rate_per_print.toFixed(2)} per print` : '₹2.00 / print standard'}
            </div>
          </div>

          {/* Card 3: Total Expenses */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Expenses (Paper + Toner)
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-950 text-rose-400 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-mono font-black text-rose-400">
              ₹
              {todayLog
                ? (todayLog.total_paper_cost + todayLog.other_expenses).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })
                : '0.00'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {todayLog
                ? `Paper: ₹${todayLog.total_paper_cost} | Toner/Other: ₹${todayLog.other_expenses}`
                : 'Paper rims & petty expenses'}
            </div>
          </div>

          {/* Card 4: Net Profit */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Net Shop Profit / Loss
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                (todayLog?.net_profit || 0) >= 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
              }`}>
                {(todayLog?.net_profit || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </div>
            </div>
            <div className={`text-3xl font-mono font-black ${
              (todayLog?.net_profit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {(todayLog?.net_profit || 0) >= 0 ? '+' : ''}₹
              {todayLog
                ? todayLog.net_profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                : '0.00'}
            </div>
            <div className="text-[10px] font-black text-emerald-400/80 font-mono">
              {todayLog && todayLog.gross_revenue > 0
                ? `${((todayLog.net_profit / todayLog.gross_revenue) * 100).toFixed(1)}% Net Margin`
                : 'Take-home daily profit'}
            </div>
          </div>

        </div>

        {/* 2. MONTH-TO-DATE CUMULATIVE STRIP */}
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 font-sans font-bold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Month-to-Date Performance ({logs.length} Recorded Days):</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <span>
              Total Prints: <strong className="text-white">{totalMonthPrints.toLocaleString('en-IN')}</strong>
            </span>
            <span>
              Total Turnover: <strong className="text-blue-400">₹{totalMonthRevenue.toLocaleString('en-IN')}</strong>
            </span>
            <span>
              Total Costs: <strong className="text-rose-400">₹{totalMonthExpenses.toLocaleString('en-IN')}</strong>
            </span>
            <span>
              Cumulative Net Profit: <strong className="text-emerald-400">₹{totalMonthProfit.toLocaleString('en-IN')}</strong>
            </span>
          </div>
        </div>

        {/* 3. DAILY LEDGER TABLE */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          
          <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Chronological Xerox & Printing Daily Ledger</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Day-by-day record of start/end counter readings, gross earnings, costs, and net profit
              </p>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Showing {logs.length} entries
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-extrabold text-[10px] uppercase">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-3">Machine Meter (Start → End)</th>
                  <th className="py-3.5 px-3 text-right">Prints Done</th>
                  <th className="py-3.5 px-3 text-right">Rate</th>
                  <th className="py-3.5 px-3 text-right">Gross Revenue</th>
                  <th className="py-3.5 px-3 text-right">Expenses (Paper + Other)</th>
                  <th className="py-3.5 px-3 text-right">Net Profit</th>
                  <th className="py-3.5 px-3">Notes</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500 font-sans">
                      No daily entries recorded yet. Click &quot;+ Add Today&apos;s Entry&quot; above to log your first meter reading.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const totalExp = log.total_paper_cost + log.other_expenses;

                    return (
                      <tr key={log.id} className="hover:bg-slate-850/50 transition">
                        
                        {/* Date */}
                        <td className="py-3 px-4 font-sans font-bold text-white whitespace-nowrap">
                          {log.log_date}
                        </td>

                        {/* Meter Readings */}
                        <td className="py-3 px-3 text-slate-300">
                          <span>{log.machine_start_reading.toLocaleString('en-IN')}</span>
                          <span className="text-slate-500 mx-1.5">→</span>
                          <span className="font-bold text-white">
                            {log.machine_end_reading.toLocaleString('en-IN')}
                          </span>
                        </td>

                        {/* Prints Done */}
                        <td className="py-3 px-3 text-right font-bold text-cyan-400">
                          {log.total_prints_done.toLocaleString('en-IN')}
                        </td>

                        {/* Rate */}
                        <td className="py-3 px-3 text-right text-slate-400">
                          ₹{log.rate_per_print.toFixed(2)}
                        </td>

                        {/* Gross Revenue */}
                        <td className="py-3 px-3 text-right font-bold text-blue-400">
                          ₹{log.gross_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Expenses Breakdown */}
                        <td className="py-3 px-3 text-right text-rose-400">
                          ₹{totalExp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          <div className="text-[9px] text-slate-500 font-sans">
                            {log.paper_rims_bought} rims (₹{log.total_paper_cost}) + ₹{log.other_expenses}
                          </div>
                        </td>

                        {/* Net Profit */}
                        <td className="py-3 px-3 text-right">
                          <span className={`font-black ${log.net_profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {log.net_profit >= 0 ? '+' : ''}₹
                            {log.net_profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </td>

                        {/* Notes */}
                        <td className="py-3 px-3 font-sans text-slate-400 text-[11px] max-w-xs truncate">
                          {log.notes || '-'}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 font-sans">
                            <button
                              onClick={() => setViewLog(log)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(log.id)}
                              className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg transition"
                              title="Delete Entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* ====================================================================== */}
      {/* MODAL 1: ADD TODAY'S ENTRY (With Live Auto-Calculating Preview) */}
      {/* ====================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-2xl w-full shadow-2xl space-y-5 text-slate-100 my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-white text-base flex items-center gap-2">
                  <Copy className="w-5 h-5 text-cyan-400" />
                  <span>Log Daily Xerox & Printing Reading</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Enter machine start/end counters and paper costs &ndash; profit calculates live
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4 text-xs">
              
              {/* Date Input */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Entry Date
                </label>
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              {/* Section 1: Machine Meter Counter */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="font-extrabold text-cyan-400 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <Printer className="w-4 h-4" />
                  <span>1. Machine Meter Counter Readings</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Start Reading (सकाळचे मीटर)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={startReading}
                      onChange={(e) => setStartReading(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-sm font-bold text-white outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">End Reading (संध्याकाळचे मीटर)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={endReading}
                      onChange={(e) => setEndReading(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-sm font-bold text-cyan-400 outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Rate Per Print (₹)</label>
                    <input
                      type="number"
                      step="0.25"
                      min="0.5"
                      required
                      value={ratePerPrint}
                      onChange={(e) => setRatePerPrint(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-sm font-bold text-white outline-none focus:border-cyan-400"
                    />
                  </div>

                </div>

                {/* Counter Difference Live Display */}
                <div className="bg-cyan-950/40 border border-cyan-800/60 p-3 rounded-xl flex items-center justify-between">
                  <span className="font-bold text-cyan-300">Total Prints Made Today:</span>
                  <span className="font-mono font-black text-cyan-400 text-base">
                    {calcTotalPrints.toLocaleString('en-IN')} Pages
                  </span>
                </div>
              </div>

              {/* Section 2: Paper Stock & Operating Expenses */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="font-extrabold text-rose-400 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4" />
                  <span>2. Paper Consumption & Operating Expenses</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Paper Rims Used/Bought</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      required
                      value={paperRims}
                      onChange={(e) => setPaperRims(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-sm font-bold text-white outline-none focus:border-rose-400"
                    />
                    <div className="text-[10px] text-slate-500">1 Rim = 500 Sheets</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Cost Per Rim (₹)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={costPerRim}
                      onChange={(e) => setCostPerRim(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-sm font-bold text-white outline-none focus:border-rose-400"
                    />
                    <div className="text-[10px] text-slate-500">Avg ₹240-₹260/rim</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Toner / Petty Expenses (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={otherExpenses}
                      onChange={(e) => setOtherExpenses(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-sm font-bold text-white outline-none focus:border-rose-400"
                    />
                    <div className="text-[10px] text-slate-500">Ink, electricity, maintenance</div>
                  </div>

                </div>
              </div>

              {/* Notes Input */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Daily Remarks / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. JK Copier 75 GSM purchased, College exam rush"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              {/* LIVE SUMMARY / PROFIT CALCULATION BOX */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Live Calculation Summary for this Entry:
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Total Prints</div>
                    <div className="text-sm font-mono font-black text-cyan-400">
                      {calcTotalPrints.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Gross Earnings</div>
                    <div className="text-sm font-mono font-black text-blue-400">
                      ₹{calcGrossRevenue.toFixed(2)}
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Total Expenses</div>
                    <div className="text-sm font-mono font-black text-rose-400">
                      ₹{calcTotalExpenses.toFixed(2)}
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${
                    calcNetProfit >= 0
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                      : 'bg-rose-950/60 border-rose-800 text-rose-400'
                  }`}>
                    <div className="text-[10px] opacity-80">Net Profit</div>
                    <div className="text-sm font-mono font-black">
                      {calcNetProfit >= 0 ? '+' : ''}₹{calcNetProfit.toFixed(2)}
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-black rounded-xl shadow-xl transition"
                >
                  {isSubmitting ? 'Saving Record...' : 'Save Daily Record'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODAL 2: VIEW ENTRY DETAILS */}
      {/* ====================================================================== */}
      {viewLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4 text-slate-100 my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span>Daily Log &bull; {viewLog.log_date}</span>
              </h3>
              <button onClick={() => setViewLog(null)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Start Reading:</span>
                <span className="font-bold text-white">{viewLog.machine_start_reading.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 font-sans">End Reading:</span>
                <span className="font-bold text-white">{viewLog.machine_end_reading.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Total Prints Done:</span>
                <span className="font-bold text-cyan-400">{viewLog.total_prints_done.toLocaleString('en-IN')} Pages</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Charge Rate:</span>
                <span className="font-bold text-white">₹{viewLog.rate_per_print.toFixed(2)} / page</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Gross Revenue:</span>
                <span className="font-bold text-blue-400">₹{viewLog.gross_revenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Paper Cost:</span>
                <span className="text-rose-400">
                  {viewLog.paper_rims_bought} rims &times; ₹{viewLog.paper_cost_per_rim} = ₹{viewLog.total_paper_cost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Other Petty Expenses:</span>
                <span className="text-rose-400">₹{viewLog.other_expenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 bg-slate-950 px-3 rounded-xl font-bold text-sm">
                <span className="text-slate-300 font-sans">NET PROFIT:</span>
                <span className={viewLog.net_profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {viewLog.net_profit >= 0 ? '+' : ''}₹{viewLog.net_profit.toFixed(2)}
                </span>
              </div>

              {viewLog.notes && (
                <div className="pt-2 text-slate-400 font-sans text-xs">
                  <span className="font-bold text-slate-300">Notes:</span> {viewLog.notes}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewLog(null)}
                className="px-4 py-2 bg-slate-800 text-slate-200 rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
