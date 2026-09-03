'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Plus,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Share2,
  Printer,
  X,
  Building2,
  Search,
  ExternalLink,
  ChevronRight,
  ArrowDownRight,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { PurchaseOrder, PurchaseInvoice, Business, Party, Item, ConvertPoToBillDTO } from '../../../types/erp';
import {
  getPurchaseOrders,
  getPurchaseInvoices,
  getBusinessProfile,
  convertPoToPurchaseBill,
} from '../../../actions/erp-actions';
import {
  INITIAL_ERP_BUSINESS,
  MOCK_ERP_PURCHASE_ORDERS,
  MOCK_ERP_PURCHASE_INVOICES,
} from '../../../lib/erp/erp-mock-data';

export default function PurchasesOverviewPage() {
  const [business, setBusiness] = useState<Business>(INITIAL_ERP_BUSINESS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_ERP_PURCHASE_ORDERS);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>(MOCK_ERP_PURCHASE_INVOICES);
  const [activeTab, setActiveTab] = useState<'orders' | 'bills'>('orders');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Goods Receipt (GRN) / Convert to Bill Modal State
  const [selectedPoForGrn, setSelectedPoForGrn] = useState<PurchaseOrder | null>(null);
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
  const [grnDeliveredQuantities, setGrnDeliveredQuantities] = useState<{ [itemId: string]: number }>({});
  const [vendorInvoiceNo, setVendorInvoiceNo] = useState('');
  const [paymentMode, setPaymentMode] = useState<'CREDIT' | 'CASH' | 'BANK_TRANSFER'>('CREDIT');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [dueDateDays, setDueDateDays] = useState<number>(30);
  const [isConverting, setIsConverting] = useState(false);

  // Printable PO Slip Modal
  const [selectedPoForPrint, setSelectedPoForPrint] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [bData, poData, piData] = await Promise.all([
          getBusinessProfile(),
          getPurchaseOrders(),
          getPurchaseInvoices(),
        ]);
        if (bData) setBusiness(bData);
        if (poData && poData.length > 0) setPurchaseOrders(poData);
        if (piData && piData.length > 0) setPurchaseInvoices(piData);
      } catch (err) {
        console.warn('Purchases page loaded with local fallback state:', err);
      }
    }
    loadData();
  }, []);

  // Filter Purchase Orders
  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      po.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplier?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplier?.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Open GRN Modal
  const handleOpenGrnModal = (po: PurchaseOrder) => {
    setSelectedPoForGrn(po);
    const initialQtyMap: { [itemId: string]: number } = {};
    po.items?.forEach((item) => {
      initialQtyMap[item.item_id] = item.quantity;
    });
    setGrnDeliveredQuantities(initialQtyMap);
    setVendorInvoiceNo(`VEN-${Math.floor(10000 + Math.random() * 90000)}`);
    setPaidAmount(0);
    setIsGrnModalOpen(true);
  };

  // Submit Goods Receipt & Convert to Purchase Bill
  const handleConvertPo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoForGrn) return;

    setIsConverting(true);

    try {
      const today = new Date();
      const dueDate = new Date();
      dueDate.setDate(today.getDate() + dueDateDays);

      const billItems = (selectedPoForGrn.items || []).map((item) => {
        const receivedQty = grnDeliveredQuantities[item.item_id] ?? item.quantity;
        const lineTaxable = receivedQty * item.unit_price;
        const lineTax = (lineTaxable * item.tax_rate) / 100;
        return {
          item_id: item.item_id,
          item_name: item.item?.name || 'Raw Material / Item',
          hsn_sac_code: item.item?.hsn_sac_code || '',
          received_quantity: receivedQty,
          unit: (item.item?.unit as any) || 'PCS',
          unit_price: item.unit_price,
          tax_rate: item.tax_rate,
          tax_amount: Number(lineTax.toFixed(2)),
          total_amount: Number((lineTaxable + lineTax).toFixed(2)),
        };
      });

      const payload: ConvertPoToBillDTO = {
        po_id: selectedPoForGrn.id,
        bill_number: `BILL/26-27/${String(purchaseInvoices.length + 24).padStart(4, '0')}`,
        vendor_invoice_number: vendorInvoiceNo || undefined,
        bill_date: today.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        payment_mode: paymentMode as any,
        paid_amount: paidAmount,
        notes: `Converted from PO #${selectedPoForGrn.po_number}`,
        items: billItems,
      };

      const res = await convertPoToPurchaseBill(selectedPoForGrn.id, payload);

      if (res.success && res.data) {
        setPurchaseInvoices((prev) => [res.data, ...prev]);
        setPurchaseOrders((prev) =>
          prev.map((p) => (p.id === selectedPoForGrn.id ? { ...p, status: 'COMPLETED' } : p))
        );
        setIsGrnModalOpen(false);
        alert(`Goods inward recorded! Converted to Vendor Bill #${res.data.bill_number}.`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to convert PO to Bill');
    } finally {
      setIsConverting(false);
    }
  };

  // WhatsApp Dispatch Helper for PO
  const handleSharePoWhatsApp = (po: PurchaseOrder) => {
    const supplierName = po.supplier?.company_name || po.supplier?.name || 'Vendor';
    const supplierPhone = (po.supplier?.phone || '').replace(/[^0-9]/g, '');
    const cleanPhone = supplierPhone.startsWith('91') ? supplierPhone : `91${supplierPhone}`;

    const text = `Hello *${supplierName}*,\nPlease find our Purchase Order *${po.po_number}* from *${business.name}*.\n\n📦 *Total Amount:* ₹${po.total_amount.toLocaleString('en-IN')}\n🗓️ *Expected Delivery:* ${po.expected_delivery_date || 'Urgent'}\n\nPlease confirm receipt and dispatch schedule. Thank you!`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-blue-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Procurement & Vendor Operations
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Inward Pipeline
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-blue-400" />
            <span>Supplier Purchase Orders & Inward</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Issue vendor purchase orders (PO), record Goods Receipt (GRN), and convert into supplier credit bills
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/purchases/orders/new"
            className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-xl transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Generate Purchase Order (PO)</span>
          </Link>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        <div className="flex bg-slate-950 border border-slate-800 p-1.5 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'orders' ? 'bg-blue-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Purchase Orders ({purchaseOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('bills')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'bills' ? 'bg-blue-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vendor Invoices & Bills ({purchaseInvoices.length})
          </button>
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PO # or Vendor..."
              className="pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-400 w-48 sm:w-60"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>

          {activeTab === 'orders' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold px-3 py-2 rounded-xl outline-none focus:border-blue-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ISSUED">Issued</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          )}
        </div>

      </div>

      {/* Tab 1: Purchase Orders List */}
      {activeTab === 'orders' && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-extrabold text-[10px] uppercase">
                  <th className="py-3.5 px-4">PO Number</th>
                  <th className="py-3.5 px-3">Vendor / Supplier</th>
                  <th className="py-3.5 px-3 text-center">Order Date</th>
                  <th className="py-3.5 px-3 text-center">Expected Delivery</th>
                  <th className="py-3.5 px-3 text-right">Items</th>
                  <th className="py-3.5 px-3 text-right">Total Amount</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPOs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No purchase orders match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPOs.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3.5 px-4 font-mono font-black text-white text-xs">
                        {po.po_number}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-extrabold text-white">
                          {po.supplier?.company_name || po.supplier?.name || 'Vendor'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {po.supplier?.phone || 'No phone'}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                        {po.order_date}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-amber-400">
                        {po.expected_delivery_date || 'ASAP'}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-300">
                        {po.items?.length || 0}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-black text-white text-sm">
                        ₹{po.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase ${
                          po.status === 'COMPLETED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : po.status === 'ISSUED'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* GRN / Convert to Bill Button */}
                          {po.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleOpenGrnModal(po)}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] px-2.5 py-1.5 rounded-lg transition shadow flex items-center gap-1"
                            >
                              <Truck className="w-3 h-3" />
                              <span>Receive (GRN)</span>
                            </button>
                          )}

                          {/* Print PO */}
                          <button
                            onClick={() => setSelectedPoForPrint(po)}
                            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition"
                            title="Print PO Slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* WhatsApp PO */}
                          <button
                            onClick={() => handleSharePoWhatsApp(po)}
                            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded-lg border border-slate-800 transition"
                            title="Share on WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Vendor Purchase Invoices List */}
      {activeTab === 'bills' && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-extrabold text-[10px] uppercase">
                  <th className="py-3.5 px-4">Bill Number</th>
                  <th className="py-3.5 px-3">Supplier Name</th>
                  <th className="py-3.5 px-3">Vendor Inv #</th>
                  <th className="py-3.5 px-3 text-center">Bill Date</th>
                  <th className="py-3.5 px-3 text-center">Payment Due Date</th>
                  <th className="py-3.5 px-3 text-right">Grand Total</th>
                  <th className="py-3.5 px-3 text-right">Balance Due</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {purchaseInvoices.map((pi) => (
                  <tr key={pi.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-4 font-mono font-black text-white">
                      {pi.bill_number}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-extrabold text-white">
                        {pi.supplier?.company_name || pi.supplier?.name || 'Vendor'}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-400">
                      {pi.vendor_invoice_number || 'N/A'}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                      {pi.bill_date}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-rose-400 font-bold">
                      {pi.due_date || 'Net 30'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-white">
                      ₹{pi.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-400">
                      ₹{pi.balance_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase ${
                        pi.status === 'PAID'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {pi.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Goods Receipt (GRN) & Convert to Purchase Bill */}
      {isGrnModalOpen && selectedPoForGrn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-2xl w-full shadow-2xl space-y-4 text-slate-100 my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-400" />
                  <span>Goods Inward Receipt (GRN) & Bill Conversion</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  PO #{selectedPoForGrn.po_number} • Supplier: {selectedPoForGrn.supplier?.company_name || selectedPoForGrn.supplier?.name}
                </p>
              </div>
              <button
                onClick={() => setIsGrnModalOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConvertPo} className="space-y-4 text-xs">
              
              {/* Vendor Invoice # & Payment Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Vendor Invoice / Challan #</label>
                  <input
                    type="text"
                    required
                    value={vendorInvoiceNo}
                    onChange={(e) => setVendorInvoiceNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Supplier Credit Terms</label>
                  <select
                    value={dueDateDays}
                    onChange={(e) => setDueDateDays(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-emerald-400"
                  >
                    <option value={15}>Net 15 Days Credit</option>
                    <option value={30}>Net 30 Days Credit</option>
                    <option value={60}>Net 60 Days Credit</option>
                    <option value={0}>Immediate Payment (Cash)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-emerald-400"
                  >
                    <option value="CREDIT">Credit (Accounts Payable)</option>
                    <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                    <option value="CASH">Cash Settlement</option>
                  </select>
                </div>
              </div>

              {/* Delivered Items Table */}
              <div className="space-y-1.5">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Delivered Quantities (Increments Live Inventory Stock)
                </div>

                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-extrabold text-[10px] uppercase">
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-2 text-right">Ordered Qty</th>
                        <th className="py-2.5 px-2 text-right w-28">Received Qty</th>
                        <th className="py-2.5 px-3 text-right">Rate</th>
                        <th className="py-2.5 px-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {selectedPoForGrn.items?.map((item) => {
                        const recQty = grnDeliveredQuantities[item.item_id] ?? item.quantity;
                        const lineTotal = recQty * item.unit_price * (1 + item.tax_rate / 100);
                        return (
                          <tr key={item.item_id}>
                            <td className="py-2.5 px-3 font-bold text-white">
                              {item.item?.name || 'Raw Material'}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-slate-400">
                              {item.quantity}
                            </td>
                            <td className="py-2.5 px-2 text-right">
                              <input
                                type="number"
                                min="0"
                                max={item.quantity * 2}
                                step="any"
                                value={recQty}
                                onChange={(e) =>
                                  setGrnDeliveredQuantities({
                                    ...grnDeliveredQuantities,
                                    [item.item_id]: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-right font-mono font-bold text-emerald-400 outline-none focus:border-emerald-400"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                              ₹{item.unit_price}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-black text-white">
                              ₹{lineTotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGrnModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConverting}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 rounded-xl font-black shadow-lg transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isConverting ? 'Processing Inward...' : 'Convert to Purchase Bill & Add Stock'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: Printable PO Slip */}
      {selectedPoForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-2xl w-full shadow-2xl space-y-4 text-slate-100 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-400" />
                <span>Purchase Order Slip: {selectedPoForPrint.po_number}</span>
              </h3>
              <button
                onClick={() => setSelectedPoForPrint(null)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Paper Slip */}
            <div className="bg-white text-slate-950 p-6 rounded-xl font-sans text-xs space-y-3">
              <div className="border-b pb-2 flex justify-between">
                <div>
                  <div className="font-black text-base uppercase">{business.name}</div>
                  <div className="text-[10px] text-slate-600">{business.address}, {business.city}</div>
                  <div className="text-[10px] font-bold">GSTIN: {business.gstin}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-sm text-blue-900 uppercase">PURCHASE ORDER</div>
                  <div className="font-mono font-bold text-xs">{selectedPoForPrint.po_number}</div>
                  <div className="text-[10px] text-slate-600">Date: {selectedPoForPrint.order_date}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border text-[11px]">
                <div className="font-bold text-[10px] uppercase text-slate-500">Vendor / Supplier:</div>
                <div className="font-extrabold text-slate-950">{selectedPoForPrint.supplier?.company_name || selectedPoForPrint.supplier?.name}</div>
                <div className="text-slate-600">{selectedPoForPrint.supplier?.billing_address}</div>
                <div className="font-mono">GSTIN: {selectedPoForPrint.supplier?.gstin || 'N/A'}</div>
              </div>

              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-y font-bold">
                    <th className="p-1.5">Item</th>
                    <th className="p-1.5 text-right">Qty</th>
                    <th className="p-1.5 text-right">Rate</th>
                    <th className="p-1.5 text-right">Tax %</th>
                    <th className="p-1.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedPoForPrint.items?.map((i, idx) => (
                    <tr key={idx}>
                      <td className="p-1.5 font-bold">{i.item?.name || 'Raw Material'}</td>
                      <td className="p-1.5 text-right">{i.quantity}</td>
                      <td className="p-1.5 text-right">₹{i.unit_price}</td>
                      <td className="p-1.5 text-right">{i.tax_rate}%</td>
                      <td className="p-1.5 text-right font-bold">₹{i.total_amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t pt-2 flex justify-between font-black text-sm">
                <span>TOTAL PO VALUE:</span>
                <span>₹{selectedPoForPrint.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-500 text-slate-950 font-black rounded-xl text-xs"
              >
                Print PO
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
