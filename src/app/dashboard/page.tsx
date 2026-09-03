import React from 'react';
import Link from 'next/link';
import {
  getBusinessProfile,
  getParties,
  getItems,
  getInvoices,
  getBomRecipes,
} from '../../actions/erp-actions';
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Users,
  Package,
  Factory,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Building2,
  Receipt,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export default async function ErpDashboardPage() {
  const [business, parties, items, invoices, bomRecipes] = await Promise.all([
    getBusinessProfile(),
    getParties(),
    getItems(),
    getInvoices(),
    getBomRecipes(),
  ]);

  // Financial Metrics Calculation
  const totalReceivables = parties
    .filter((p) => p.type === 'CUSTOMER' && p.current_balance > 0)
    .reduce((sum, p) => sum + p.current_balance, 0);

  const totalPayables = parties
    .filter((p) => p.type === 'SUPPLIER' && p.current_balance < 0)
    .reduce((sum, p) => sum + Math.abs(p.current_balance), 0);

  const totalSalesThisMonth = invoices.reduce((sum, inv) => sum + inv.grand_total, 0);
  const totalGstCollected = invoices.reduce((sum, inv) => sum + inv.cgst_amount + inv.sgst_amount + inv.igst_amount, 0);

  const lowStockItems = items.filter((item) => item.current_stock <= item.low_stock_threshold);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              Tenant Active
            </span>
            <span className="text-xs text-slate-400 font-medium">{business.city}, {business.state}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {business.name}
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Multi-Tenant B2B Accounting, Khata Ledger, and Operations Engine
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/settings/business"
            className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            <span>Settings & Flags</span>
          </Link>

          <Link
            href="/dashboard/billing/new"
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Create Invoice</span>
          </Link>
        </div>
      </div>

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Receivables (Customers Owe Us) */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
            <span className="uppercase tracking-wider">Total Receivables</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ₹{totalReceivables.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            From {parties.filter((p) => p.type === 'CUSTOMER').length} active Khata customers
          </p>
        </div>

        {/* Total Payables (We Owe Suppliers) */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-rose-400">
            <span className="uppercase tracking-wider">Total Payables</span>
            <div className="p-2 bg-rose-500/10 rounded-xl">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ₹{totalPayables.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            To {parties.filter((p) => p.type === 'SUPPLIER').length} registered suppliers
          </p>
        </div>

        {/* Sales Turnover */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400">
            <span className="uppercase tracking-wider">Sales Turnover</span>
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ₹{totalSalesThisMonth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Total B2B invoiced volume
          </p>
        </div>

        {/* GST Output Tax */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-blue-400">
            <span className="uppercase tracking-wider">Output GST Tax</span>
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ₹{totalGstCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            CGST + SGST + IGST liability
          </p>
        </div>

      </div>

      {/* Dynamic Module Badges Status */}
      <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Active Tenant Modules & Features</span>
          </h3>
          <Link
            href="/dashboard/settings/business"
            className="text-xs font-bold text-amber-400 hover:underline"
          >
            Configure Flags &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className={`p-3 rounded-2xl border ${business.settings.enable_gst ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            <div className="font-extrabold text-[11px]">GST Engine</div>
            <div className="text-[10px] font-medium">{business.settings.enable_gst ? '✅ Enabled' : '⚪ Disabled'}</div>
          </div>

          <div className={`p-3 rounded-2xl border ${business.settings.enable_bom ? 'bg-amber-950/40 border-amber-800 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            <div className="font-extrabold text-[11px]">BOM / Manufacturing</div>
            <div className="text-[10px] font-medium">{business.settings.enable_bom ? '✅ Enabled' : '⚪ Disabled'}</div>
          </div>

          <div className={`p-3 rounded-2xl border ${business.settings.enable_po ? 'bg-blue-950/40 border-blue-800 text-blue-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            <div className="font-extrabold text-[11px]">Purchase Orders</div>
            <div className="text-[10px] font-medium">{business.settings.enable_po ? '✅ Enabled' : '⚪ Disabled'}</div>
          </div>

          <div className={`p-3 rounded-2xl border ${business.settings.enable_barcode ? 'bg-purple-950/40 border-purple-800 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            <div className="font-extrabold text-[11px]">Barcode Scanner</div>
            <div className="text-[10px] font-medium">{business.settings.enable_barcode ? '✅ Enabled' : '⚪ Disabled'}</div>
          </div>

          <div className={`p-3 rounded-2xl border ${business.settings.show_vehicle_no ? 'bg-indigo-950/40 border-indigo-800 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            <div className="font-extrabold text-[11px]">Logistics / Transporter</div>
            <div className="text-[10px] font-medium">{business.settings.show_vehicle_no ? '✅ Enabled' : '⚪ Disabled'}</div>
          </div>

          <div className="p-3 rounded-2xl border bg-slate-900 border-slate-800 text-slate-300">
            <div className="font-extrabold text-[11px]">Print Layout</div>
            <div className="text-[10px] font-bold text-amber-400">{business.settings.print_format} Format</div>
          </div>
        </div>
      </div>

      {/* Two-Column Detail Grid: Low Stock Alert & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Invoices Table */}
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-black text-white text-base flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-400" />
              <span>Recent B2B Tax Invoices</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold bg-slate-900 px-2.5 py-1 rounded-lg">
              Prefix: {business.settings.invoice_prefix}
            </span>
          </div>

          <div className="space-y-2.5">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-extrabold text-white font-mono">{inv.invoice_number}</div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {inv.customer?.company_name || inv.customer?.name || 'Walk-in Client'} • {inv.invoice_date}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-white">₹{inv.grand_total.toLocaleString('en-IN')}</div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                    inv.status === 'PAID' ? 'bg-emerald-900/60 text-emerald-400' : 'bg-amber-900/60 text-amber-400'
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock & Raw Material Alerts */}
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-black text-white text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Inventory & Raw Material Stock Alerts</span>
            </h3>
            <span className="text-xs text-rose-400 font-bold bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-800">
              {lowStockItems.length} Low
            </span>
          </div>

          <div className="space-y-2.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-extrabold text-white">{item.name}</div>
                  <div className="text-[11px] text-slate-400">
                    Type: <strong className="text-amber-400">{item.item_type}</strong> • HSN: {item.hsn_sac_code || 'N/A'}
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-black text-sm ${item.current_stock <= item.low_stock_threshold ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {item.current_stock} {item.unit}
                  </div>
                  <div className="text-[10px] text-slate-500">Threshold: {item.low_stock_threshold} {item.unit}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
