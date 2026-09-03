'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  Sliders,
  Printer,
  Factory,
  ShoppingBag,
  Barcode,
  Truck,
  FileText,
  CreditCard,
  QrCode,
  Save,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { Business, BusinessSettings, PrintFormat } from '../../../../types/erp';
import { INITIAL_ERP_BUSINESS } from '../../../../lib/erp/erp-mock-data';
import { updateBusinessSettings, updateBusinessProfile } from '../../../../actions/erp-actions';

export default function BusinessSettingsPage() {
  const [activeTab, setActiveTab] = useState<'modules' | 'invoice' | 'company' | 'banking'>('modules');
  const [business, setBusiness] = useState<Business>(INITIAL_ERP_BUSINESS);
  const [settings, setSettings] = useState<BusinessSettings>(INITIAL_ERP_BUSINESS.settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings Toggles Handlers
  const handleToggleSetting = (key: keyof BusinessSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaveSuccess(false);
  };

  const handlePrintFormatChange = (format: PrintFormat) => {
    setSettings((prev) => ({
      ...prev,
      print_format: format,
    }));
    setSaveSuccess(false);
  };

  const handleTextSettingChange = (key: keyof BusinessSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSaveSuccess(false);
  };

  const handleProfileChange = (key: keyof Business, value: any) => {
    setBusiness((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSaveSuccess(false);
  };

  // Save Settings directly to Supabase JSONB column
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await Promise.all([
        updateBusinessSettings(business.id, settings),
        updateBusinessProfile(business.id, {
          name: business.name,
          trade_name: business.trade_name,
          gstin: business.gstin,
          state_code: business.state_code,
          address: business.address,
          city: business.city,
          state: business.state,
          pincode: business.pincode,
          phone: business.phone,
          email: business.email,
          bank_name: business.bank_name,
          account_no: business.account_no,
          ifsc_code: business.ifsc_code,
          branch_name: business.branch_name,
          upi_id: business.upi_id,
        }),
      ]);

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    } catch (err) {
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const upiQrString = `upi://pay?pa=${business.upi_id || 'admin@okhdfcbank'}&pn=${encodeURIComponent(business.name)}&cu=INR`;
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(upiQrString)}`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Tenant Settings & Configurations
            </span>
            <span className="text-xs text-slate-500 font-mono">ID: {business.id.slice(0, 8)}...</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-amber-400" />
            <span>Dynamic ERP Module Configurations</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Customize multi-tenant feature flags, print layout templates, and banking parameters in Supabase JSONB
          </p>
        </div>

        {/* Save CTA */}
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-2 rounded-xl animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved to Supabase!</span>
            </div>
          )}

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black text-xs px-6 py-3 rounded-2xl shadow-xl transition flex items-center gap-2"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>{isSaving ? 'Persisting to DB...' : 'Save All Configurations'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex flex-wrap gap-2 bg-slate-950 border border-slate-800 p-2 rounded-2xl">
        {[
          { id: 'modules', label: '1. Feature Flags & Modules', icon: Sliders },
          { id: 'invoice', label: '2. Print Formats & Sequences', icon: Printer },
          { id: 'banking', label: '3. Bank Account & UPI Settlement', icon: CreditCard },
          { id: 'company', label: '4. Company Profile & GSTIN', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition ${
                isActive
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Dynamic Feature Flags & Operational Modules */}
      {activeTab === 'modules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* 1. Manufacturing & BOM Mode */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex items-start justify-between gap-4 shadow-sm hover:border-slate-700 transition">
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-400/10 text-amber-400 rounded-xl">
                  <Factory className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-white">
                  Manufacturing & Bill of Materials (BOM)
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Enable multi-level production recipes, raw material consumption tracking, assembly cost overheads, and automated finished goods stock conversion.
              </p>
              <div className="text-[10px] text-amber-300 font-semibold pt-1">
                JSON Key: <code className="bg-slate-900 px-1.5 py-0.5 rounded font-mono">settings.enable_bom</code>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => handleToggleSetting('enable_bom')}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition duration-300 shrink-0 ${
                settings.enable_bom ? 'bg-amber-400 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className={`w-6 h-6 rounded-full shadow-md transform transition ${
                settings.enable_bom ? 'bg-slate-950' : 'bg-slate-500'
              }`} />
            </button>
          </div>

          {/* 2. Purchase Orders (PO & Inward Workflow) */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex items-start justify-between gap-4 shadow-sm hover:border-slate-700 transition">
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-400/10 text-blue-400 rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-white">
                  Purchase Orders & Inward Procurement
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Issue vendor purchase orders (PO), track expected delivery dates, manage partial item receipts, and automatically convert accepted POs into stock inward.
              </p>
              <div className="text-[10px] text-blue-300 font-semibold pt-1">
                JSON Key: <code className="bg-slate-900 px-1.5 py-0.5 rounded font-mono">settings.enable_po</code>
              </div>
            </div>

            <button
              onClick={() => handleToggleSetting('enable_po')}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition duration-300 shrink-0 ${
                settings.enable_po ? 'bg-blue-500 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className={`w-6 h-6 rounded-full shadow-md transform transition ${
                settings.enable_po ? 'bg-slate-950' : 'bg-slate-500'
              }`} />
            </button>
          </div>

          {/* 3. GST Tax Engine & HSN Breakdown */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex items-start justify-between gap-4 shadow-sm hover:border-slate-700 transition">
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-400/10 text-emerald-400 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-white">
                  GST Billing & Tax Compliance Engine
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Automatically calculate itemized CGST (9%), SGST (9%), or Inter-State IGST (18%) based on party state code, HSN/SAC classification, and GSTR-1 audit trails.
              </p>
              <div className="text-[10px] text-emerald-300 font-semibold pt-1">
                JSON Key: <code className="bg-slate-900 px-1.5 py-0.5 rounded font-mono">settings.enable_gst</code>
              </div>
            </div>

            <button
              onClick={() => handleToggleSetting('enable_gst')}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition duration-300 shrink-0 ${
                settings.enable_gst ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className={`w-6 h-6 rounded-full shadow-md transform transition ${
                settings.enable_gst ? 'bg-slate-950' : 'bg-slate-500'
              }`} />
            </button>
          </div>

          {/* 4. Barcode & Serial Scanner Module */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex items-start justify-between gap-4 shadow-sm hover:border-slate-700 transition">
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-400/10 text-purple-400 rounded-xl">
                  <Barcode className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-white">
                  Barcode / QR Scanner & Serial Lookup
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Enable live camera & USB laser barcode scanners to instantly look up items by SKU/Barcode during rapid invoice billing and stock counts.
              </p>
              <div className="text-[10px] text-purple-300 font-semibold pt-1">
                JSON Key: <code className="bg-slate-900 px-1.5 py-0.5 rounded font-mono">settings.enable_barcode</code>
              </div>
            </div>

            <button
              onClick={() => handleToggleSetting('enable_barcode')}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition duration-300 shrink-0 ${
                settings.enable_barcode ? 'bg-purple-500 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className={`w-6 h-6 rounded-full shadow-md transform transition ${
                settings.enable_barcode ? 'bg-slate-950' : 'bg-slate-500'
              }`} />
            </button>
          </div>

          {/* 5. Transporter & Vehicle Logistics Tracking */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex items-start justify-between gap-4 shadow-sm hover:border-slate-700 transition">
            <div className="space-y-1.5 pr-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-400/10 text-indigo-400 rounded-xl">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-white">
                  Vehicle No., E-Way Bill & Transporter Info
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Display logistics input fields on sales invoices for Transporter Name, Vehicle Number, LR/RR Number, and E-Way Bill details required for factory shipments.
              </p>
              <div className="text-[10px] text-indigo-300 font-semibold pt-1">
                JSON Key: <code className="bg-slate-900 px-1.5 py-0.5 rounded font-mono">settings.show_vehicle_no</code>
              </div>
            </div>

            <button
              onClick={() => handleToggleSetting('show_vehicle_no')}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition duration-300 shrink-0 ${
                settings.show_vehicle_no ? 'bg-indigo-500 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className={`w-6 h-6 rounded-full shadow-md transform transition ${
                settings.show_vehicle_no ? 'bg-slate-950' : 'bg-slate-500'
              }`} />
            </button>
          </div>

        </div>
      )}

      {/* Tab 2: Print Formats & Sequences with Real-Time Live Preview */}
      {activeTab === 'invoice' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Configuration Form */}
          <div className="lg:col-span-6 bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-5">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <span>Invoice Print Layout & Sequence Numbering</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Configure your default receipt print engine and custom invoice prefix
              </p>
            </div>

            {/* Print Format Selector (3 Options) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Default Print Format
              </label>
              
              <div className="grid grid-cols-3 gap-2 text-xs font-extrabold">
                {[
                  { id: 'A4' as PrintFormat, label: 'Standard A4', desc: 'Corporate Tax Invoice' },
                  { id: 'A5' as PrintFormat, label: 'Compact A5', desc: 'Half-Page Voucher' },
                  { id: 'THERMAL_3INCH' as PrintFormat, label: '3" Thermal POS', desc: '80mm Roll (ESC/POS)' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => handlePrintFormatChange(fmt.id)}
                    className={`p-3 rounded-2xl border text-left transition ${
                      settings.print_format === fmt.id
                        ? 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-md'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-extrabold">{fmt.label}</div>
                    <div className={`text-[10px] ${settings.print_format === fmt.id ? 'text-slate-800' : 'text-slate-500'}`}>
                      {fmt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Invoice Prefix & Next Number */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Invoice Prefix
                </label>
                <input
                  type="text"
                  value={settings.invoice_prefix}
                  onChange={(e) => handleTextSettingChange('invoice_prefix', e.target.value)}
                  placeholder="e.g. INV/26-27/ or PAIS/"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Next Invoice Sequence #
                </label>
                <input
                  type="number"
                  value={settings.next_invoice_number}
                  onChange={(e) => handleTextSettingChange('next_invoice_number', parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Terms and Conditions Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Default Terms & Conditions (Footer)
              </label>
              <textarea
                rows={4}
                value={settings.terms_and_conditions}
                onChange={(e) => handleTextSettingChange('terms_and_conditions', e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 outline-none focus:border-amber-400"
              />
            </div>

          </div>

          {/* Right Real-Time Live Preview */}
          <div className="lg:col-span-6 bg-slate-950 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-black text-white">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Live Interactive Invoice Print Preview</span>
              </div>
              <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                Format: {settings.print_format}
              </span>
            </div>

            {/* Render Simulated Invoice Card */}
            <div className="flex justify-center bg-slate-900 p-4 rounded-2xl border border-slate-800 overflow-x-auto">
              
              <div
                className={`bg-white text-slate-950 p-4 shadow-xl font-sans text-[11px] transition-all border border-slate-300 rounded-lg ${
                  settings.print_format === 'THERMAL_3INCH'
                    ? 'w-[280px] font-mono text-[10px] leading-tight'
                    : settings.print_format === 'A5'
                    ? 'w-[360px] text-[11px]'
                    : 'w-full max-w-md text-xs'
                }`}
              >
                {/* Header */}
                <div className="text-center border-b border-dashed border-slate-400 pb-2 space-y-0.5">
                  <div className="font-black text-sm uppercase tracking-wide">
                    {business.name}
                  </div>
                  <div className="text-[9px] text-slate-600">{business.address}, {business.city}</div>
                  {settings.enable_gst && business.gstin && (
                    <div className="text-[9px] font-bold text-slate-800">GSTIN: {business.gstin}</div>
                  )}
                </div>

                {/* Metadata */}
                <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
                  <div className="flex justify-between">
                    <span>Invoice No:</span>
                    <span className="font-bold">{settings.invoice_prefix}{settings.next_invoice_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date().toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Billed To:</span>
                    <span className="font-bold">Sunil Vahurwagh (PAIS Trading)</span>
                  </div>
                  {settings.show_vehicle_no && (
                    <div className="flex justify-between text-indigo-700 font-bold">
                      <span>Vehicle No:</span>
                      <span>MH-16-CK-8899</span>
                    </div>
                  )}
                </div>

                {/* Item Line */}
                <div className="py-2 border-b border-dashed border-slate-400 text-[10px]">
                  <div className="flex justify-between font-bold border-b pb-1 mb-1 text-[9px]">
                    <span>ITEM</span>
                    <span>QTY</span>
                    <span>PRICE</span>
                    <span>TOTAL</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="truncate max-w-[120px]">Crucial P3 1TB NVMe</span>
                    <span>1 PCS</span>
                    <span>₹4,660</span>
                    <span className="font-bold">₹4,660</span>
                  </div>
                </div>

                {/* Tax Breakdown */}
                <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
                  <div className="flex justify-between">
                    <span>Taxable Subtotal:</span>
                    <span>₹4,660.00</span>
                  </div>
                  {settings.enable_gst ? (
                    <>
                      <div className="flex justify-between text-emerald-800">
                        <span>CGST (9%):</span>
                        <span>₹419.40</span>
                      </div>
                      <div className="flex justify-between text-emerald-800">
                        <span>SGST (9%):</span>
                        <span>₹419.40</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-slate-500">
                      <span>GST Tax:</span>
                      <span>Exempt / Non-GST</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-800">
                    <span>GRAND TOTAL:</span>
                    <span>₹{settings.enable_gst ? '5,498.80' : '4,660.00'}</span>
                  </div>
                </div>

                {/* UPI QR & Bank Box */}
                {business.upi_id && (
                  <div className="py-2 text-center border-b border-dashed border-slate-400">
                    <div className="text-[9px] font-bold uppercase">Scan & Pay via UPI</div>
                    <img src={upiQrUrl} alt="UPI QR" className="w-20 h-20 mx-auto my-1 border p-0.5 rounded" />
                    <div className="text-[8px] text-slate-500 font-mono">{business.upi_id}</div>
                  </div>
                )}

                {/* Footer Terms */}
                <div className="pt-2 text-[8px] text-slate-500 text-center leading-tight">
                  {settings.terms_and_conditions.split('\n')[0]}
                </div>

              </div>

            </div>

            <p className="text-[11px] text-slate-400 font-medium text-center">
              Changes reflect immediately on POS Thermal printers and A4 PDF downloads.
            </p>
          </div>

        </div>
      )}

      {/* Tab 3: Banking & UPI Settlement */}
      {activeTab === 'banking' && (
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400" />
              <span>Settlement Bank Account & Dynamic UPI QR</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              These details print on invoices and generate dynamic scan-and-pay UPI QR codes for instant customer settlements
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Bank Name
              </label>
              <input
                type="text"
                value={business.bank_name || ''}
                onChange={(e) => handleProfileChange('bank_name', e.target.value)}
                placeholder="e.g. HDFC Bank Ltd"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Bank Account Number
              </label>
              <input
                type="text"
                value={business.account_no || ''}
                onChange={(e) => handleProfileChange('account_no', e.target.value)}
                placeholder="e.g. 50200088994411"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                IFSC Code
              </label>
              <input
                type="text"
                value={business.ifsc_code || ''}
                onChange={(e) => handleProfileChange('ifsc_code', e.target.value.toUpperCase())}
                placeholder="e.g. HDFC0001234"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-amber-400 outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Bank Branch Name
              </label>
              <input
                type="text"
                value={business.branch_name || ''}
                onChange={(e) => handleProfileChange('branch_name', e.target.value)}
                placeholder="e.g. MIDC Nagapur Branch"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                UPI ID (Virtual Payment Address)
              </label>
              <input
                type="text"
                value={business.upi_id || ''}
                onChange={(e) => handleProfileChange('upi_id', e.target.value)}
                placeholder="e.g. paisautomation@okhdfcbank"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-emerald-400 outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: General Company Profile & GSTIN */}
      {activeTab === 'company' && (
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>Company Legal Identity & GSTIN Details</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Primary entity metadata printed on official tax invoices and filed in GSTR reports
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Legal Company Name
              </label>
              <input
                type="text"
                value={business.name}
                onChange={(e) => handleProfileChange('name', e.target.value)}
                placeholder="e.g. PAIS Industrial Automation & IT Solutions"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                GSTIN (15-Characters)
              </label>
              <input
                type="text"
                maxLength={15}
                value={business.gstin || ''}
                onChange={(e) => handleProfileChange('gstin', e.target.value.toUpperCase())}
                placeholder="e.g. 27AAAAA0000A1Z5"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-amber-400 outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Contact Phone
              </label>
              <input
                type="text"
                value={business.phone}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Official Email
              </label>
              <input
                type="email"
                value={business.email || ''}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Physical Registered Factory / Workshop Address
              </label>
              <input
                type="text"
                value={business.address || ''}
                onChange={(e) => handleProfileChange('address', e.target.value)}
                placeholder="e.g. Plot No. M-45, Phase II, MIDC Industrial Area, Nagapur"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-white outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
