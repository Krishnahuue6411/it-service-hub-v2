'use client';

import React, { useState } from 'react';
import { Header } from '../../components/Header';
import { SecondaryNav } from '../../components/SecondaryNav';
import { AccountWelcomeBar } from '../../components/account/AccountWelcomeBar';
import { AccountSidebar, AccountTab } from '../../components/account/AccountSidebar';
import { OrdersTab } from '../../components/account/OrdersTab';
import { RepairJobsTab } from '../../components/account/RepairJobsTab';
import { AmcContractsTab } from '../../components/account/AmcContractsTab';
import { GstTaxCenterTab } from '../../components/account/GstTaxCenterTab';
import { ProfileSettingsTab } from '../../components/account/ProfileSettingsTab';
import { CartDrawer } from '../../components/CartDrawer';
import { Footer } from '../../components/Footer';

import { MOCK_USER_PROFILE } from '../../data/accountData';
import { PRODUCTS_DATABASE, INITIAL_LOCATION } from '../../data/mockData';
import { MapPin, Plus } from 'lucide-react';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<AccountTab>('orders');
  const user = MOCK_USER_PROFILE;

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Navigation Header */}
      <Header
        location={INITIAL_LOCATION}
        onOpenLocationModal={() => {}}
        searchQuery=""
        setSearchQuery={() => {}}
        selectedCategory="All Categories"
        setSelectedCategory={() => {}}
        cartItems={[]}
        onOpenCartDrawer={() => {}}
        allProducts={PRODUCTS_DATABASE}
        onSelectSearchProduct={() => {}}
      />

      {/* Secondary Strip Nav */}
      <SecondaryNav
        activeCategory=""
        onSelectCategory={() => {}}
        onScrollToSection={() => {}}
      />

      {/* Main Page Container */}
      <div className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 space-y-6">
        
        {/* Top Welcome Bar & Stat Metrics */}
        <AccountWelcomeBar user={user} />

        {/* 2-Column Responsive Layout (Sidebar + Dynamic Tab Content) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Sidebar (3 Cols Desktop) */}
          <div className="lg:col-span-3">
            <AccountSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* Right Dynamic Tab View (9 Cols Desktop) */}
          <div className="lg:col-span-9">
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'repairs' && <RepairJobsTab />}
            {activeTab === 'amc' && <AmcContractsTab />}
            {activeTab === 'gst' && <GstTaxCenterTab />}
            
            {activeTab === 'addresses' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-500" />
                    <span>Saved Delivery Locations</span>
                  </h3>
                  <button className="bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5 text-amber-400" /> Add Address
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium">
                  <div className="p-4 border-2 border-amber-400 bg-amber-50 rounded-2xl space-y-1">
                    <span className="bg-slate-900 text-amber-400 font-bold text-[9px] px-2 py-0.5 rounded uppercase">MIDC FACTORY (DEFAULT)</span>
                    <h4 className="font-extrabold text-sm text-slate-900">Rahul Deshmukh (Factory Manager)</h4>
                    <p className="text-slate-600">Plot C-14, Sector 3, MIDC Industrial Area, Ahilyanagar - 414111</p>
                    <p className="text-slate-500 font-bold">📞 +91 9876543210</p>
                  </div>

                  <div className="p-4 border border-slate-200 bg-white rounded-2xl space-y-1">
                    <span className="bg-slate-100 text-slate-700 font-bold text-[9px] px-2 py-0.5 rounded uppercase">BUSINESS OFFICE</span>
                    <h4 className="font-extrabold text-sm text-slate-900">PAIS Trading Office</h4>
                    <p className="text-slate-600">Office 204, Commercial Complex, Savedi Road, Ahilyanagar - 414003</p>
                    <p className="text-slate-500 font-bold">📞 +91 8787828888</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && <ProfileSettingsTab user={user} />}
          </div>

        </div>

      </div>

      <Footer />

      {/* Cart Drawer */}
      <CartDrawer />

    </main>
  );
}
