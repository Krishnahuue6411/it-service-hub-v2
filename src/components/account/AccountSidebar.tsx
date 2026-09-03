'use client';

import React from 'react';
import { 
  Package, 
  Wrench, 
  Building2, 
  FileText, 
  MapPin, 
  Settings, 
  LogOut 
} from 'lucide-react';

export type AccountTab = 'orders' | 'repairs' | 'amc' | 'gst' | 'addresses' | 'settings';

interface AccountSidebarProps {
  activeTab: AccountTab;
  setActiveTab: (tab: AccountTab) => void;
}

export const AccountSidebar: React.FC<AccountSidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: 'orders' as AccountTab, label: 'My Orders & Purchases', icon: Package, badge: '2 Active' },
    { id: 'repairs' as AccountTab, label: 'Live Repair Job Cards', icon: Wrench, badge: '1 Open' },
    { id: 'amc' as AccountTab, label: 'B2B AMC Contracts', icon: Building2, badge: 'Active' },
    { id: 'gst' as AccountTab, label: 'GST Tax Center', icon: FileText, badge: 'GSTR-2B' },
    { id: 'addresses' as AccountTab, label: 'Saved Addresses', icon: MapPin },
    { id: 'settings' as AccountTab, label: 'Profile & Business GST', icon: Settings },
  ];

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out of your account?')) {
      window.location.href = '/';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-4">
      
      <div className="space-y-1">
        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 py-1">
          Account Dashboard Navigation
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
      </div>

      {/* Sign Out Action Button */}
      <div className="pt-3 border-t border-slate-200">
        <button
          onClick={handleSignOut}
          className="w-full px-3.5 py-2.5 rounded-xl font-extrabold text-xs text-rose-600 hover:bg-rose-50 transition flex items-center gap-2"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Sign Out of Account</span>
        </button>
      </div>

    </div>
  );
};
