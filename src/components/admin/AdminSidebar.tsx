'use client';

import React from 'react';
import { 
  BarChart3, 
  Package, 
  Wrench, 
  Ticket, 
  FileText, 
  Users, 
  LogOut,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';

export type AdminTab = 'overview' | 'inventory' | 'services' | 'repair-jobs' | 'invoices' | 'clients';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: 'overview' as AdminTab, label: 'Overview & Analytics', icon: BarChart3, badge: 'Live' },
    { id: 'inventory' as AdminTab, label: 'Hardware Inventory', icon: Package, badge: '3 Low' },
    { id: 'services' as AdminTab, label: 'Services & AMC Manager', icon: Wrench, badge: '14 Active' },
    { id: 'repair-jobs' as AdminTab, label: 'Digital Repair Job Cards', icon: Ticket, badge: '8 Jobs' },
    { id: 'invoices' as AdminTab, label: 'B2B Orders & GST Invoices', icon: FileText, badge: 'GSTR-1' },
    { id: 'clients' as AdminTab, label: 'MIDC Client Directory', icon: Users, badge: '42 B2B' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
      <div className="space-y-1">
        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 py-1">
          Admin Management Modules
        </div>

        {tabs.map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full px-3.5 py-3 rounded-xl font-bold text-xs flex items-center justify-between transition ${
                isActive
                  ? 'bg-slate-950 text-amber-400 shadow-md font-black'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <IconComp className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </div>

              {tab.badge && (
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* GST Reports Direct Link */}
        <Link
          href="/admin/reports"
          className="w-full px-3.5 py-3 rounded-xl font-bold text-xs flex items-center justify-between text-emerald-700 hover:bg-emerald-50 transition border border-emerald-200 mt-2"
        >
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>GSTR-1 & P&L Reports</span>
          </div>
          <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
            CA Tax
          </span>
        </Link>
      </div>

      <div className="pt-3 border-t border-slate-200">
        <a
          href="/"
          className="w-full px-3.5 py-2 rounded-xl font-extrabold text-xs text-slate-600 hover:bg-slate-100 transition flex items-center gap-2"
        >
          <LogOut className="w-4 h-4 text-slate-500" />
          <span>Return to Store Front</span>
        </a>
      </div>
    </div>
  );
};
