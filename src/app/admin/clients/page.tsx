'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  ShieldCheck,
  KeyRound,
  ExternalLink,
  Printer,
  Copy,
  Store,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { Client, BusinessType, CreateClientDTO, resolvePortalRoute } from '../../../types/client-portal';
import {
  getClients,
  createClient,
  toggleClientStatus,
  resetClientPassword,
} from '../../../actions/client-portal-actions';


export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Modal State: Add Client
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('Welcome@123');
  const [businessType, setBusinessType] = useState<BusinessType>('XEROX');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State: Reset Password
  const [resetModalClient, setResetModalClient] = useState<Client | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    async function fetchClients() {
      const data = await getClients();
      if (data) setClients(data);
    }
    fetchClients();
  }, []);

  // Filtered List
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

  // Handle Add Client Submit
  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !ownerName.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: CreateClientDTO = {
        client_name: clientName,
        owner_name: ownerName,
        email: email,
        phone: phone || undefined,
        password: password,
        business_type: businessType,
      };

      const res = await createClient(payload);
      if (res.success && res.data) {
        setClients((prev) => [res.data!, ...prev]);
        setIsAddModalOpen(false);
        setClientName('');
        setOwnerName('');
        setEmail('');
        setPhone('');
        setPassword('Welcome@123');
        alert(`Client "${res.data.client_name}" provisioned successfully!`);
      } else {
        alert(res.error || 'Failed to create client');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating client');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Status Toggle
  const handleToggleStatus = async (client: Client) => {
    const newStatus = !client.is_active;
    await toggleClientStatus(client.id, newStatus);
    setClients((prev) =>
      prev.map((c) => (c.id === client.id ? { ...c, is_active: newStatus } : c))
    );
  };

  // Handle Password Reset
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalClient || !newPasswordInput.trim()) return;

    setIsResetting(true);
    try {
      const res = await resetClientPassword(resetModalClient.id, newPasswordInput);
      if (res.success) {
        alert(res.message);
        setResetModalClient(null);
        setNewPasswordInput('');
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const getBadgeForType = (type: BusinessType) => {
    switch (type) {
      case 'XEROX':
        return (
          <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
            <Copy className="w-3 h-3" />
            <span>Xerox Counter</span>
          </span>
        );
      case 'PRINTING_PRESS':
        return (
          <span className="bg-indigo-950 text-indigo-400 border border-indigo-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
            <Printer className="w-3 h-3" />
            <span>Printing Press</span>
          </span>
        );
      case 'RETAIL_ERP':
        return (
          <span className="bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
            <Store className="w-3 h-3" />
            <span>Retail ERP</span>
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Super Admin Master Console
            </span>
            <span className="text-xs text-slate-400 font-mono">Tenant Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Client Portals Provisioning</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Manage multi-tenant clients and assign software experiences (Xerox, Printing Press, Retail ERP)
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
            className="bg-emerald-400 hover:bg-emerald-500 active:scale-95 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add New Client</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Total Registered Clients</div>
          <div className="text-2xl font-mono font-black text-white">{clients.length}</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-[11px] font-bold text-cyan-400 uppercase">Xerox Centers</div>
          <div className="text-2xl font-mono font-black text-white">
            {clients.filter((c) => c.business_type === 'XEROX').length}
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-[11px] font-bold text-indigo-400 uppercase">Printing Presses</div>
          <div className="text-2xl font-mono font-black text-white">
            {clients.filter((c) => c.business_type === 'PRINTING_PRESS').length}
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-[11px] font-bold text-amber-400 uppercase">Retail ERP Accounts</div>
          <div className="text-2xl font-mono font-black text-white">
            {clients.filter((c) => c.business_type === 'RETAIL_ERP').length}
          </div>
        </div>
      </div>

      {/* Search & Type Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex bg-slate-950 border border-slate-800 p-1.5 rounded-2xl text-xs font-bold w-fit">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-4 py-2 rounded-xl transition ${typeFilter === 'ALL' ? 'bg-emerald-400 text-slate-950 font-black' : 'text-slate-400'}`}
          >
            All Software Types
          </button>
          <button
            onClick={() => setTypeFilter('XEROX')}
            className={`px-4 py-2 rounded-xl transition ${typeFilter === 'XEROX' ? 'bg-cyan-400 text-slate-950 font-black' : 'text-slate-400'}`}
          >
            Xerox
          </button>
          <button
            onClick={() => setTypeFilter('PRINTING_PRESS')}
            className={`px-4 py-2 rounded-xl transition ${typeFilter === 'PRINTING_PRESS' ? 'bg-indigo-400 text-slate-950 font-black' : 'text-slate-400'}`}
          >
            Printing Press
          </button>
          <button
            onClick={() => setTypeFilter('RETAIL_ERP')}
            className={`px-4 py-2 rounded-xl transition ${typeFilter === 'RETAIL_ERP' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400'}`}
          >
            Retail ERP
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search business, owner, or email..."
            className="pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400 w-64 sm:w-80"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-extrabold text-[10px] uppercase">
                <th className="py-3.5 px-4">Business / Client Name</th>
                <th className="py-3.5 px-3">Owner Details</th>
                <th className="py-3.5 px-3">Assigned Software Type</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                    No clients match the specified criteria.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const targetPortal = resolvePortalRoute(client.business_type);

                  return (
                    <tr key={client.id} className="hover:bg-slate-900/40 transition">
                      
                      {/* Business Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-white text-sm">{client.client_name}</div>
                        <div className="text-[10px] font-mono text-slate-500">ID: {client.id}</div>
                      </td>

                      {/* Owner Details */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-200">{client.owner_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{client.email}</div>
                        {client.phone && <div className="text-[10px] text-slate-500 font-mono">{client.phone}</div>}
                      </td>

                      {/* Assigned Software Type */}
                      <td className="py-3.5 px-3">
                        {getBadgeForType(client.business_type)}
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Routes to: {targetPortal}
                        </div>
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
                          {client.is_active ? 'Active' : 'Suspended'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* Reset Password Button */}
                          <button
                            onClick={() => {
                              setResetModalClient(client);
                              setNewPasswordInput('Pass@' + Math.floor(1000 + Math.random() * 9000));
                            }}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition flex items-center gap-1 font-bold text-[10px]"
                            title="Reset Password"
                          >
                            <KeyRound className="w-3 h-3 text-amber-400" />
                            <span>Reset Pass</span>
                          </button>

                          {/* Direct Launch Portal */}
                          <Link
                            href={targetPortal}
                            className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-black rounded-lg transition flex items-center gap-1 text-[10px]"
                          >
                            <span>Launch Portal</span>
                            <ArrowRight className="w-3 h-3" />
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

      {/* MODAL 1: Add New Client */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-lg w-full shadow-2xl space-y-4 text-slate-100 my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>Provision New Client Tenant</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClientSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider">Business / Store Name *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Shree Xerox & Cyber Cafe"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider">Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Suresh Patil"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9822114455"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-white outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider">Login Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="xerox@shreeprint.com"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider">Temporary Password</label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-amber-400 outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Business Type Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider">
                  Assigned Software Portal (business_type) *
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-emerald-400"
                >
                  <option value="XEROX">📄 XEROX & Document Counter (/portal/xerox)</option>
                  <option value="PRINTING_PRESS">🖨️ PRINTING PRESS & Tax Invoicing (/dashboard/billing/new)</option>
                  <option value="RETAIL_ERP">🏬 RETAIL ERP & Business Operations (/dashboard)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-black rounded-xl shadow-lg transition"
                >
                  {isSubmitting ? 'Provisioning...' : 'Provision Client'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: Reset Password */}
      {resetModalClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4 text-slate-100 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-sm flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Reset Client Password</span>
              </h3>
              <button onClick={() => setResetModalClient(null)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
              <p className="text-slate-400">
                Resetting password for <strong className="text-white">{resetModalClient.client_name}</strong> ({resetModalClient.email})
              </p>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">New Password</label>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-amber-400 outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setResetModalClient(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-4 py-1.5 bg-amber-400 text-slate-950 font-black rounded-lg shadow transition"
                >
                  {isResetting ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
