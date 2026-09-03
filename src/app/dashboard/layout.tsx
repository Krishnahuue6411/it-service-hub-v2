import React from 'react';
import { getBusinessProfile } from '../../actions/erp-actions';
import { ErpSidebar } from '../../components/erp/ErpSidebar';

export const metadata = {
  title: 'B2B ERP & Invoicing Dashboard | Vyapar Architecture',
  description: 'Enterprise B2B Accounting, Khata Ledger, Bill of Materials, and GST Billing Platform',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const business = await getBusinessProfile();

  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Desktop ERP Sidebar */}
      <div className="hidden lg:block shrink-0 sticky top-0 h-screen overflow-y-auto">
        <ErpSidebar
          businessName={business.name}
          gstin={business.gstin}
          settings={business.settings}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Mobile Top Header */}
        <header className="lg:hidden bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center">
              B2B
            </div>
            <div>
              <div className="font-extrabold text-xs text-white truncate max-w-[180px]">
                {business.name}
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold">
                GST: {business.gstin || 'Active'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/dashboard/settings/business"
              className="bg-slate-800 text-amber-400 border border-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl"
            >
              ⚙️ Settings
            </a>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>

      </div>
    </div>
  );
}
