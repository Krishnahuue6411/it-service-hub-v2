'use client';

import React from 'react';
import { ConfirmedOrder } from '../../types';
import { 
  FileText, 
  Share2, 
  ShieldCheck, 
  Wrench, 
  Building2, 
  MapPin, 
  CreditCard, 
  Check, 
  Download, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface InvoiceDetailsProps {
  order: ConfirmedOrder;
}

export const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ order }) => {

  const handleDownloadPdf = () => {
    alert(`Generating official GST Tax Invoice PDF for Order #${order.orderId}...\n\nCompany: ${order.companyName}\nGSTIN: ${order.gstin}\nIncludes CGST 9% + SGST 9% itemized breakdown.`);
  };

  const handleShareWhatsapp = () => {
    const text = `IT Service Hub Order Confirmed! 🎉\nOrder ID: #${order.orderId}\nTotal Paid: ₹${order.taxSummary.grandTotal.toLocaleString()}\nEstimated Delivery: Today in 2 Hours\nTracking Link: https://itservicehub.com/track/${order.orderId}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN (60% Desktop Width) - Hardware Specs & PDF Invoice */}
      <div className="lg:col-span-7 space-y-6">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-black text-base text-slate-900 leading-tight">
              Hardware Items & Warranty Registration ({order.items.length} Items)
            </h3>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Serial Numbers Logged
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 flex flex-col sm:flex-row gap-4 items-start">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl border border-slate-200 shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-1.5">
                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                    {item.name}
                  </h4>

                  <div className="text-xs text-slate-500 font-medium">
                    Variant: <strong className="text-slate-800">{item.variantLabel}</strong> • Qty: <strong>{item.quantity}</strong>
                  </div>

                  {/* Serial Number & Warranty Pill */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold">
                    <span className="bg-slate-900 text-amber-400 font-mono px-2 py-0.5 rounded flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-400" />
                      <span>S/N: {item.serialNumber}</span>
                    </span>

                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {item.warrantyYears}-Year Official Brand Warranty
                    </span>

                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                      HSN: {item.hsnCode}
                    </span>
                  </div>

                  {item.installationIncluded && (
                    <div className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1 pt-0.5">
                      <Wrench className="w-3.5 h-3.5" /> Includes Free On-Site Installation in MIDC Ahilyanagar
                    </div>
                  )}
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="text-base font-black text-slate-950">
                    ₹{(item.unitPrice * item.quantity).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 line-through">
                    ₹{(item.mrp * item.quantity).toLocaleString()}
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Download & Share Actions */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleDownloadPdf}
              className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3.5 rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>📄 Download Tax Invoice (PDF)</span>
            </button>

            <button
              onClick={handleShareWhatsapp}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3.5 rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>📲 Send Invoice to WhatsApp</span>
            </button>
          </div>

        </div>

      </div>

      {/* RIGHT COLUMN (40% Desktop Width) - Billing & GST Details */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Shipping & GST Summary Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          
          <h3 className="font-black text-base text-slate-900 border-b border-slate-200 pb-3">
            Shipping & GST Tax Invoice Summary
          </h3>

          {/* Recipient Address */}
          <div className="space-y-1 text-xs">
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Delivery Destination
            </div>
            <div className="font-extrabold text-slate-900 text-sm">{order.recipientName}</div>
            <div className="text-slate-700 font-bold">{order.companyName}</div>
            <div className="text-slate-600 font-medium leading-snug">{order.addressLine}</div>
            <div className="text-slate-600 font-bold">{order.cityStatePincode}</div>
            <div className="text-slate-500 font-medium">Phone: {order.contactPhone}</div>
          </div>

          <hr className="border-slate-200" />

          {/* Business & GST Details */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> B2B Registered Entity
              </span>
              <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-black">
                GSTR-3B ELIGIBLE
              </span>
            </div>

            <div className="font-mono text-slate-200 text-xs">
              GSTIN: <strong>{order.gstin}</strong>
            </div>

            <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-1.5 flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-bold text-white">{order.paymentMethodLabel}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex justify-between">
              <span>Txn Ref:</span>
              <span className="text-slate-300">{order.paymentTransactionRef}</span>
            </div>
          </div>

          {/* Final Price Breakdown Table */}
          <div className="text-xs space-y-1.5 text-slate-600 font-medium pt-2">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-bold text-slate-900">₹{order.taxSummary.subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between">
              <span>CGST (9%)</span>
              <span className="font-bold text-slate-800">₹{order.taxSummary.cgst.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>SGST (9%)</span>
              <span className="font-bold text-slate-800">₹{order.taxSummary.sgst.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Voucher Coupon Discount</span>
              <span>-₹{order.taxSummary.discount}</span>
            </div>

            <div className="flex justify-between">
              <span>Local Express Delivery</span>
              <span className="text-emerald-700 font-black">FREE (MIDC)</span>
            </div>

            <hr className="border-slate-200" />

            <div className="flex justify-between text-base font-black text-slate-950 pt-1">
              <span>Grand Total Paid</span>
              <span className="text-xl text-emerald-700">₹{order.taxSummary.grandTotal.toLocaleString()}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
