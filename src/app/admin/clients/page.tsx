'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  KeyRound,
  ExternalLink,
  Printer,
  Copy,
  Store,
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  User,
  Building,
} from 'lucide-react';
import { Client, BusinessType, CreateClientDTO, resolvePortalRoute } from '../../../types/client-portal';
import {
  getClients,
  createClient,
  toggleClientStatus,
} from '../../../actions/client-actions';

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modal State: Add New Client
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Welcome@123');
  const [businessType, setBusinessType] = useState<BusinessType>('XEROX');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load clients on initial mount
  useEffect(() => {
    async function load() {
      const data = await getClients();
      if (data) setClients(data);
    }
    load();
  }, []);

  // Quick auto-generate secure password helper
  const handleAutoGeneratePassword = () => {
    const generated = 'Pass@' + Math.floor(10000 + Math.random() * 90000);
    setPassword(generated);
  };

  // Filter clients by search term and software type
  const filteredClients = clients.filter((c) => {
    const matchesType = typeFilter === 'ALL' || c.business_type === typeFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      c.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery));
    return matchesType && matchesSearch;
  });

  const activeClientsCount = clients.filter((c) => c.is_active).length;

  // Handle Add Client Form Submission
  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !ownerName.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: CreateClientDTO = {
        client_name: businessName,
        owner_name: ownerName,
        email: email,
        phone: phone || undefined,
        password: password,
        business_type: businessType,
      };

      const res = await createClient(payload);
      if (res.success && res.client) {
        setClients((prev) => [res.client!, ...prev]);
        setIsAddModalOpen(false);
        setBusinessName('');
        setOwnerName('');
        setPhone('');
        setEmail('');
        setPassword('Welcome@123');
        alert(`Client "${res.client.client_name}" provisioned successfully!`);
      } else {
        alert(res.error || 'Failed to create client');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred while creating client');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Toggle Active/Inactive Status
  const handleToggleStatus = async (client: Client) => {
    const newStatus = !client.is_active;
    await toggleClientStatus(client.id, newStatus);
    setClients((prev) =>
      prev.map((c) => (c.id === client.id ? { ...c, is_active: newStatus } : c))
    );
  };

  // Helper to render readable badge for software type
  const renderTypeBadge = (type: BusinessType) => {
    switch (type) {
      case 'XEROX':
        return (
          <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
            <Copy className="w-3 h-3" />
            <span>Xerox Counter</span>
          </span>
        );
      case 'PRINTING_PRESS':
        return (
          <span className="bg-indigo-950 text-indigo-400 border border-indigo-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
            <Printer className="w-3 h-3" />
            <span>Printing Press</span>
          </span>
        );
      case 'RETAIL_ERP':
        return (
          <span className="bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
            <Store className="w-3 h-3" />
            <span>Retail ERP</span>
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      
      {/* 1. TOP HEADER: Client Control Center */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-amber-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Super Admin Management</span>
            </span>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-black text-[11px] px-2.5 py-0.5 rounded-full">
              {activeClientsCount} Active Clients
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-amber-400" />
            <span>Client Control Center</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Manage multi-tenant business accounts, credentials, and software portal access
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
          >
            <span>Open Login Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add New Client</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Type Filter Buttons */}
        <div className="flex bg-slate-950 border border-slate-800 p-1.5 rounded-2xl text-xs font-bold w-fit overflow-x-auto">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-4 py-2 rounded-xl transition ${typeFilter === 'ALL' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400'}`}
          >
            All Portals ({clients.length})
          </button>
          <button
            onClick={() => setTypeFilter('XEROX')}
            className={`px-4 py-2 rounded-xl transition ${typeFilter === 'XEROX' ? 'bg-cyan-400 text-slate-950 font-black' : 'text-slate-400'}`}
          >
            Xerox ({clients.filter((c) => c.business_type === 'XEROX').length})
          </button>
          <button
            onClick={() => setTypeFilter('PRINTING_PRESS')}
            className={`px-4 py-2 rounded-xl transition ${typeFilter === 'PRINTING_PRESS' ? 'bg-indigo-400 text-slate-950 font-black' : 'text-slate-400'}`}
          >
            Printing Press ({clients.filter((c) => c.business_type === 'PRINTING_PRESS').length})
          </button>
          <button
            onClick={() => setTypeFilter('RETAIL_ERP')}
            className={`px-4 py-2 rounded-xl transition ${typeFilter === 'RETAIL_ERP' ? 'bg-emerald-400 text-slate-950 font-black' : 'text-slate-400'}`}
          >
            Retail ERP ({clients.filter((c) => c.business_type === 'RETAIL_ERP').length})
          </button>
        </div>

        {/* Search Field */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search business name, owner, or email..."
            className="pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 w-64 sm:w-80"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>

      </div>

      {/* 3. CLIENT DIRECTORY TABLE */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-extrabold text-[10px] uppercase">
                <th className="py-3.5 px-4">Business Name</th>
                <th className="py-3.5 px-3">Owner</th>
                <th className="py-3.5 px-3">Business Type Badge</th>
                <th className="py-3.5 px-3">Phone</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-3">Created Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    No client records match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const targetPortal = resolvePortalRoute(client.business_type);
                  const createdFormatted = client.created_at
                    ? new Date(client.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '-';

                  return (
                    <tr key={client.id} className="hover:bg-slate-900/40 transition">
                      
                      {/* Business Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-white text-sm">{client.client_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{client.email}</div>
                      </td>

                      {/* Owner */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-200">{client.owner_name}</div>
                      </td>

                      {/* Business Type Badge */}
                      <td className="py-3.5 px-3">
                        {renderTypeBadge(client.business_type)}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-3 font-mono text-slate-300">
                        {client.phone || '-'}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(client)}
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition ${
                            client.is_active
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                              : 'bg-rose-950 text-rose-400 border border-rose-800 hover:bg-rose-900'
                          }`}
                        >
                          {client.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-3 font-mono text-slate-400">
                        {createdFormatted}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={targetPortal}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 font-bold rounded-lg transition inline-flex items-center gap-1 text-[11px]"
                        >
                          <span>Launch</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* "ADD NEW CLIENT" MODAL */}
      {/* ====================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-lg w-full shadow-2xl space-y-4 text-slate-100 my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>Add New Business Client</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClientSubmit} className="space-y-4 text-xs">
              
              {/* Business Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Business Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Kiran Xerox"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-400"
                  />
                  <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              {/* Owner Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Owner Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Kiran Shinde"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-400"
                    />
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9822001122"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-white outline-none focus:border-amber-400"
                    />
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

              </div>

              {/* Email Address & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Email Address (Login ID) *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kiran@xerox.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-400"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoGeneratePassword}
                      className="text-[10px] text-amber-400 hover:underline font-bold"
                    >
                      Auto-generate
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-amber-400 outline-none focus:border-amber-400"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

              </div>

              {/* Business Type Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Business Type Selector *
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-amber-400"
                >
                  <option value="XEROX">📄 XEROX & Document Counter (/portal/xerox)</option>
                  <option value="PRINTING_PRESS">🖨️ PRINTING_PRESS & Fast Tax Billing (/dashboard/billing/new)</option>
                  <option value="RETAIL_ERP">🏬 RETAIL_ERP & Full Business Operations (/dashboard)</option>
                </select>
                <p className="text-[10px] text-slate-500">
                  Clients logging in with this account will immediately be routed to their designated portal.
                </p>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl shadow-lg transition"
                >
                  {isSubmitting ? 'Creating...' : 'Create Client'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
