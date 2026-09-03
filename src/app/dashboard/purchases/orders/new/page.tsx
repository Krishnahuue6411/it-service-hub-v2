'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Building2,
  CheckCircle2,
  AlertCircle,
  Truck,
  Calendar,
} from 'lucide-react';
import { Business, Party, Item, CreatePurchaseOrderDTO } from '../../../../../types/erp';
import {
  getBusinessProfile,
  getParties,
  getItems,
  createPurchaseOrder,
} from '../../../../../actions/erp-actions';
import {
  INITIAL_ERP_BUSINESS,
  MOCK_ERP_PARTIES,
  MOCK_ERP_ITEMS,
} from '../../../../../lib/erp/erp-mock-data';

interface PoRowItem {
  id: string;
  item_id: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business>(INITIAL_ERP_BUSINESS);
  const [suppliers, setSuppliers] = useState<Party[]>(
    MOCK_ERP_PARTIES.filter((p) => p.type === 'SUPPLIER')
  );
  const [items, setItems] = useState<Item[]>(MOCK_ERP_ITEMS);

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    MOCK_ERP_PARTIES.find((p) => p.type === 'SUPPLIER')?.id || ''
  );
  const [orderDate, setOrderDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Line Items
  const [lineItems, setLineItems] = useState<PoRowItem[]>([
    {
      id: 'po-row-1',
      item_id: MOCK_ERP_ITEMS.find((i) => i.item_type === 'RAW_MATERIAL')?.id || MOCK_ERP_ITEMS[0]?.id || '',
      quantity: 5,
      unit_price: MOCK_ERP_ITEMS.find((i) => i.item_type === 'RAW_MATERIAL')?.purchase_price || 500,
      tax_rate: 18,
    },
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const [bData, pData, iData] = await Promise.all([
          getBusinessProfile(),
          getParties(),
          getItems(),
        ]);
        if (bData) setBusiness(bData);
        if (pData) {
          const supps = pData.filter((p) => p.type === 'SUPPLIER');
          if (supps.length > 0) {
            setSuppliers(supps);
            setSelectedSupplierId(supps[0].id);
          }
        }
        if (iData && iData.length > 0) setItems(iData);
      } catch (err) {
        console.warn('PO page using mock data fallback:', err);
      }
    }
    loadData();
  }, []);

  const handleItemChange = (index: number, itemId: string) => {
    const foundItem = items.find((i) => i.id === itemId);
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        item_id: itemId,
        unit_price: foundItem ? foundItem.purchase_price : 0,
        tax_rate: foundItem ? foundItem.tax_rate : 18,
      };
      return updated;
    });
  };

  const handleFieldChange = (index: number, field: keyof PoRowItem, value: any) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddRow = () => {
    const defaultItem = items.find((i) => i.item_type === 'RAW_MATERIAL') || items[0];
    setLineItems((prev) => [
      ...prev,
      {
        id: `po-row-${Date.now()}`,
        item_id: defaultItem ? defaultItem.id : '',
        quantity: 1,
        unit_price: defaultItem ? defaultItem.purchase_price : 0,
        tax_rate: defaultItem ? defaultItem.tax_rate : 18,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Calculations
  const subtotal = lineItems.reduce((sum, r) => sum + r.quantity * r.unit_price, 0);
  const totalTax = lineItems.reduce((sum, r) => sum + (r.quantity * r.unit_price * r.tax_rate) / 100, 0);
  const grandTotal = subtotal + totalTax;

  const handleSubmitPO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      alert('Please select a supplier.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreatePurchaseOrderDTO = {
        business_id: business.id,
        supplier_id: selectedSupplierId,
        order_date: orderDate,
        expected_delivery_date: expectedDeliveryDate || undefined,
        notes: notes || undefined,
        items: lineItems.map((r) => ({
          item_id: r.item_id,
          quantity: r.quantity,
          unit_price: r.unit_price,
          tax_rate: r.tax_rate,
        })),
      };

      const res = await createPurchaseOrder(payload);

      if (res.success && res.data) {
        alert(`Purchase Order #${res.data.po_number} successfully issued!`);
        router.push('/dashboard/purchases');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to issue Purchase Order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto text-slate-100">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/purchases"
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Purchase Orders</span>
        </Link>
      </div>

      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-blue-400" />
            <span>Generate Supplier Purchase Order (PO)</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Order raw materials, components, or resale items from registered suppliers
          </p>
        </div>

        <form onSubmit={handleSubmitPO} className="space-y-6">
          
          {/* Supplier & Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
            
            {/* Supplier Selector */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Supplier / Vendor *
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-400"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.company_name || s.name} ({s.city || 'Vendor'})
                  </option>
                ))}
              </select>
            </div>

            {/* Order Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                PO Order Date
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-400"
              />
            </div>

            {/* Expected Delivery Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-400"
              />
            </div>

          </div>

          {/* Supplier Info Strip */}
          {selectedSupplier && (
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-400 flex flex-wrap justify-between gap-2">
              <div>Phone: <strong className="text-slate-200">{selectedSupplier.phone || 'N/A'}</strong></div>
              <div>GSTIN: <strong className="font-mono text-slate-200">{selectedSupplier.gstin || 'Unregistered'}</strong></div>
              <div>Current Balance: <strong className="text-rose-400">₹{selectedSupplier.current_balance.toLocaleString('en-IN')}</strong></div>
            </div>
          )}

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider">
                Purchase Order Line Items
              </label>
              <button
                type="button"
                onClick={handleAddRow}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Add Line Item</span>
              </button>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-extrabold text-[10px] uppercase">
                    <th className="py-2.5 px-3">Item Name</th>
                    <th className="py-2.5 px-2 text-right w-24">Qty</th>
                    <th className="py-2.5 px-2 text-right w-32">Expected Rate (₹)</th>
                    <th className="py-2.5 px-2 text-center w-24">Tax Rate %</th>
                    <th className="py-2.5 px-3 text-right w-32">Total</th>
                    <th className="py-2.5 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {lineItems.map((row, idx) => {
                    const rowSubtotal = row.quantity * row.unit_price;
                    const rowTax = (rowSubtotal * row.tax_rate) / 100;
                    const rowTotal = rowSubtotal + rowTax;
                    return (
                      <tr key={row.id}>
                        <td className="py-2 px-3">
                          <select
                            value={row.item_id}
                            onChange={(e) => handleItemChange(idx, e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white outline-none focus:border-blue-400"
                          >
                            {items.map((i) => (
                              <option key={i.id} value={i.id}>
                                [{i.item_type}] {i.name} (Stock: {i.current_stock} {i.unit})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={row.quantity}
                            onChange={(e) => handleFieldChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-right font-mono text-xs font-bold text-white outline-none focus:border-blue-400"
                          />
                        </td>
                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.unit_price}
                            onChange={(e) => handleFieldChange(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-right font-mono text-xs font-bold text-white outline-none focus:border-blue-400"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <select
                            value={row.tax_rate}
                            onChange={(e) => handleFieldChange(idx, 'tax_rate', parseFloat(e.target.value))}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-center font-mono text-xs font-bold text-amber-400 outline-none"
                          >
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                            <option value={28}>28%</option>
                          </select>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-black text-white">
                          ₹{rowTotal.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 text-center">
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes & Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
            <div className="sm:col-span-7 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Special Delivery Instructions / PO Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Deliver to Plant 2 unloading bay. Material Test Certificate required."
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none focus:border-blue-400"
              />
            </div>

            <div className="sm:col-span-5 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal (Excl. Tax):</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Taxes:</span>
                <span>₹{totalTax.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-black text-sm text-white">
                <span>TOTAL ESTIMATED PO:</span>
                <span className="text-blue-400">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <Link
              href="/dashboard/purchases"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-bold text-xs"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-500 hover:bg-blue-400 active:scale-95 text-slate-950 rounded-xl font-black text-xs shadow-lg transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Issuing PO...' : 'Issue Purchase Order'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
