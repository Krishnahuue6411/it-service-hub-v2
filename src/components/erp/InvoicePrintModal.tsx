'use client';

import React, { useState } from 'react';
import {
  Printer,
  X,
  Share2,
  CheckCircle2,
  FileText,
  Receipt,
  Download,
  Building2,
  Phone,
  Mail,
  CreditCard,
  QrCode,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { Invoice, Business, PrintFormat } from '../../types/erp';

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  business: Business;
}

// Convert numbers into Indian Currency Words (Lakhs & Crores)
export function numberToWordsIndian(num: number): string {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + ' ' + a[n % 10];
    if (n < 1000) return inWords(Math.floor(n / 100)) + 'Hundred ' + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + inWords(n % 10000000);
  };

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let result = 'Rupees ' + (integerPart === 0 ? 'Zero ' : inWords(integerPart));
  if (decimalPart > 0) {
    result += 'and ' + inWords(decimalPart) + 'Paise ';
  }
  return result.trim() + ' Only';
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  invoice,
  business,
}) => {
  const [activeFormat, setActiveFormat] = useState<PrintFormat>(invoice.print_format || 'A4');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const upiQrString = `upi://pay?pa=${business.upi_id || 'admin@okhdfcbank'}&pn=${encodeURIComponent(business.name)}&am=${invoice.balance_amount > 0 ? invoice.balance_amount : invoice.grand_total}&cu=INR&tn=Invoice-${invoice.invoice_number}`;
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiQrString)}`;

  // Formatted WhatsApp Message
  const customerName = invoice.customer?.company_name || invoice.customer?.name || 'Valued Customer';
  const customerPhone = (invoice.customer?.phone || '').replace(/[^0-9]/g, '');
  const cleanPhone = customerPhone.startsWith('91') ? customerPhone : `91${customerPhone}`;
  
  const whatsappText = `Hello *${customerName}*,\nThank you for your business at *${business.name}*.\n\n📄 *Invoice No:* ${invoice.invoice_number}\n🗓️ *Date:* ${invoice.invoice_date}\n💰 *Grand Total:* ₹${invoice.grand_total.toLocaleString('en-IN')}\n💵 *Paid Amount:* ₹${invoice.paid_amount.toLocaleString('en-IN')}\n⚖️ *Balance Due:* ₹${invoice.balance_amount.toLocaleString('en-IN')}\n\n💳 *Pay via UPI:* ${business.upi_id || 'Contact us'}\n\nHave a great day!`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappText)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(whatsappText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      
      {/* Container Dialog */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-5xl w-full max-h-[96vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden my-auto print:bg-white print:border-none print:shadow-none print:max-w-none print:w-full print:p-0 print:m-0">
        
        {/* Top Modal Chrome (Hidden during print) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>Tax Invoice Preview</span>
                <span className="text-xs font-mono text-amber-400 font-bold bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                  {invoice.invoice_number}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {customerName} • Grand Total: <strong className="text-emerald-400 font-bold">₹{invoice.grand_total.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>

          {/* Format Switcher & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Format Viewport Switcher */}
            <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveFormat('A4')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeFormat === 'A4' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Standard A4
              </button>
              <button
                type="button"
                onClick={() => setActiveFormat('THERMAL_3INCH')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeFormat === 'THERMAL_3INCH' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                3" Thermal POS
              </button>
            </div>

            {/* WhatsApp Share Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Now</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Viewport Scrollable Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex justify-center bg-slate-950 print:p-0 print:bg-white print:overflow-visible">
          
          {/* ========================================================================= */}
          {/* 1. STANDARD A4 CORPORATE TAX INVOICE VIEWPORT */}
          {/* ========================================================================= */}
          {activeFormat === 'A4' && (
            <div className="w-full max-w-[800px] bg-white text-slate-950 p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-300 font-sans text-xs leading-normal print:shadow-none print:border-none print:p-0 print:w-full print:max-w-none">
              
              {/* Header: Business Identity & Document Title */}
              <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 text-white font-black flex items-center justify-center text-xs">
                      B2B
                    </div>
                    <h1 className="text-xl font-black text-slate-950 uppercase tracking-tight">
                      {business.name}
                    </h1>
                  </div>
                  {business.trade_name && (
                    <div className="text-xs text-slate-600 font-semibold">{business.trade_name}</div>
                  )}
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {business.address}, {business.city}, {business.state} - {business.pincode}
                  </p>
                  <div className="text-[11px] text-slate-700 font-semibold flex flex-wrap gap-x-3 gap-y-0.5 pt-0.5">
                    <span>Phone: {business.phone}</span>
                    {business.email && <span>Email: {business.email}</span>}
                  </div>
                  <div className="text-[11px] font-mono font-black text-slate-950 pt-0.5">
                    GSTIN / UIN: {business.gstin || 'UNREGISTERED'} • State: {business.state || 'Maharashtra'} (Code: {business.state_code || '27'})
                  </div>
                </div>

                <div className="sm:text-right space-y-1 sm:self-start bg-slate-50 border border-slate-200 p-3 rounded-xl min-w-[220px]">
                  <div className="text-sm font-black uppercase text-slate-900 tracking-wider">
                    TAX INVOICE
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-950">
                    No: <span className="text-blue-900">{invoice.invoice_number}</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Date: <strong>{new Date(invoice.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                  </div>
                  {invoice.due_date && (
                    <div className="text-[11px] text-rose-700">
                      Due Date: <strong>{new Date(invoice.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                    </div>
                  )}
                  <div className="text-[10px] font-bold uppercase pt-1">
                    Mode: <span className="bg-slate-200 text-slate-900 px-2 py-0.5 rounded">{invoice.payment_mode}</span>
                  </div>
                </div>
              </div>

              {/* Bill To & Ship To Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-b border-slate-300 text-[11px]">
                <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200 space-y-1">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Billed To (Buyer)
                  </div>
                  <div className="font-extrabold text-xs text-slate-950">
                    {invoice.customer?.company_name || invoice.customer?.name || 'Cash Customer'}
                  </div>
                  {invoice.customer?.company_name && invoice.customer?.name && (
                    <div className="text-slate-700">Attn: {invoice.customer.name}</div>
                  )}
                  <div className="text-slate-600 leading-snug">
                    {invoice.customer?.billing_address || 'Address on file'}
                  </div>
                  <div className="text-slate-700 font-medium">
                    Phone: {invoice.customer?.phone || 'N/A'}
                  </div>
                  <div className="font-mono font-bold text-slate-900 pt-0.5">
                    GSTIN: {invoice.customer?.gstin || 'Unregistered / Consumer'}
                  </div>
                </div>

                <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200 space-y-1">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Dispatch & Logistics Info
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Vehicle Number:</span>
                    <span className="font-mono font-bold text-slate-950">{invoice.vehicle_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Transporter Name:</span>
                    <span className="font-semibold text-slate-900">{invoice.transporter_name || 'Hand Delivery / Local'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">LR / RR Number:</span>
                    <span className="font-mono text-slate-800">{invoice.lr_rr_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">E-Way Bill No:</span>
                    <span className="font-mono text-slate-800">{invoice.eway_bill_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Place of Supply:</span>
                    <span className="font-bold text-slate-900">{invoice.customer?.state_code === business.state_code ? `${business.state} (27)` : 'Inter-State'}</span>
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="py-3 border-b border-slate-300 overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-y border-slate-300 font-extrabold text-[10px] uppercase">
                      <th className="py-2 px-2 text-center w-8">#</th>
                      <th className="py-2 px-2">Item Description</th>
                      <th className="py-2 px-2 text-center">HSN/SAC</th>
                      <th className="py-2 px-2 text-right">Qty</th>
                      <th className="py-2 px-2 text-right">Rate (₹)</th>
                      <th className="py-2 px-2 text-right">Disc</th>
                      <th className="py-2 px-2 text-right">Taxable</th>
                      {invoice.cgst_amount > 0 && (
                        <>
                          <th className="py-2 px-2 text-right">CGST</th>
                          <th className="py-2 px-2 text-right">SGST</th>
                        </>
                      )}
                      {invoice.igst_amount > 0 && (
                        <th className="py-2 px-2 text-right">IGST</th>
                      )}
                      <th className="py-2 px-2 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoice.items.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-slate-50/50">
                        <td className="py-2 px-2 text-center text-slate-500 font-mono text-[10px]">
                          {index + 1}
                        </td>
                        <td className="py-2 px-2">
                          <div className="font-bold text-slate-950">{item.item_name}</div>
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-slate-600 text-[10px]">
                          {item.hsn_sac_code || '-'}
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-slate-900">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-slate-800">
                          {item.unit_price.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-slate-600">
                          {item.discount_amount > 0 ? `₹${item.discount_amount.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-2 px-2 text-right font-mono font-semibold text-slate-900">
                          {item.taxable_value.toFixed(2)}
                        </td>
                        {invoice.cgst_amount > 0 && (
                          <>
                            <td className="py-2 px-2 text-right font-mono text-slate-700 text-[10px]">
                              {item.cgst_amount.toFixed(2)}
                            </td>
                            <td className="py-2 px-2 text-right font-mono text-slate-700 text-[10px]">
                              {item.sgst_amount.toFixed(2)}
                            </td>
                          </>
                        )}
                        {invoice.igst_amount > 0 && (
                          <td className="py-2 px-2 text-right font-mono text-slate-700 text-[10px]">
                            {item.igst_amount.toFixed(2)}
                          </td>
                        )}
                        <td className="py-2 px-2 text-right font-mono font-black text-slate-950">
                          {item.total_amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Summary: Amount in Words, Bank Details, and Grand Total */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 py-4 border-b border-slate-300">
                
                {/* Left Col: Amount in Words & Banking UPI Box */}
                <div className="sm:col-span-7 space-y-3">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Amount in Words:</div>
                    <div className="font-extrabold text-[11px] text-slate-950 italic">
                      {numberToWordsIndian(invoice.grand_total)}
                    </div>
                  </div>

                  {/* Settlement Bank Details & Dynamic UPI QR */}
                  <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/50 flex items-center justify-between gap-3">
                    <div className="space-y-1 text-[10px] leading-tight">
                      <div className="font-black text-slate-900 uppercase tracking-wider flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-blue-700" />
                        <span>Bank & Settlement Account</span>
                      </div>
                      <div>Bank: <strong>{business.bank_name || 'HDFC Bank Ltd'}</strong></div>
                      <div>A/C No: <strong className="font-mono text-slate-950">{business.account_no || '50200088994411'}</strong></div>
                      <div>IFSC Code: <strong className="font-mono text-slate-950">{business.ifsc_code || 'HDFC0001234'}</strong></div>
                      <div>Branch: {business.branch_name || 'MIDC Branch'}</div>
                      <div className="text-emerald-700 font-mono font-bold pt-0.5">UPI ID: {business.upi_id || 'paisautomation@okhdfcbank'}</div>
                    </div>

                    {business.upi_id && (
                      <div className="text-center shrink-0">
                        <img src={upiQrUrl} alt="UPI QR" className="w-20 h-20 border border-slate-300 rounded bg-white p-0.5 shadow-sm" />
                        <div className="text-[8px] font-bold text-slate-600 uppercase mt-0.5">Scan to Pay UPI</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Col: Calculation Subtotals */}
                <div className="sm:col-span-5 space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-200 text-slate-700">
                    <span>Taxable Amount:</span>
                    <span className="font-bold">₹{invoice.taxable_amount.toFixed(2)}</span>
                  </div>

                  {invoice.cgst_amount > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-200 text-slate-700">
                      <span>Total CGST:</span>
                      <span>₹{invoice.cgst_amount.toFixed(2)}</span>
                    </div>
                  )}

                  {invoice.sgst_amount > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-200 text-slate-700">
                      <span>Total SGST:</span>
                      <span>₹{invoice.sgst_amount.toFixed(2)}</span>
                    </div>
                  )}

                  {invoice.igst_amount > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-200 text-slate-700">
                      <span>Total IGST:</span>
                      <span>₹{invoice.igst_amount.toFixed(2)}</span>
                    </div>
                  )}

                  {invoice.discount_amount > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-200 text-emerald-800">
                      <span>Discount:</span>
                      <span>-₹{invoice.discount_amount.toFixed(2)}</span>
                    </div>
                  )}

                  {invoice.round_off !== 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600 text-[10px]">
                      <span>Round Off:</span>
                      <span>{invoice.round_off > 0 ? `+₹${invoice.round_off.toFixed(2)}` : `-₹${Math.abs(invoice.round_off).toFixed(2)}`}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-2 border-y-2 border-slate-950 font-black text-sm text-slate-950">
                    <span>GRAND TOTAL:</span>
                    <span>₹{invoice.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between py-1 text-slate-700 text-[10px]">
                    <span>Paid Amount:</span>
                    <span className="font-bold text-emerald-700">₹{invoice.paid_amount.toFixed(2)}</span>
                  </div>

                  <div className={`flex justify-between py-1 font-bold ${invoice.balance_amount > 0 ? 'text-rose-700' : 'text-slate-600'} text-[10px]`}>
                    <span>Balance Due:</span>
                    <span>₹{invoice.balance_amount.toFixed(2)}</span>
                  </div>
                </div>

              </div>

              {/* Footer: Terms & Authorized Signatory */}
              <div className="pt-4 flex flex-col sm:flex-row justify-between items-end gap-6 text-[10px]">
                <div className="space-y-1 max-w-sm text-slate-600">
                  <div className="font-bold text-slate-800 uppercase">Terms & Conditions:</div>
                  <p className="whitespace-pre-line leading-relaxed">
                    {business.settings.terms_and_conditions || '1. Goods once sold will not be returned.\n2. Payment strictly as agreed.\n3. Subject to local jurisdiction.'}
                  </p>
                </div>

                <div className="text-right space-y-8 min-w-[200px]">
                  <div className="text-[11px] font-extrabold text-slate-900">
                    For {business.name}
                  </div>
                  <div className="border-t border-slate-800 pt-1 text-slate-700 font-bold uppercase tracking-wider">
                    Authorized Signatory
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. 3-INCH (80MM) THERMAL POS RECEIPT VIEWPORT */}
          {/* ========================================================================= */}
          {activeFormat === 'THERMAL_3INCH' && (
            <div className="w-[300px] bg-white text-slate-950 p-4 rounded-xl shadow-2xl border border-slate-300 font-mono text-[11px] leading-tight print:shadow-none print:border-none print:p-2 print:w-[80mm] print:m-0">
              
              {/* Thermal Header */}
              <div className="text-center border-b border-dashed border-slate-600 pb-2 space-y-1">
                <div className="font-black text-sm uppercase tracking-wide">
                  {business.name}
                </div>
                <div className="text-[10px] text-slate-700">
                  {business.address}, {business.city}
                </div>
                <div className="text-[10px] text-slate-700">
                  Phone: {business.phone}
                </div>
                {business.gstin && (
                  <div className="text-[10px] font-bold text-slate-950">
                    GSTIN: {business.gstin}
                  </div>
                )}
                <div className="text-xs font-black uppercase pt-1 tracking-widest border-t border-dashed border-slate-400 mt-1">
                  *** TAX INVOICE ***
                </div>
              </div>

              {/* Metadata */}
              <div className="py-2 border-b border-dashed border-slate-600 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>Inv No:</span>
                  <span className="font-bold text-slate-950">{invoice.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(invoice.invoice_date).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cust:</span>
                  <span className="font-bold truncate max-w-[170px]">{customerName}</span>
                </div>
                {invoice.vehicle_number && (
                  <div className="flex justify-between">
                    <span>Vehicle:</span>
                    <span className="font-bold">{invoice.vehicle_number}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Pay Mode:</span>
                  <span className="font-bold">{invoice.payment_mode}</span>
                </div>
              </div>

              {/* Itemized List */}
              <div className="py-2 border-b border-dashed border-slate-600">
                <div className="flex justify-between font-bold border-b border-dashed border-slate-400 pb-1 mb-1 text-[10px]">
                  <span>ITEM</span>
                  <span>QTY</span>
                  <span>RATE</span>
                  <span>AMT</span>
                </div>

                <div className="space-y-1 text-[10px]">
                  {invoice.items.map((item, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="font-bold truncate">{item.item_name}</div>
                      <div className="flex justify-between text-slate-700">
                        <span>HSN:{item.hsn_sac_code || '-'}</span>
                        <span>{item.quantity}{item.unit}</span>
                        <span>₹{item.unit_price}</span>
                        <span className="font-bold text-slate-950">₹{item.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thermal Calculations Summary */}
              <div className="py-2 border-b border-dashed border-slate-600 text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span>Taxable Amount:</span>
                  <span>₹{invoice.taxable_amount.toFixed(2)}</span>
                </div>
                {invoice.cgst_amount > 0 && (
                  <div className="flex justify-between">
                    <span>CGST:</span>
                    <span>₹{invoice.cgst_amount.toFixed(2)}</span>
                  </div>
                )}
                {invoice.sgst_amount > 0 && (
                  <div className="flex justify-between">
                    <span>SGST:</span>
                    <span>₹{invoice.sgst_amount.toFixed(2)}</span>
                  </div>
                )}
                {invoice.igst_amount > 0 && (
                  <div className="flex justify-between">
                    <span>IGST:</span>
                    <span>₹{invoice.igst_amount.toFixed(2)}</span>
                  </div>
                )}
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-₹{invoice.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-xs pt-1 border-t border-dashed border-slate-900">
                  <span>NET TOTAL:</span>
                  <span>₹{invoice.grand_total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid:</span>
                  <span>₹{invoice.paid_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Balance Due:</span>
                  <span>₹{invoice.balance_amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Thermal UPI QR Code */}
              {business.upi_id && (
                <div className="py-2 text-center border-b border-dashed border-slate-600">
                  <div className="text-[9px] font-bold uppercase mb-1">SCAN & PAY VIA UPI</div>
                  <img src={upiQrUrl} alt="UPI QR" className="w-24 h-24 mx-auto border p-0.5 rounded" />
                  <div className="text-[9px] text-slate-700 font-bold mt-1">{business.upi_id}</div>
                </div>
              )}

              {/* Thermal Footer */}
              <div className="pt-2 text-center text-[9px] text-slate-700 space-y-0.5">
                <div>Thank you for your business!</div>
                <div>Goods once sold will not be taken back.</div>
                <div className="font-bold pt-1">*** Powered by Vyapar ERP ***</div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Action Bar (Hidden during print) */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-400">
            {isCopied ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Message text copied to clipboard!
              </span>
            ) : (
              <span>Customer: {customerName} ({invoice.customer?.phone || 'No phone'})</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShareLink}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition"
            >
              Copy Text
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-lg transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print {activeFormat === 'A4' ? 'A4 Invoice' : '3" Thermal'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Global CSS Print Directives */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          /* Make only the print modal visible */
          .fixed.inset-0,
          .fixed.inset-0 * {
            visibility: visible;
          }
          .fixed.inset-0 {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

    </div>
  );
};
