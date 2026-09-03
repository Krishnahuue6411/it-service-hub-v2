'use client';

import React, { useState } from 'react';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar, AdminTab } from '../../components/admin/AdminSidebar';
import { OverviewModule } from '../../components/admin/OverviewModule';
import { InventoryModule } from '../../components/admin/InventoryModule';
import { ServicesAmcModule } from '../../components/admin/ServicesAmcModule';
import { RepairJobsModule } from '../../components/admin/RepairJobsModule';
import { InvoicesModule } from '../../components/admin/InvoicesModule';
import { Users, Building2, Phone, Mail, ShieldCheck } from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Quick Action Modals State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);

  const handleQuickAction = (actionType: 'product' | 'job' | 'amc' | 'invoice') => {
    if (actionType === 'product') {
      setActiveTab('inventory');
      setShowAddProductModal(true);
    } else if (actionType === 'job') {
      setActiveTab('repair-jobs');
      setShowAddJobModal(true);
    } else if (actionType === 'amc') {
      setActiveTab('services');
      setShowAddServiceModal(true);
    } else if (actionType === 'invoice') {
      setActiveTab('invoices');
      setShowAddInvoiceModal(true);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      
      {/* Top Header Bar */}
      <AdminHeader
        onSearch={(q) => setGlobalSearchQuery(q)}
        onQuickAction={handleQuickAction}
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 space-y-6">
        
        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Sidebar Navigation (3 Cols) */}
          <div className="lg:col-span-3">
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* Dynamic Module Content (9 Cols) */}
          <div className="lg:col-span-9">
            {activeTab === 'overview' && <OverviewModule />}
            
            {activeTab === 'inventory' && (
              <InventoryModule
                showAddModal={showAddProductModal}
                setShowAddModal={setShowAddProductModal}
              />
            )}

            {activeTab === 'services' && (
              <ServicesAmcModule
                showAddModal={showAddServiceModal}
                setShowAddModal={setShowAddServiceModal}
              />
            )}

            {activeTab === 'repair-jobs' && (
              <RepairJobsModule
                showAddModal={showAddJobModal}
                setShowAddModal={setShowAddJobModal}
              />
            )}

            {activeTab === 'invoices' && (
              <InvoicesModule
                showAddModal={showAddInvoiceModal}
                setShowAddModal={setShowAddInvoiceModal}
              />
            )}

            {activeTab === 'clients' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                  <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-500" />
                    <span>MIDC Factory & Business Client Directory</span>
                  </h3>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    42 Verified B2B Accounts
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                  <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="bg-slate-900 text-amber-400 font-black text-[9px] px-2 py-0.5 rounded uppercase">B2B AMC CLIENT</span>
                      <span className="font-mono text-slate-400 font-bold">#IT-CL-8842</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">PAIS Printing & Trading Pvt Ltd</h4>
                    <p className="text-slate-600 font-bold">Sunil Vahurwagh (Director) / Rahul Deshmukh</p>
                    <p className="font-mono text-slate-500">GSTIN: 27AIKPV9768Q1ZP</p>
                    <p className="text-slate-500">📞 +91 9850817291 • sunil.vahurwagh@gmail.com</p>
                    <p className="text-slate-500">📍 M45 MIDC Nagapur Sector 3, Ahilyanagar - 414111</p>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="bg-slate-900 text-amber-400 font-black text-[9px] px-2 py-0.5 rounded uppercase">MIDC FACTORY</span>
                      <span className="font-mono text-slate-400 font-bold">#IT-CL-7210</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">Patil Agro Processing Industries</h4>
                    <p className="text-slate-600 font-bold">Suresh Patil (General Manager)</p>
                    <p className="font-mono text-slate-500">GSTIN: 27AAACP1234F1Z9</p>
                    <p className="text-slate-500">📞 +91 9850123456 • info@patilagro.in</p>
                    <p className="text-slate-500">📍 Plot C-12, MIDC Nagapur Phase 2, Ahilyanagar - 414111</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </main>
  );
}
