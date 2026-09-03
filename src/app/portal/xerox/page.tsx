'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Copy,
  Printer,
  FileText,
  CreditCard,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
  QrCode,
  DollarSign,
  Share2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

interface XeroxServiceItem {
  id: string;
  name: string;
  category: 'XEROX' | 'COLOR' | 'FINISHING' | 'PHOTO';
  defaultRate: number;
  unit: string;
}

const XEROX_SERVICES: XeroxServiceItem[] = [
  { id: 'xs-1', name: 'B&W A4 Single Side (1-Sided)', category: 'XEROX', defaultRate: 2.0, unit: 'Pages' },
  { id: 'xs-2', name: 'B&W A4 Both Sides (Back-to-Back)', category: 'XEROX', defaultRate: 3.0, unit: 'Pages' },
  { id: 'xs-3', name: 'Color A4 Standard Print', category: 'COLOR', defaultRate: 10.0, unit: 'Pages' },
  { id: 'xs-4', name: 'Color A4 Glossy Photo Print', category: 'COLOR', defaultRate: 25.0, unit: 'Pages' },
  { id: 'xs-5', name: 'Legal / Bond B&W Xerox', category: 'XEROX', defaultRate: 3.0, unit: 'Pages' },
  { id: 'xs-6', name: 'ID / Aadhar Card Glossy Lamination', category: 'FINISHING', defaultRate: 20.0, unit: 'Cards' },
  { id: 'xs-7', name: 'Spiral Binding (Up to 100 pgs)', category: 'FINISHING', defaultRate: 35.0, unit: 'Books' },
  { id: 'xs-8', name: 'Passport Size Photo (8 Copies Sheet)', category: 'PHOTO', defaultRate: 50.0, unit: 'Sheets' },
];

interface CartLine {
  item: XeroxServiceItem;
  quantity: number;
  rate: number;
}

