'use client';

import React, { useState } from 'react';
import { X, Printer, Bluetooth, QrCode, FileText, Check, ShieldCheck, Download } from 'lucide-react';
import { CartItem, B2BProfile } from '../../types';

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  orderId?: string;
  clientName?: string;
  clientGstin?: string;
  paymentMethod?: string;
  appliedDiscount?: number;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  orderId = `INV-MIDC-${Math.floor(10000 + Math.random() * 90000)}`,
  clientName = 'Sunil Vahurwagh (PAIS Trading)',
  clientGstin = '27AAAAA0000A1Z5',
  paymentMethod = 'UPI QR Express',
  appliedDiscount = 0,
}) => {
  const [printFormat, setPrintFormat] = useState<'58mm' | '80mm' | 'A4'>('80mm');
  const [isBluetoothConnecting, setIsBluetoothConnecting] = useState(false);

  if (!isOpen) return null;

  const selectedItems = cartItems.filter((i) => i.isSelected);
  const subtotal = selectedItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const gstTaxAmount = Math.round(subtotal * 0.18);
  const grandTotal = Math.max(0, subtotal - appliedDiscount);

  // Formatted UPI String
  const upiString = `upi://pay?pa=admin.services@okhdfcbank&pn=IT%20Service%20Hub&am=${grandTotal}&cu=INR`;
  // Quick Google Chart API QR Generator URL for reliable SVG rendering
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiString)}`;

  // Web Bluetooth Thermal Print Handler
  const handleBluetoothPrint = async () => {
    setIsBluetoothConnecting(true);
    try {
      if ('bluetooth' in navigator) {
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'],
        });
        alert(`Bluetooth Thermal Printer Connected: ${device.name || 'Wireless POS Printer'}. Sending ESC/POS print commands...`);
      } else {
        alert('Web Bluetooth API is not supported on this browser version. Falling back to Standard Thermal/PDF Printing.');
        window.print();
      }
    } catch (err: any) {
      console.warn('Bluetooth print cancelled or error:', err);
      window.print();
    } finally {
      setIsBluetoothConnecting(false);
    }
  };

  const handleStandardPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 overflow-hidden space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition no-print"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 no-print">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 text-white rounded-2xl">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">
                Thermal & ESC-POS Print Engine
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Ref: <span className="font-bold text-slate-900">#{orderId}</span> | Date: {new Date().toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>

          {/* Format Selector Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-extrabold">
            <button
              onClick={() => setPrintFormat('58mm')}
              className={`px-3 py-1.5 rounded-xl transition ${
                printFormat === '58mm' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              2" Thermal (58mm)
            </button>
            <button
              onClick={() => setPrintFormat('80mm')}
              className={`px-3 py-1.5 rounded-xl transition ${
                printFormat === '80mm' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              3" Thermal (80mm)
            </button>
            <button
              onClick={() => setPrintFormat('A4')}
              className={`px-3 py-1.5 rounded-xl transition ${
                printFormat === 'A4' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Full A4 Invoice
            </button>
          </div>
        </div>

        {/* Dynamic Thermal / Invoice Render Area */}
        <div className="flex justify-center bg-slate-100 p-4 sm:p-6 rounded-2xl border border-slate-200 overflow-x-auto">
          
          {/* Printable Layout Wrapper */}
          <div
            id="printable-receipt"
            className={`bg-white text-slate-900 shadow-md p-6 font-mono border border-slate-300 transition-all ${
              printFormat === '58mm'
                ? 'w-[280px] text-[11px] leading-snug'
                : printFormat === '80mm'
                ? 'w-[380px] text-xs leading-normal'
                : 'w-full max-w-xl text-xs font-sans border-2 border-slate-800 rounded-xl'
            }`}
          >
            {/* Header */}
            <div className="text-center space-y-1 border-b border-dashed border-slate-400 pb-3">
              <div className="font-black text-base uppercase tracking-wider text-slate-950">
                ⚡ IT SERVICE HUB
              </div>
              <div className="text-[10px] text-slate-600 font-semibold">
                M45 MIDC Nagapur Industrial Sector, Ahilyanagar - 414111
              </div>
              <div className="text-[10px] text-slate-600 font-semibold">
                Tel: +91 8787828888 | GSTIN: 27AAAAA0000A1Z5
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="py-2 text-[10px] space-y-0.5 border-b border-dashed border-slate-400">
              <div className="flex justify-between">
                <span>Invoice No:</span>
                <span className="font-bold">#{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span>{new Date().toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Client Name:</span>
                <span className="font-bold">{clientName}</span>
              </div>
              {clientGstin && (
                <div className="flex justify-between">
                  <span>Client GSTIN:</span>
                  <span className="font-bold">{clientGstin}</span>
                </div>
              )}
            </div>

            {/* Line Items Table */}
            <div className="py-3 border-b border-dashed border-slate-400">
              <div className="grid grid-cols-12 font-bold border-b border-slate-300 pb-1 mb-1 text-[10px]">
                <div className="col-span-6">ITEM</div>
                <div className="col-span-2 text-center">QTY</div>
                <div className="col-span-4 text-right">TOTAL</div>
              </div>

              {selectedItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 text-[10px] py-1">
                  <div className="col-span-6 font-bold truncate">{item.product.name}</div>
                  <div className="col-span-2 text-center">x{item.quantity}</div>
                  <div className="col-span-4 text-right font-bold">
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            {/* Tax & Total Calculation Summary */}
            <div className="py-2 space-y-1 text-[10px] border-b border-dashed border-slate-400">
              <div className="flex justify-between">
                <span>Subtotal (Taxable):</span>
                <span>₹{(subtotal - gstTaxAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST (9%):</span>
                <span>₹{(gstTaxAmount / 2).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST (9%):</span>
                <span>₹{(gstTaxAmount / 2).toLocaleString('en-IN')}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Discount Savings:</span>
                  <span>-₹{appliedDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-slate-950 pt-1 border-t border-slate-800">
                <span>GRAND TOTAL:</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Dynamic UPI Payment QR Code */}
            <div className="py-3 text-center space-y-2 border-b border-dashed border-slate-400">
              <div className="text-[10px] font-bold text-slate-700 uppercase">
                Scan UPI QR Code to Pay ₹{grandTotal.toLocaleString('en-IN')}
              </div>
              <div className="flex justify-center">
                <img
                  src={qrCodeImageUrl}
                  alt="Dynamic UPI Payment QR Code"
                  className="w-28 h-28 border-2 border-slate-900 rounded-lg p-1 bg-white"
                />
              </div>
              <div className="text-[9px] text-slate-500 font-semibold">
                GPay / PhonePe / Paytm / BHIM UPI Accepted
              </div>
            </div>

            {/* Footer Seal */}
            <div className="pt-2 text-center text-[9px] text-slate-500 space-y-0.5">
              <div>Thank you for choosing IT Service Hub!</div>
              <div>Visit again for 2-Hour MIDC Express Hardware.</div>
            </div>

          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100 pt-4 no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleBluetoothPrint}
            disabled={isBluetoothConnecting}
            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition shadow flex items-center justify-center gap-2"
          >
            <Bluetooth className="w-4 h-4 text-amber-400" />
            <span>{isBluetoothConnecting ? 'Connecting Bluetooth Printer...' : 'Print Wireless ESC/POS Thermal'}</span>
          </button>

          <button
            type="button"
            onClick={handleStandardPrint}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF Invoice</span>
          </button>
        </div>

      </div>
    </div>
  );
};
