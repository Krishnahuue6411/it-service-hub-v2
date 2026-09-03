'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Printer, FileText, Building2 } from 'lucide-react';
import { generatePrintableQuotation, QuotationLineItem } from '../../lib/export/exportHelpers';

interface QuotationGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuotationGeneratorModal: React.FC<QuotationGeneratorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [quoteNo] = useState(`QT-MIDC-${Math.floor(1000 + Math.random() * 9000)}`);
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientGstin, setClientGstin] = useState('');
  const [clientAddress, setClientAddress] = useState('Plot M-45, MIDC Nagapur, Ahilyanagar');
  const [notes, setNotes] = useState('Payment terms: 50% advance, 50% upon delivery & installation.');

  const [items, setItems] = useState<QuotationLineItem[]>([
    {
      description: 'Crucial P3 Plus 1TB PCIe 4.0 NVMe M.2 SSD',
      hsnCode: '847170',
      qty: 5,
      unitPrice: 5999,
      gstRate: 18,
    },
    {
      description: 'Annual IT Infrastructure & Network Support Visit',
      hsnCode: '998313',
      qty: 1,
      unitPrice: 12500,
      gstRate: 18,
    },
  ]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: 'Industrial CCTV Camera 5MP Dome',
        hsnCode: '852580',
        qty: 1,
        unitPrice: 3200,
        gstRate: 18,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof QuotationLineItem,
    value: string | number
  ) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setItems(updated);
  };

  // Tax calculations
  const subtotal = items.reduce((acc, item) => acc + (Number(item.qty) || 0) * (Number(item.unitPrice) || 0), 0);
  const totalGst = items.reduce(
    (acc, item) => acc + (Number(item.qty) || 0) * (Number(item.unitPrice) || 0) * ((Number(item.gstRate) || 18) / 100),
    0
  );
  const grandTotal = subtotal + totalGst;

  const handleGeneratePdf = () => {
    if (!clientName) {
      alert('Please enter B2B Client Name.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one line item.');
      return;
    }

    generatePrintableQuotation({
      quoteNo,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      validUntil: '15 Days from Issue Date',
      clientName,
      clientCompany,
      clientGstin,
      clientAddress,
      items,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-200">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-lg leading-tight">
              B2B GST Quotation Generator
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Ref: <span className="font-bold text-blue-700">#{quoteNo}</span> | Issue Date: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* Client Details Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
            <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>B2B Client Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Contact Person / Client Name *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Sunil Vahurwagh"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  placeholder="e.g. PAIS Trading Pvt Ltd"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  15-Digit GSTIN (Optional)
                </label>
                <input
                  type="text"
                  value={clientGstin}
                  onChange={(e) => setClientGstin(e.target.value)}
                  placeholder="e.g. 27AIKPV9768Q1ZP"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-mono font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Billing Address
                </label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="Full Factory / Corporate Address"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Line Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Quotation Line Items & Hardware / Services
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold px-3 py-1.5 rounded-xl transition flex items-center gap-1 border border-blue-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Line Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center bg-slate-50 border border-slate-200 p-2.5 rounded-xl"
                >
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      placeholder="Item title / service description"
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="text"
                      value={item.hsnCode}
                      onChange={(e) => handleItemChange(idx, 'hsnCode', e.target.value)}
                      placeholder="HSN / SAC"
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 font-mono text-center"
                    />
                  </div>

                  <div className="col-span-1">
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => handleItemChange(idx, 'qty', Number(e.target.value))}
                      placeholder="Qty"
                      min="1"
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-center font-bold"
                    />
                  </div>

                  <div className="col-span-3">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                      placeholder="Rate ₹"
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 font-bold"
                    />
                  </div>

                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Summary */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <div className="text-slate-400 text-xs font-semibold">Financial Breakdown (GST 18%)</div>
              <div className="text-xs text-slate-300 space-x-3 mt-1">
                <span>Subtotal: <strong>₹{subtotal.toLocaleString('en-IN')}</strong></span>
                <span>CGST: <strong>₹{(totalGst / 2).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></span>
                <span>SGST: <strong>₹{(totalGst / 2).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Grand Total (Incl Tax)</div>
              <div className="text-2xl font-black text-white">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Terms & Conditions / Special Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleGeneratePdf}
              className="bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black text-xs px-6 py-2.5 rounded-xl transition shadow-lg flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Generate PDF & Print Quote</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