export default function XeroxPortalPage() {
  const [cart, setCart] = useState<CartLine[]>([
    { item: XEROX_SERVICES[0], quantity: 10, rate: 2.0 },
    { item: XEROX_SERVICES[5], quantity: 1, rate: 20.0 },
  ]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI'>('CASH');
  const [tokenNumber, setTokenNumber] = useState(104);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Cart operations
  const handleAddItem = (svc: XeroxServiceItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === svc.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === svc.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { item: svc, quantity: 1, rate: svc.defaultRate }];
    });
  };

  const handleUpdateQty = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((c) => c.item.id !== itemId));
    } else {
      setCart((prev) =>
        prev.map((c) => (c.item.id === itemId ? { ...c, quantity: newQty } : c))
      );
    }
  };

  const handleUpdateRate = (itemId: string, newRate: number) => {
    setCart((prev) =>
      prev.map((c) => (c.item.id === itemId ? { ...c, rate: newRate } : c))
    );
  };

  const handleRemoveLine = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  const handleClear = () => {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
  };

  // Calculations
  const grandTotal = cart.reduce((sum, line) => sum + line.quantity * line.rate, 0);

  const handleCompleteOrder = () => {
    if (cart.length === 0) return;
    setIsReceiptModalOpen(true);
  };

  const handleNextToken = () => {
    setTokenNumber((prev) => prev + 1);
    setIsReceiptModalOpen(false);
    handleClear();
  };

  const upiId = '9822114455@okaxis';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `upi://pay?pa=${upiId}&pn=ShreeXerox&am=${grandTotal}&cu=INR&tn=Token${tokenNumber}`
  )}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 selection:bg-cyan-400 selection:text-slate-950">
      
      {/* Top Header Strip */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-3xl shadow-2xl mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
            <Copy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                Xerox Dedicated Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">Token #{tokenNumber}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Shree Xerox & Document Services Counter
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-xs font-bold text-slate-400 hover:text-white px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 transition"
          >
            Switch Client
          </Link>
          <button
            onClick={handleClear}
            className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 bg-slate-800 rounded-xl transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Counter</span>
          </button>
        </div>
      </div>

      {/* Main Counter Layout (Grid: Fast Service Grid + Live Counter Slip) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Fast Xerox Service Buttons (8 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Quick Touch Service Counter
            </h2>
            <span className="text-[11px] text-cyan-400 font-mono">1-Touch Add</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            {XEROX_SERVICES.map((svc) => (
              <button
                key={svc.id}
                onClick={() => handleAddItem(svc)}
                className="p-4 bg-slate-900 hover:bg-slate-850 active:scale-[0.98] border border-slate-800 hover:border-cyan-500/50 rounded-2xl transition text-left space-y-2 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase">{svc.category}</div>
                  <div className="text-sm font-extrabold text-white group-hover:text-cyan-400 transition mt-0.5 leading-snug">
                    {svc.name}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-xs font-mono font-black text-cyan-400">
                    ₹{svc.defaultRate.toFixed(2)} / {svc.unit}
                  </span>
                  <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-black">
                    + Add
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Live Bill / Counter Slip (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between space-y-4">
          
          <div className="space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-white text-sm">Active Job Slip</h3>
                <span className="text-[10px] text-slate-400 font-mono">Token #{tokenNumber}</span>
              </div>
              <span className="text-xs font-mono font-black text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-800">
                {cart.length} item{cart.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Optional Customer info */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="Customer Name (Optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-cyan-400 text-xs"
              />
              <input
                type="text"
                placeholder="Phone (For WhatsApp)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-white outline-none focus:border-cyan-400 text-xs"
              />
            </div>

            {/* Line Items List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Counter slip is empty. Click services on the left to add.
                </div>
              ) : (
                cart.map((line) => {
                  const lineTotal = line.quantity * line.rate;

                  return (
                    <div
                      key={line.item.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white truncate text-xs">{line.item.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Rate: ₹
                          <input
                            type="number"
                            min="0.5"
                            step="any"
                            value={line.rate}
                            onChange={(e) =>
                              handleUpdateRate(line.item.id, parseFloat(e.target.value) || 0)
                            }
                            className="w-12 px-1 py-0.5 bg-slate-900 border border-slate-800 text-amber-400 font-mono rounded text-center"
                          />{' '}
                          / {line.item.unit}
                        </div>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                        <button
                          onClick={() => handleUpdateQty(line.item.id, line.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white rounded bg-slate-800 font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) =>
                            handleUpdateQty(line.item.id, parseInt(e.target.value) || 1)
                          }
                          className="w-10 text-center font-mono font-bold text-cyan-400 bg-transparent outline-none text-xs"
                        />
                        <button
                          onClick={() => handleUpdateQty(line.item.id, line.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white rounded bg-slate-800 font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="text-right min-w-16">
                        <div className="font-mono font-black text-white text-xs">
                          ₹{lineTotal.toFixed(2)}
                        </div>
                        <button
                          onClick={() => handleRemoveLine(line.item.id)}
                          className="text-[10px] text-slate-500 hover:text-rose-400"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Bottom Checkout & Settlement */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            
            {/* Payment Mode Selector */}
            <div className="flex gap-2 text-xs font-bold">
              <button
                onClick={() => setPaymentMode('CASH')}
                className={`flex-1 py-2 rounded-xl transition ${
                  paymentMode === 'CASH'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                💵 Cash Drawer
              </button>
              <button
                onClick={() => setPaymentMode('UPI')}
                className={`flex-1 py-2 rounded-xl transition ${
                  paymentMode === 'UPI'
                    ? 'bg-cyan-400 text-slate-950 font-black shadow'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                📱 Instant UPI QR
              </button>
            </div>

            {/* Total Amount Banner */}
            <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Net Counter Total</div>
                <div className="text-[11px] text-slate-500">Token #{tokenNumber}</div>
              </div>
              <div className="font-mono font-black text-2xl text-cyan-400">
                ₹{grandTotal.toFixed(2)}
              </div>
            </div>

            {/* Complete Slip Button */}
            <button
              onClick={handleCompleteOrder}
              disabled={cart.length === 0}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 active:scale-98 disabled:opacity-40 text-slate-950 font-black rounded-2xl text-xs shadow-xl transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip & Settle (₹{grandTotal.toFixed(2)})</span>
            </button>

          </div>

        </div>

      </div>

      {/* RECEIPT / PRINT SLIP MODAL */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4 text-slate-100 my-auto text-center">
            
            {/* Paper Slip Simulated Receipt */}
            <div className="bg-white text-slate-950 p-5 rounded-2xl font-mono text-xs space-y-2 text-left shadow-lg">
              <div className="text-center border-b border-dashed border-slate-300 pb-2">
                <div className="font-black text-sm uppercase">Shree Xerox Center</div>
                <div className="text-[10px] text-slate-600">Document & High-Speed Copying</div>
                <div className="text-[10px] font-bold text-slate-800 mt-1">TOKEN #{tokenNumber}</div>
              </div>

              {customerName && (
                <div className="text-[10px]">Customer: <strong>{customerName}</strong></div>
              )}

              <div className="border-b border-dashed border-slate-300 py-1 space-y-1">
                {cart.map((line, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-44">{line.quantity}x {line.item.name}</span>
                    <span className="font-bold">₹{(line.quantity * line.rate).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-black text-sm pt-1">
                <span>TOTAL PAID:</span>
                <span>₹{grandTotal.toFixed(2)} ({paymentMode})</span>
              </div>

              {/* UPI QR */}
              {paymentMode === 'UPI' && (
                <div className="pt-2 text-center border-t border-dashed border-slate-300">
                  <div className="text-[10px] font-bold text-slate-600 mb-1">Scan to Pay via Any UPI App</div>
                  <img src={qrUrl} alt="UPI QR" className="w-28 h-28 mx-auto border p-1 rounded" />
                  <div className="text-[9px] text-slate-500 mt-1">{upiId}</div>
                </div>
              )}

              <div className="text-center text-[9px] text-slate-500 pt-2 border-t border-dashed border-slate-300">
                Thank you for visiting Shree Xerox!
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs"
              >
                Print Slip
              </button>

              <button
                onClick={handleNextToken}
                className="flex-1 py-2.5 bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-black rounded-xl text-xs shadow-lg"
              >
                Next Token &rarr;
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
