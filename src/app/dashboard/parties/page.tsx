'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  Phone,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Plus,
  Share2,
  DollarSign,
  AlertTriangle,
  FileText,
  CreditCard,
  X,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Business, Party, PaymentMode, RecordPaymentDTO } from '../../../types/erp';
import {
  getBusinessProfile,
  getParties,
  recordPartyPayment,
  createParty,
} from '../../../actions/erp-actions';
import { INITIAL_ERP_BUSINESS, MOCK_ERP_PARTIES } from '../../../lib/erp/erp-mock-data';

export default function PartiesKhataPage() {
  const [business, setBusiness] = useState<Business>(INITIAL_ERP_BUSINESS);
  const [parties, setParties] = useState<Party[]>(MOCK_ERP_PARTIES);
  const [activeTab, setActiveTab] = useState<'CUSTOMERS' | 'SUPPLIERS'>('CUSTOMERS');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Recording Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPartyForPayment, setSelectedPartyForPayment] = useState<Party | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [referenceNo, setReferenceNo] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // New Party Modal State
  const [isNewPartyModalOpen, setIsNewPartyModalOpen] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyCompany, setNewPartyCompany] = useState('');
  const [newPartyPhone, setNewPartyPhone] = useState('');
  const [newPartyGstin, setNewPartyGstin] = useState('');
  const [newPartyAddress, setNewPartyAddress] = useState('');
  const [newPartyCreditLimit, setNewPartyCreditLimit] = useState(100000);
  const [isCreatingParty, setIsCreatingParty] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [bData, pData] = await Promise.all([getBusinessProfile(), getParties()]);
        if (bData) setBusiness(bData);
        if (pData && pData.length > 0) setParties(pData);
      } catch (err) {
        console.warn('Parties page loaded with fallback data:', err);
      }
    }
    loadData();
  }, []);

  // Filtered List
  const customerList = parties.filter((p) => p.type === 'CUSTOMER');
  const supplierList = parties.filter((p) => p.type === 'SUPPLIER');
  const currentList = (activeTab === 'CUSTOMERS' ? customerList : supplierList).filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone?.includes(searchQuery) ||
      p.gstin?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // KPI Computations
  const totalReceivables = customerList
    .filter((c) => c.current_balance > 0)
    .reduce((sum, c) => sum + c.current_balance, 0);

  const totalPayables = supplierList
    .filter((s) => s.current_balance < 0)
    .reduce((sum, s) => sum + Math.abs(s.current_balance), 0);

  const overdueCount = customerList.filter(
    (c) => c.current_balance > (c.credit_limit || 50000)
  ).length;

  // Open Payment Modal
  const handleOpenPaymentModal = (party: Party) => {
    setSelectedPartyForPayment(party);
    setPaymentAmount(Math.abs(party.current_balance));
    setReferenceNo(`UTR-${Math.floor(100000 + Math.random() * 900000)}`);
    setPaymentNotes('');
    setIsPaymentModalOpen(true);
  };

  // Submit Payment In / Out
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartyForPayment || paymentAmount <= 0) return;

    setIsSubmittingPayment(true);

    try {
      const isCustomer = selectedPartyForPayment.type === 'CUSTOMER';
      const payload: RecordPaymentDTO = {
        business_id: business.id,
        party_id: selectedPartyForPayment.id,
        payment_type: isCustomer ? 'PAYMENT_IN' : 'PAYMENT_OUT',
        amount: paymentAmount,
        payment_mode: paymentMode,
        reference_number: referenceNo || undefined,
        payment_date: paymentDate,
        notes: paymentNotes || undefined,
      };

      const res = await recordPartyPayment(payload);

      if (res.success) {
        setParties((prev) =>
          prev.map((p) =>
            p.id === selectedPartyForPayment.id ? { ...p, current_balance: res.newBalance } : p
          )
        );
        setIsPaymentModalOpen(false);
        alert(
          `Payment of ₹${paymentAmount} successfully recorded! Updated balance: ₹${res.newBalance}`
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Create New Party
  const handleCreatePartySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyName.trim()) return;

    setIsCreatingParty(true);

    try {
      const res = await createParty({
        business_id: business.id,
        type: activeTab === 'CUSTOMERS' ? 'CUSTOMER' : 'SUPPLIER',
        name: newPartyName,
        company_name: newPartyCompany || undefined,
        phone: newPartyPhone || undefined,
        gstin: newPartyGstin || undefined,
        billing_address: newPartyAddress || undefined,
        credit_limit: newPartyCreditLimit,
        opening_balance: 0,
      });

      if (res.success && res.data) {
        setParties((prev) => [res.data, ...prev]);
        setIsNewPartyModalOpen(false);
        setNewPartyName('');
        setNewPartyCompany('');
        setNewPartyPhone('');
        setNewPartyGstin('');
        setNewPartyAddress('');
        alert(`New ${activeTab === 'CUSTOMERS' ? 'Customer' : 'Supplier'} registered!`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create party');
    } finally {
      setIsCreatingParty(false);
    }
  };

  // Send WhatsApp Reminder
  const handleSendWhatsAppReminder = (party: Party) => {
    const cleanPhone = (party.phone || '').replace(/[^0-9]/g, '');
    const validPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const name = party.company_name || party.name;
    const balance = Math.abs(party.current_balance).toLocaleString('en-IN');
    const upiId = business.upi_id || '9876543210@okaxis';

    const text = `Dear *${name}*,\n\nThis is a gentle payment reminder from *${business.name}* regarding your pending outstanding balance of *₹${balance}*.\n\nPlease clear the payment at the earliest.\n\n📱 *Pay via UPI:* \`${upiId}\`\n🔗 *Instant Pay Link:* upi://pay?pa=${upiId}&pn=${encodeURIComponent(business.name)}&am=${Math.abs(party.current_balance)}&cu=INR\n\nThank you for your business!`;

    const url = `https://wa.me/${validPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Khata Ledger & Credit Control
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Udhaari Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            <span>Parties Khata & Udhaari Management</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Track receivables (येणे बाकी), vendor payables (देणे बाकी), send automated WhatsApp reminders, and settle payments
          </p>
        </div>

        <button
          onClick={() => setIsNewPartyModalOpen(true)}
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-xl transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Add New {activeTab === 'CUSTOMERS' ? 'Customer' : 'Supplier'}</span>
        </button>
      </div>

      {/* Top Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Receivables */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              To Collect (Receivables / येणे बाकी)
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            ₹{totalReceivables.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400">
            Across {customerList.filter((c) => c.current_balance > 0).length} customers with pending balance
          </div>
        </div>

        {/* Total Payables */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              To Pay (Payables / देणे बाकी)
            </span>
            <div className="w-8 h-8 rounded-full bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            ₹{totalPayables.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400">
            Across {supplierList.filter((s) => s.current_balance < 0).length} suppliers with outstanding bills
          </div>
        </div>

        {/* Overdue / High Risk */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Credit Limit Breaches / Alerts
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {overdueCount} Accounts
          </div>
          <div className="text-[11px] text-slate-400">
            Parties exceeding their sanctioned credit thresholds
          </div>
        </div>

      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        <div className="flex bg-slate-950 border border-slate-800 p-1.5 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('CUSTOMERS')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'CUSTOMERS' ? 'bg-amber-400 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Customers (ग्राहक)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/50 font-mono">
              {customerList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('SUPPLIERS')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === 'SUPPLIERS' ? 'bg-amber-400 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Suppliers (सप्लायर)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/50 font-mono">
              {supplierList.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === 'CUSTOMERS' ? 'customers' : 'suppliers'} by name, GSTIN, phone...`}
            className="pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 w-64 sm:w-80"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>

      </div>

      {/* Parties Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-extrabold text-[10px] uppercase">
                <th className="py-3.5 px-4">Party Details</th>
                <th className="py-3.5 px-3">Contact</th>
                <th className="py-3.5 px-3">GSTIN / Tax ID</th>
                <th className="py-3.5 px-3 text-right">Credit Limit</th>
                <th className="py-3.5 px-4 text-right">Current Balance</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {currentList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No {activeTab.toLowerCase()} found matching your search.
                  </td>
                </tr>
              ) : (
                currentList.map((party) => {
                  const isPositive = party.current_balance > 0;
                  const isNegative = party.current_balance < 0;
                  const isCustomer = party.type === 'CUSTOMER';

                  return (
                    <tr key={party.id} className="hover:bg-slate-900/40 transition">
                      
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/dashboard/parties/${party.id}`}
                          className="group flex flex-col"
                        >
                          <span className="font-extrabold text-white group-hover:text-amber-400 transition text-sm">
                            {party.company_name || party.name}
                          </span>
                          {party.company_name && party.name !== party.company_name && (
                            <span className="text-[11px] text-slate-400">
                              Contact: {party.name}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500">
                            {party.city ? `${party.city}, ${party.state || ''}` : 'Location Unset'}
                          </span>
                        </Link>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-3 font-mono text-slate-300">
                        {party.phone || <span className="text-slate-600">No phone</span>}
                      </td>

                      {/* GSTIN */}
                      <td className="py-3.5 px-3 font-mono">
                        {party.gstin ? (
                          <span className="text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                            {party.gstin}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-600 italic">Unregistered</span>
                        )}
                      </td>

                      {/* Credit Limit */}
                      <td className="py-3.5 px-3 text-right font-mono text-slate-400">
                        ₹{(party.credit_limit || 50000).toLocaleString('en-IN')}
                      </td>

                      {/* Balance */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-black text-sm">
                          {isCustomer ? (
                            isPositive ? (
                              <span className="text-emerald-400">
                                ₹{party.current_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                <span className="text-[9px] block text-emerald-500/80 uppercase font-sans">You will get</span>
                              </span>
                            ) : (
                              <span className="text-slate-400">
                                ₹0.00
                                <span className="text-[9px] block text-slate-500 uppercase font-sans">Settled</span>
                              </span>
                            )
                          ) : (
                            isNegative ? (
                              <span className="text-rose-400">
                                ₹{Math.abs(party.current_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                <span className="text-[9px] block text-rose-500/80 uppercase font-sans">You owe</span>
                              </span>
                            ) : (
                              <span className="text-slate-400">
                                ₹0.00
                                <span className="text-[9px] block text-slate-500 uppercase font-sans">Settled</span>
                              </span>
                            )
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* Settle / Record Payment Button */}
                          <button
                            onClick={() => handleOpenPaymentModal(party)}
                            className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-[11px] px-2.5 py-1.5 rounded-xl border border-slate-700 transition shadow flex items-center gap-1"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>{isCustomer ? 'Collect (येणे)' : 'Pay (देणे)'}</span>
                          </button>

                          {/* WhatsApp Reminder (for Customers with outstanding balance) */}
                          {isCustomer && isPositive && (
                            <button
                              onClick={() => handleSendWhatsAppReminder(party)}
                              className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 rounded-xl border border-emerald-800 transition"
                              title="Send WhatsApp Payment Reminder"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* View Statement */}
                          <Link
                            href={`/dashboard/parties/${party.id}`}
                            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition"
                            title="View Full Ledger Statement"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </Link>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Record Payment In / Out */}
      {isPaymentModalOpen && selectedPartyForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4 text-slate-100 my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-white text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <span>
                    Record {selectedPartyForPayment.type === 'CUSTOMER' ? 'Payment In (जमा)' : 'Payment Out (नावे)'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Party: <strong className="text-white">{selectedPartyForPayment.company_name || selectedPartyForPayment.name}</strong>
                </p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs">
              
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center font-mono">
                <span className="text-slate-400">Current Outstanding:</span>
                <span className={`font-black text-sm ${selectedPartyForPayment.current_balance > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ₹{Math.abs(selectedPartyForPayment.current_balance).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Settlement Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-base font-black text-amber-400 outline-none focus:border-amber-400"
                />
              </div>

              {/* Mode & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-amber-400"
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="BANK_TRANSFER">Bank (NEFT/RTGS)</option>
                    <option value="CASH">Cash Drawer</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Reference Number */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider">UTR / Cheque / Ref Number</label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="e.g. UPI/5634891122 or CHQ-10492"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-white outline-none focus:border-amber-400"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Notes</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Received via GPay from proprietor"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none focus:border-amber-400"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl shadow-lg transition"
                >
                  {isSubmittingPayment ? 'Recording...' : 'Record Settlement'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: Add New Party */}
      {isNewPartyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-lg w-full shadow-2xl space-y-4 text-slate-100 my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>Add New {activeTab === 'CUSTOMERS' ? 'Customer' : 'Supplier'}</span>
              </h3>
              <button onClick={() => setIsNewPartyModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePartySubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={newPartyName}
                    onChange={(e) => setNewPartyName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider">Business / Trade Name</label>
                  <input
                    type="text"
                    value={newPartyCompany}
                    onChange={(e) => setNewPartyCompany(e.target.value)}
                    placeholder="e.g. Apex Hardware Pvt Ltd"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={newPartyPhone}
                    onChange={(e) => setNewPartyPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider">GSTIN Number</label>
                  <input
                    type="text"
                    value={newPartyGstin}
                    onChange={(e) => setNewPartyGstin(e.target.value)}
                    placeholder="27AAAPL1234C1Z5"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono uppercase text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Billing Address</label>
                <input
                  type="text"
                  value={newPartyAddress}
                  onChange={(e) => setNewPartyAddress(e.target.value)}
                  placeholder="Street, City, State, Pincode"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Credit Limit (₹)</label>
                <input
                  type="number"
                  value={newPartyCreditLimit}
                  onChange={(e) => setNewPartyCreditLimit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewPartyModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingParty}
                  className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl shadow-lg transition"
                >
                  {isCreatingParty ? 'Saving...' : 'Save Party'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
