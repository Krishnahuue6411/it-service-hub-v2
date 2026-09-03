'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Printer,
  Share2,
  CreditCard,
  Building2,
  Phone,
  Mail,
  Calendar,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  DollarSign,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Party, LedgerEntry, Business, RecordPaymentDTO, PaymentMode } from '../../../../types/erp';
import {
  getPartyLedger,
  getBusinessProfile,
  recordPartyPayment,
} from '../../../../actions/erp-actions';
import { INITIAL_ERP_BUSINESS, MOCK_ERP_PARTIES } from '../../../../lib/erp/erp-mock-data';

export default function PartyLedgerStatementPage() {
  const params = useParams();
  const partyId = params?.id as string;

  const [business, setBusiness] = useState<Business>(INITIAL_ERP_BUSINESS);
  const [party, setParty] = useState<Party | null>(
    MOCK_ERP_PARTIES.find((p) => p.id === partyId) || null
  );
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [dateFilter, setDateFilter] = useState<'ALL' | 'THIS_MONTH' | 'LAST_30'>('ALL');

  // Payment Recording Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [referenceNo, setReferenceNo] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadLedger() {
      try {
        const [bData, ledgerData] = await Promise.all([
          getBusinessProfile(),
          getPartyLedger(partyId),
        ]);
        if (bData) setBusiness(bData);
        if (ledgerData.party) setParty(ledgerData.party);
        if (ledgerData.entries) setEntries(ledgerData.entries);
      } catch (err) {
        console.warn('Ledger page loaded fallback state:', err);
      }
    }
    if (partyId) loadLedger();
  }, [partyId]);

  if (!party) {
    return (
      <div className="p-8 text-center text-slate-400">
        Party not found. <Link href="/dashboard/parties" className="text-amber-400 underline">Back to Parties</Link>
      </div>
    );
  }

  // Filtered Entries
  const filteredEntries = entries.filter((entry) => {
    if (dateFilter === 'ALL') return true;
    const entryDate = new Date(entry.date);
    const now = new Date();
    if (dateFilter === 'THIS_MONTH') {
      return (
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getFullYear() === now.getFullYear()
      );
    }
    if (dateFilter === 'LAST_30') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return entryDate >= thirtyDaysAgo;
    }
    return true;
  });

  const totalDebits = filteredEntries.reduce((s, e) => s + e.debit, 0);
  const totalCredits = filteredEntries.reduce((s, e) => s + e.credit, 0);

  const handleOpenPayment = () => {
    setPaymentAmount(Math.abs(party.current_balance));
    setReferenceNo(`UTR-${Math.floor(100000 + Math.random() * 900000)}`);
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const payload: RecordPaymentDTO = {
        business_id: business.id,
        party_id: party.id,
        payment_type: party.type === 'CUSTOMER' ? 'PAYMENT_IN' : 'PAYMENT_OUT',
        amount: paymentAmount,
        payment_mode: paymentMode,
        reference_number: referenceNo || undefined,
        payment_date: new Date().toISOString().split('T')[0],
        notes: paymentNotes || undefined,
      };

      const res = await recordPartyPayment(payload);
      if (res.success) {
        setParty({ ...party, current_balance: res.newBalance });
        // Refresh ledger
        const refreshed = await getPartyLedger(party.id);
        if (refreshed.entries) setEntries(refreshed.entries);
        setIsPaymentModalOpen(false);
        alert(`Payment of ₹${paymentAmount} settled!`);
      }
    } catch (err: any) {
      alert(err.message || 'Payment recording failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppStatement = () => {
    const cleanPhone = (party.phone || '').replace(/[^0-9]/g, '');
    const validPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const name = party.company_name || party.name;
    const balance = Math.abs(party.current_balance).toLocaleString('en-IN');
    const text = `Hello *${name}*,\n\nPlease find your active ledger summary from *${business.name}*:\n\n📊 *Total Purchases/Invoices:* ₹${totalDebits.toLocaleString('en-IN')}\n💳 *Total Payments Received:* ₹${totalCredits.toLocaleString('en-IN')}\n⚖️ *Current Closing Balance:* ₹${balance} (${party.current_balance > 0 ? 'Due to us' : 'Settled'})\n\nThank you for doing business with us!`;

    window.open(`https://wa.me/${validPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto text-slate-100">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <Link
          href="/dashboard/parties"
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Parties Khata</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-800 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Statement</span>
          </button>

          <button
            onClick={handleWhatsAppStatement}
            className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 rounded-xl border border-emerald-800 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp Summary</span>
          </button>

          <button
            onClick={handleOpenPayment}
            className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl font-black text-xs shadow-lg transition flex items-center gap-1.5"
          >
            <CreditCard className="w-4 h-4" />
            <span>{party.type === 'CUSTOMER' ? '+ Record Payment (येणे)' : '+ Make Payment (देणे)'}</span>
          </button>
        </div>
      </div>

      {/* Main Statement Container (Print-ready) */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
        
        {/* Business & Party Header Strip */}
        <div className="border-b border-slate-800 pb-6 print:border-slate-300 flex flex-col sm:flex-row justify-between gap-4">
          
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20 uppercase print:text-black print:border-slate-300">
              {party.type} LEDGER STATEMENT
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white print:text-black">
              {party.company_name || party.name}
            </h1>
            <p className="text-xs text-slate-400 print:text-slate-600 font-medium">
              {party.billing_address || 'No registered billing address'}
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-400 print:text-slate-700 pt-1 font-mono">
              {party.phone && <span>Phone: {party.phone}</span>}
              {party.gstin && <span>GSTIN: <strong>{party.gstin}</strong></span>}
            </div>
          </div>

          <div className="text-right sm:self-center p-4 bg-slate-900/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-2xl">
            <div className="text-[10px] font-bold text-slate-400 print:text-slate-600 uppercase">Closing Balance</div>
            <div className={`text-2xl font-mono font-black ${
              party.type === 'CUSTOMER'
                ? party.current_balance > 0 ? 'text-emerald-400 print:text-emerald-700' : 'text-slate-300 print:text-black'
                : party.current_balance < 0 ? 'text-rose-400 print:text-rose-700' : 'text-slate-300 print:text-black'
            }`}>
              ₹{Math.abs(party.current_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] font-bold text-slate-400 print:text-slate-600 uppercase">
              {party.type === 'CUSTOMER'
                ? party.current_balance > 0 ? 'Receivable (येणे बाकी)' : 'All Settled'
                : party.current_balance < 0 ? 'Payable (देणे बाकी)' : 'All Settled'}
            </div>
          </div>

        </div>

        {/* Date Filter Bar (Hidden in Print) */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Date Range:</span>
            <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setDateFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition ${dateFilter === 'ALL' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400'}`}
              >
                All Time
              </button>
              <button
                onClick={() => setDateFilter('THIS_MONTH')}
                className={`px-3 py-1.5 rounded-lg transition ${dateFilter === 'THIS_MONTH' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400'}`}
              >
                This Month
              </button>
              <button
                onClick={() => setDateFilter('LAST_30')}
                className={`px-3 py-1.5 rounded-lg transition ${dateFilter === 'LAST_30' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400'}`}
              >
                Last 30 Days
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            {filteredEntries.length} transaction{filteredEntries.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Chronological Ledger Table */}
        <div className="border border-slate-800 print:border-slate-300 rounded-2xl overflow-hidden bg-slate-900/40 print:bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 print:bg-slate-100 text-slate-400 print:text-slate-800 border-b border-slate-800 print:border-slate-300 font-extrabold text-[10px] uppercase">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Ref / Voucher #</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3 text-right">Debit (नावे)</th>
                <th className="py-3 px-3 text-right">Credit (जमा)</th>
                <th className="py-3 px-3 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No transactions recorded for this period.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-900/30 print:hover:bg-white transition">
                    <td className="py-2.5 px-3 font-mono text-slate-300 print:text-slate-800">
                      {entry.date}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                        entry.type === 'INVOICE' || entry.type === 'PURCHASE_BILL'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800 print:bg-slate-100 print:text-black'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800 print:bg-slate-100 print:text-black'
                      }`}>
                        {entry.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-white print:text-black">
                      {entry.reference_number}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 print:text-slate-600">
                      {entry.description}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200 print:text-black">
                      {entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 print:text-emerald-700">
                      {entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-amber-400 print:text-black">
                      ₹{Math.abs(entry.running_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900/90 print:bg-slate-50 font-black border-t border-slate-800 print:border-slate-300">
                <td colSpan={4} className="py-3 px-3 uppercase text-slate-400 print:text-slate-700">
                  Total Period Activity:
                </td>
                <td className="py-3 px-3 text-right font-mono text-white print:text-black">
                  ₹{totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-400 print:text-emerald-700">
                  ₹{totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right font-mono text-amber-400 print:text-black">
                  ₹{Math.abs(party.current_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

      </div>

      {/* MODAL: Record Payment */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4 text-slate-100 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-base">Record Payment</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl font-mono text-base font-black text-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="BANK_TRANSFER">Bank (NEFT/RTGS)</option>
                  <option value="CASH">Cash Drawer</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Reference / UTR Number</label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-amber-400 text-slate-950 font-black rounded-xl"
                >
                  {isSubmitting ? 'Saving...' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
