'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Trash2,
  Barcode,
  Search,
  Users,
  CreditCard,
  Truck,
  Printer,
  Share2,
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  Percent,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  Business,
  Party,
  Item,
  PaymentMode,
  PrintFormat,
  CreateInvoiceDTO,
  CreateInvoiceItemDTO,
  CreatePartyDTO,
  Invoice,
} from '../../../../types/erp';
import {
  getBusinessProfile,
  getParties,
  getItems,
  createSalesInvoice,
  createParty,
} from '../../../../actions/erp-actions';
import { InvoicePrintModal } from '../../../../components/erp/InvoicePrintModal';
import { INITIAL_ERP_BUSINESS, MOCK_ERP_PARTIES, MOCK_ERP_ITEMS } from '../../../../lib/erp/erp-mock-data';

interface BillingRowItem {
  id: string;
  item_id: string;
  item_name: string;
  hsn_sac_code: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent: number;
  discount_amount: number;
  tax_rate: number;
  taxable_value: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_amount: number;
  available_stock: number;
}

export default function HighSpeedBillingPage() {
  // Master Data States
  const [business, setBusiness] = useState<Business>(INITIAL_ERP_BUSINESS);
  const [parties, setParties] = useState<Party[]>(MOCK_ERP_PARTIES);
  const [items, setItems] = useState<Item[]>(MOCK_ERP_ITEMS);

  // Selected Customer & Invoice Header State
  const [selectedPartyId, setSelectedPartyId] = useState<string>(MOCK_ERP_PARTIES[0]?.id || '');
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [isPartyDropdownOpen, setIsPartyDropdownOpen] = useState(false);
  
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [isCreditCustom, setIsCreditCustom] = useState(false);

  // Logistics & Transporter Details
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [transporterName, setTransporterName] = useState('');
  const [lrRrNumber, setLrRrNumber] = useState('');
  const [ewayBillNumber, setEwayBillNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Barcode quick search query
  const [barcodeQuery, setBarcodeQuery] = useState('');

  // Line Items State
  const [lineItems, setLineItems] = useState<BillingRowItem[]>([
    {
      id: 'row-1',
      item_id: MOCK_ERP_ITEMS[0]?.id || '',
      item_name: MOCK_ERP_ITEMS[0]?.name || '',
      hsn_sac_code: MOCK_ERP_ITEMS[0]?.hsn_sac_code || '',
      quantity: 1,
      unit: MOCK_ERP_ITEMS[0]?.unit || 'PCS',
      unit_price: MOCK_ERP_ITEMS[0]?.selling_price || 0,
      discount_percent: 0,
      discount_amount: 0,
      tax_rate: MOCK_ERP_ITEMS[0]?.tax_rate || 18,
      taxable_value: 0,
      cgst_amount: 0,
      sgst_amount: 0,
      igst_amount: 0,
      total_amount: 0,
      available_stock: MOCK_ERP_ITEMS[0]?.current_stock || 0,
    },
  ]);

  // Modals & Feedback
  const [isAddPartyModalOpen, setIsAddPartyModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Customer Form State
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerGstin, setNewCustomerGstin] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');

  // Load Initial Master Data on Mount
  useEffect(() => {
    async function loadData() {
      try {
        const [bData, pData, iData] = await Promise.all([
          getBusinessProfile(),
          getParties(),
          getItems(),
        ]);
        if (bData) setBusiness(bData);
        if (pData && pData.length > 0) setParties(pData);
        if (iData && iData.length > 0) setItems(iData);
      } catch (err) {
        console.warn('Using local mock data for high-speed billing:', err);
      }
    }
    loadData();
  }, []);

  // Selected Party Object
  const selectedParty = parties.find((p) => p.id === selectedPartyId) || parties[0];

  // GST State Detection: Intra-State (CGST + SGST) vs Inter-State (IGST)
  // Matching first 2 digits of Party GSTIN with Business GSTIN or Business State Code
  const businessStateCode = business.state_code || (business.gstin ? business.gstin.slice(0, 2) : '27');
  const partyStateCode = selectedParty?.state_code || (selectedParty?.gstin ? selectedParty.gstin.slice(0, 2) : businessStateCode);
  const isInterState = Boolean(selectedParty?.gstin && partyStateCode !== businessStateCode);

  // Recalculate Row Values
  const calculateRowMath = (
    row: BillingRowItem,
    interState: boolean,
    enableGst: boolean
  ): BillingRowItem => {
    const rawTotal = row.quantity * row.unit_price;
    const discAmount = row.discount_percent > 0 
      ? (rawTotal * row.discount_percent) / 100 
      : row.discount_amount;
    const taxable = Math.max(0, rawTotal - discAmount);

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (enableGst && row.tax_rate > 0) {
      if (interState) {
        igst = (taxable * row.tax_rate) / 100;
      } else {
        const halfRate = row.tax_rate / 2;
        cgst = (taxable * halfRate) / 100;
        sgst = (taxable * halfRate) / 100;
      }
    }

    const netRowTotal = taxable + cgst + sgst + igst;

    return {
      ...row,
      discount_amount: discAmount,
      taxable_value: Number(taxable.toFixed(2)),
      cgst_amount: Number(cgst.toFixed(2)),
      sgst_amount: Number(sgst.toFixed(2)),
      igst_amount: Number(igst.toFixed(2)),
      total_amount: Number(netRowTotal.toFixed(2)),
    };
  };

  // Recompute all rows when items, party, or GST engine changes
  useEffect(() => {
    setLineItems((prev) =>
      prev.map((row) => calculateRowMath(row, isInterState, business.settings.enable_gst))
    );
  }, [isInterState, business.settings.enable_gst]);

  // Row Manipulation Handlers
  const handleItemSelect = (rowIndex: number, selectedItemId: string) => {
    const foundItem = items.find((i) => i.id === selectedItemId);
    if (!foundItem) return;

    setLineItems((prev) => {
      const updated = [...prev];
      const target = updated[rowIndex];
      const modified: BillingRowItem = {
        ...target,
        item_id: foundItem.id,
        item_name: foundItem.name,
        hsn_sac_code: foundItem.hsn_sac_code || '',
        unit: foundItem.unit,
        unit_price: foundItem.selling_price,
        tax_rate: foundItem.tax_rate,
        available_stock: foundItem.current_stock,
      };
      updated[rowIndex] = calculateRowMath(modified, isInterState, business.settings.enable_gst);
      return updated;
    });
  };

  const handleRowFieldChange = (rowIndex: number, field: keyof BillingRowItem, value: any) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const target = { ...updated[rowIndex], [field]: value };
      updated[rowIndex] = calculateRowMath(target, isInterState, business.settings.enable_gst);
      return updated;
    });
  };

  const handleAddRow = () => {
    const defaultItem = items[0];
    const newRow: BillingRowItem = calculateRowMath(
      {
        id: `row-${Date.now()}`,
        item_id: defaultItem ? defaultItem.id : '',
        item_name: defaultItem ? defaultItem.name : '',
        hsn_sac_code: defaultItem ? defaultItem.hsn_sac_code || '' : '',
        quantity: 1,
        unit: defaultItem ? defaultItem.unit : 'PCS',
        unit_price: defaultItem ? defaultItem.selling_price : 0,
        discount_percent: 0,
        discount_amount: 0,
        tax_rate: defaultItem ? defaultItem.tax_rate : 18,
        taxable_value: 0,
        cgst_amount: 0,
        sgst_amount: 0,
        igst_amount: 0,
        total_amount: 0,
        available_stock: defaultItem ? defaultItem.current_stock : 0,
      },
      isInterState,
      business.settings.enable_gst
    );

    setLineItems((prev) => [...prev, newRow]);
  };

  const handleRemoveRow = (rowIndex: number) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, idx) => idx !== rowIndex));
  };

  // Barcode / SKU Instant Add
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeQuery.trim()) return;

    const matchedItem = items.find(
      (item) =>
        item.sku_barcode === barcodeQuery.trim() ||
        item.name.toLowerCase().includes(barcodeQuery.trim().toLowerCase())
    );

    if (matchedItem) {
      // Check if already in rows
      const existingIdx = lineItems.findIndex((r) => r.item_id === matchedItem.id);
      if (existingIdx > -1) {
        handleRowFieldChange(existingIdx, 'quantity', lineItems[existingIdx].quantity + 1);
      } else {
        const newRow = calculateRowMath(
          {
            id: `row-${Date.now()}`,
            item_id: matchedItem.id,
            item_name: matchedItem.name,
            hsn_sac_code: matchedItem.hsn_sac_code || '',
            quantity: 1,
            unit: matchedItem.unit,
            unit_price: matchedItem.selling_price,
            discount_percent: 0,
            discount_amount: 0,
            tax_rate: matchedItem.tax_rate,
            taxable_value: 0,
            cgst_amount: 0,
            sgst_amount: 0,
            igst_amount: 0,
            total_amount: 0,
            available_stock: matchedItem.current_stock,
          },
          isInterState,
          business.settings.enable_gst
        );
        setLineItems((prev) => [...prev, newRow]);
      }
      setBarcodeQuery('');
    } else {
      alert(`No item found matching SKU/Barcode: ${barcodeQuery}`);
    }
  };

  // Real-Time Total Calculations
  const totalTaxable = lineItems.reduce((sum, r) => sum + r.taxable_value, 0);
  const totalCgst = lineItems.reduce((sum, r) => sum + r.cgst_amount, 0);
  const totalSgst = lineItems.reduce((sum, r) => sum + r.sgst_amount, 0);
  const totalIgst = lineItems.reduce((sum, r) => sum + r.igst_amount, 0);
  const totalDiscount = lineItems.reduce((sum, r) => sum + r.discount_amount, 0);

  const rawGrandTotal = totalTaxable + totalCgst + totalSgst + totalIgst;
  const roundedGrandTotal = Math.round(rawGrandTotal);
  const roundOff = Number((roundedGrandTotal - rawGrandTotal).toFixed(2));

  // Sync Received Amount unless in credit mode
  useEffect(() => {
    if (paymentMode === 'CREDIT') {
      setReceivedAmount(0);
    } else if (!isCreditCustom) {
      setReceivedAmount(roundedGrandTotal);
    }
  }, [roundedGrandTotal, paymentMode, isCreditCustom]);

  const balanceDue = Math.max(0, Number((roundedGrandTotal - receivedAmount).toFixed(2)));

  // Quick Customer Creation Handler
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;

    try {
      const payload: CreatePartyDTO = {
        business_id: business.id,
        type: 'CUSTOMER',
        name: newCustomerName,
        company_name: newCompanyName || undefined,
        phone: newCustomerPhone || undefined,
        gstin: newCustomerGstin ? newCustomerGstin.toUpperCase() : undefined,
        billing_address: newCustomerAddress || undefined,
      };

      const result = await createParty(payload);
      if (result.success && result.data) {
        setParties((prev) => [result.data, ...prev]);
        setSelectedPartyId(result.data.id);
        setIsAddPartyModalOpen(false);
        setNewCustomerName('');
        setNewCompanyName('');
        setNewCustomerPhone('');
        setNewCustomerGstin('');
        setNewCustomerAddress('');
      }
    } catch (err) {
      alert('Failed to add customer. Please try again.');
    }
  };

  // Save Invoice Handler
  const handleSaveInvoice = async (openPrintAfter: boolean = true) => {
    if (!selectedParty) {
      alert('Please select a customer.');
      return;
    }

    if (lineItems.length === 0 || !lineItems[0].item_id) {
      alert('Please add at least one line item.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateInvoiceDTO = {
        business_id: business.id,
        customer_id: selectedParty.id,
        invoice_date: invoiceDate,
        due_date: dueDate || undefined,
        payment_mode: paymentMode,
        taxable_amount: Number(totalTaxable.toFixed(2)),
        cgst_amount: Number(totalCgst.toFixed(2)),
        sgst_amount: Number(totalSgst.toFixed(2)),
        igst_amount: Number(totalIgst.toFixed(2)),
        discount_amount: Number(totalDiscount.toFixed(2)),
        round_off: roundOff,
        grand_total: roundedGrandTotal,
        paid_amount: receivedAmount,
        vehicle_number: vehicleNumber || undefined,
        transporter_name: transporterName || undefined,
        lr_rr_number: lrRrNumber || undefined,
        eway_bill_number: ewayBillNumber || undefined,
        print_format: business.settings.print_format || 'A4',
        notes: notes || undefined,
        items: lineItems.map((r) => ({
          item_id: r.item_id,
          item_name: r.item_name,
          hsn_sac_code: r.hsn_sac_code,
          quantity: r.quantity,
          unit: r.unit as any,
          unit_price: r.unit_price,
          discount_percent: r.discount_percent,
          discount_amount: r.discount_amount,
          taxable_value: r.taxable_value,
          tax_rate: r.tax_rate,
          cgst_amount: r.cgst_amount,
          sgst_amount: r.sgst_amount,
          igst_amount: r.igst_amount,
          total_amount: r.total_amount,
        })),
      };

      const res = await createSalesInvoice(payload);

      if (res.success && res.data) {
        setCreatedInvoice(res.data);
        if (openPrintAfter) {
          setIsPrintModalOpen(true);
        } else {
          alert(`Invoice #${res.data.invoice_number} saved successfully!`);
        }
      }
    } catch (err) {
      alert('Failed to create sales invoice. Please check your data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-5 max-w-[1440px] mx-auto text-slate-100">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 border border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xl">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" /> POS Fast-Billing
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Prefix: <strong className="text-white">{business.settings.invoice_prefix}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>Create B2B Sales Tax Invoice</span>
          </h1>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSaveInvoice(false)}
            disabled={isSubmitting}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Invoice (F2)</span>
          </button>

          <button
            onClick={() => handleSaveInvoice(true)}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 text-xs font-black rounded-xl shadow-lg transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Save & Print (Ctrl+P)</span>
          </button>
        </div>
      </div>

      {/* Grid: 1. Customer Khata Selector + Barcode Scanner Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Customer Selector Card (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 p-4 sm:p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Customer Khata & Party Details</span>
            </label>
            <button
              type="button"
              onClick={() => setIsAddPartyModalOpen(true)}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ Add New Customer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            
            {/* Customer Dropdown */}
            <div className="sm:col-span-7 relative">
              <select
                value={selectedPartyId}
                onChange={(e) => setSelectedPartyId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-amber-400 cursor-pointer"
              >
                {parties.filter((p) => p.type === 'CUSTOMER').map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.company_name ? `${party.company_name} (${party.name})` : party.name} • {party.phone || 'No phone'}
                  </option>
                ))}
              </select>
            </div>

            {/* GSTIN & State Auto-Detection Badge */}
            <div className="sm:col-span-5 flex items-center justify-between sm:justify-end gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs">
              <div>
                <div className="text-[10px] text-slate-400 font-medium">GST Classification:</div>
                <div className="font-extrabold text-[11px] flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isInterState ? 'bg-purple-400' : 'bg-emerald-400'}`}></span>
                  <span className={isInterState ? 'text-purple-300' : 'text-emerald-300'}>
                    {isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST+SGST)'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-medium">Outstanding Khata:</div>
                <div className={`font-black text-xs ${selectedParty?.current_balance > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                  ₹{(selectedParty?.current_balance || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

          </div>

          {/* Party Quick Info Strip */}
          {selectedParty && (
            <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
              <div className="flex items-center gap-4">
                <span>GSTIN: <strong className="font-mono text-slate-200">{selectedParty.gstin || 'Unregistered Consumer'}</strong></span>
                <span>Phone: <strong className="text-slate-200">{selectedParty.phone || 'N/A'}</strong></span>
              </div>
              <div className="truncate max-w-md">
                Address: <span className="text-slate-300">{selectedParty.billing_address || 'MIDC Nagapur, Ahilyanagar'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Invoice Header Details (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-800 p-4 sm:p-5 rounded-3xl space-y-3">
          <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Invoice Date & Payment Terms</span>
          </label>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400">Invoice Date</span>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400">Due Date (Optional)</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Barcode Quick Search Box */}
          <form onSubmit={handleBarcodeSubmit} className="pt-1">
            <div className="relative">
              <input
                type="text"
                value={barcodeQuery}
                onChange={(e) => setBarcodeQuery(e.target.value)}
                placeholder="Scan Barcode or type SKU + Enter..."
                className="w-full pl-8 pr-16 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-amber-400"
              />
              <Barcode className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-lg hover:bg-amber-300"
              >
                Scan Add
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Dynamic Line Items Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Billed Items & Inventory Line Items
            </h2>
            <span className="bg-slate-800 text-slate-300 font-mono text-xs px-2 py-0.5 rounded-full">
              {lineItems.length} item{lineItems.length > 1 ? 's' : ''}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddRow}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black px-3.5 py-1.5 rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Row (Enter)</span>
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-extrabold text-[10px] uppercase">
                <th className="py-3 px-3 text-center w-10">#</th>
                <th className="py-3 px-3 min-w-[240px]">Item Description</th>
                <th className="py-3 px-2 w-24 text-center">HSN/SAC</th>
                <th className="py-3 px-2 w-20 text-right">Qty</th>
                <th className="py-3 px-2 w-16 text-center">Unit</th>
                <th className="py-3 px-2 w-28 text-right">Price (₹)</th>
                <th className="py-3 px-2 w-20 text-right">Disc %</th>
                <th className="py-3 px-2 w-28 text-right">Taxable</th>
                {business.settings.enable_gst && (
                  <th className="py-3 px-2 w-24 text-center">GST %</th>
                )}
                <th className="py-3 px-3 w-32 text-right">Net Amount</th>
                <th className="py-3 px-2 text-center w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {lineItems.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-900/40 transition">
                  {/* Row Number */}
                  <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                    {idx + 1}
                  </td>

                  {/* Item Selector */}
                  <td className="py-2.5 px-3">
                    <select
                      value={row.item_id}
                      onChange={(e) => handleItemSelect(idx, e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white outline-none focus:border-amber-400"
                    >
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.current_stock} {item.unit} in stock)
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* HSN Code */}
                  <td className="py-2.5 px-2">
                    <input
                      type="text"
                      value={row.hsn_sac_code}
                      onChange={(e) => handleRowFieldChange(idx, 'hsn_sac_code', e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-center font-mono text-xs text-slate-300 outline-none focus:border-amber-400"
                    />
                  </td>

                  {/* Quantity */}
                  <td className="py-2.5 px-2">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={row.quantity}
                      onChange={(e) => handleRowFieldChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-right font-mono font-bold text-white outline-none focus:border-amber-400"
                    />
                  </td>

                  {/* Unit */}
                  <td className="py-2.5 px-2 text-center font-mono text-slate-400 text-xs">
                    {row.unit}
                  </td>

                  {/* Unit Price */}
                  <td className="py-2.5 px-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.unit_price}
                      onChange={(e) => handleRowFieldChange(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-right font-mono font-bold text-white outline-none focus:border-amber-400"
                    />
                  </td>

                  {/* Discount % */}
                  <td className="py-2.5 px-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={row.discount_percent}
                      onChange={(e) => handleRowFieldChange(idx, 'discount_percent', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-right font-mono text-xs text-slate-300 outline-none focus:border-amber-400"
                    />
                  </td>

                  {/* Taxable Amount */}
                  <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-300">
                    ₹{row.taxable_value.toFixed(2)}
                  </td>

                  {/* GST Tax Rate */}
                  {business.settings.enable_gst && (
                    <td className="py-2.5 px-2">
                      <select
                        value={row.tax_rate}
                        onChange={(e) => handleRowFieldChange(idx, 'tax_rate', parseFloat(e.target.value))}
                        className="w-full px-1.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-center font-mono text-xs font-bold text-amber-400 outline-none"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </td>
                  )}

                  {/* Net Total Amount */}
                  <td className="py-2.5 px-3 text-right font-mono font-black text-white text-sm">
                    ₹{row.total_amount.toFixed(2)}
                  </td>

                  {/* Remove Button */}
                  <td className="py-2.5 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      disabled={lineItems.length === 1}
                      className="text-slate-500 hover:text-rose-400 disabled:opacity-30 transition p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Section: Logistics & Real-Time Calculation Settlement Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Col: Transporter Logistics & Payment Mode (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-4">
          
          {/* Payment Mode Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Settlement Payment Mode</span>
            </label>

            <div className="grid grid-cols-5 gap-2 text-xs font-bold">
              {[
                { id: 'CASH' as PaymentMode, label: 'Cash' },
                { id: 'UPI' as PaymentMode, label: 'UPI / QR' },
                { id: 'BANK_TRANSFER' as PaymentMode, label: 'Bank / NEFT' },
                { id: 'CHEQUE' as PaymentMode, label: 'Cheque' },
                { id: 'CREDIT' as PaymentMode, label: 'Credit (Udhaari)' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMode(m.id)}
                  className={`py-2 px-2 rounded-xl border text-center transition ${
                    paymentMode === m.id
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Received Amount vs Balance Due */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Received Amount (₹)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={receivedAmount}
                onChange={(e) => {
                  setReceivedAmount(parseFloat(e.target.value) || 0);
                  setIsCreditCustom(true);
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl font-mono text-sm font-black text-emerald-400 outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Balance Due (To Khata)</span>
              <div className={`px-3 py-2 rounded-xl font-mono text-sm font-black ${balanceDue > 0 ? 'text-rose-400 bg-rose-950/30' : 'text-slate-400 bg-slate-900'}`}>
                ₹{balanceDue.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Optional Logistics Fields (Controlled by Business Settings: show_vehicle_no) */}
          {business.settings.show_vehicle_no && (
            <div className="space-y-2 pt-2 border-t border-slate-900">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-indigo-400" />
                <span>Transport & Vehicle Logistics</span>
              </label>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold">Vehicle No</span>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. MH16CK8899"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold">Transporter</span>
                  <input
                    type="text"
                    value={transporterName}
                    onChange={(e) => setTransporterName(e.target.value)}
                    placeholder="e.g. MIDC Express"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold">E-Way Bill No</span>
                  <input
                    type="text"
                    value={ewayBillNumber}
                    onChange={(e) => setEwayBillNumber(e.target.value)}
                    placeholder="e.g. 231456789012"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Col: Real-Time Calculations Math Engine (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-3 font-mono text-xs shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-sans font-black text-xs uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
              Tax Summary & Final Computations
            </h3>

            <div className="flex justify-between text-slate-300 py-1">
              <span>Total Taxable Amount:</span>
              <span className="font-bold">₹{totalTaxable.toFixed(2)}</span>
            </div>

            {business.settings.enable_gst && (
              <>
                {isInterState ? (
                  <div className="flex justify-between text-purple-400 py-1">
                    <span>IGST (Inter-State):</span>
                    <span className="font-bold">₹{totalIgst.toFixed(2)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-emerald-400 py-1">
                      <span>CGST (Central Tax):</span>
                      <span className="font-bold">₹{totalCgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 py-1">
                      <span>SGST (State Tax):</span>
                      <span className="font-bold">₹{totalSgst.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </>
            )}

            {totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-400 py-1">
                <span>Total Discount Applied:</span>
                <span className="font-bold">-₹{totalDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-400 py-1 text-[11px]">
              <span>Auto Round-off:</span>
              <span>{roundOff >= 0 ? `+₹${roundOff.toFixed(2)}` : `-₹${Math.abs(roundOff).toFixed(2)}`}</span>
            </div>

            <div className="pt-3 border-t-2 border-slate-800 flex justify-between items-baseline text-white">
              <span className="font-sans font-black text-sm uppercase">Net Payable:</span>
              <span className="font-black text-2xl text-amber-400">
                ₹{roundedGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Quick Submit Buttons */}
          <div className="pt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSaveInvoice(false)}
              disabled={isSubmitting}
              className="py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl border border-slate-700 transition"
            >
              {isSubmitting ? 'Processing...' : 'Save Invoice (F2)'}
            </button>

            <button
              onClick={() => handleSaveInvoice(true)}
              disabled={isSubmitting}
              className="py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Save & Print</span>
            </button>
          </div>

        </div>

      </div>

      {/* Inline Modal: Add New Customer */}
      {isAddPartyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Add New Customer to Khata</span>
              </h3>
              <button
                onClick={() => setIsAddPartyModalOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Customer / Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="e.g. Ramesh Kulkarni"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Company / Enterprise Name</label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="e.g. Kulkarni Agro Tech"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="e.g. 9822011223"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">GSTIN (Optional)</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={newCustomerGstin}
                    onChange={(e) => setNewCustomerGstin(e.target.value.toUpperCase())}
                    placeholder="27AAAAA0000A1Z5"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl font-mono text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Billing Address</label>
                <textarea
                  rows={2}
                  value={newCustomerAddress}
                  onChange={(e) => setNewCustomerAddress(e.target.value)}
                  placeholder="Street, City, Pincode"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPartyModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 text-slate-950 rounded-xl font-black hover:bg-amber-300"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dual Print Engine Modal */}
      {createdInvoice && (
        <InvoicePrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          invoice={createdInvoice}
          business={business}
        />
      )}

    </div>
  );
}
