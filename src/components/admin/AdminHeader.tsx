'use client';

import React, { useState } from 'react';
import { Search, Plus, ShieldCheck, Bell, ChevronDown, User, Sparkles } from 'lucide-react';

interface AdminHeaderProps {
  onSearch: (query: string) => void;
  onQuickAction: (actionType: 'product' | 'job' | 'amc' | 'invoice') => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onSearch,
  onQuickAction,
}) => {
  const [searchVal, setSearchVal] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
  };

  return (
    <header className="bg-[#0F172A] text-white sticky top-0 z-40 shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        
        {/* Left Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-amber-400 text-base shadow">
            IT
          </div>
          <div>
            <div className="font-extrabold text-sm text-white leading-none flex items-center gap-1.5">
              <span>IT SERVICE HUB ADMIN</span>
              <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded">
                v2.4 PORTAL
              </span>
            </div>
            <div className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">
              M45 MIDC Nagapur, Ahilyanagar Desk
            </div>
          </div>
        </div>

        {/* Center Global Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value);
                onSearch(e.target.value);
              }}
              placeholder="Search Job ID (#JOB-8941), GSTIN, Order #, or Serial..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none focus:border-amber-400"
            />
          </div>
        </form>

        {/* Right Actions & Admin Profile */}
        <div className="flex items-center gap-3">
          
          {/* "+ New Action" Quick Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ New Action</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 text-xs font-bold divide-y divide-slate-800 animate-in fade-in duration-150">
                <button
                  onClick={() => { onQuickAction('product'); setShowDropdown(false); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-800 text-amber-400 transition"
                >
                  📦 Add New Hardware Product
                </button>
                <button
                  onClick={() => { onQuickAction('job'); setShowDropdown(false); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-800 text-emerald-400 transition"
                >
                  🛠️ Log Digital Repair Job Card
                </button>
                <button
                  onClick={() => { onQuickAction('amc'); setShowDropdown(false); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-800 text-blue-400 transition"
                >
                  🏢 Create B2B AMC Contract
                </button>
                <button
                  onClick={() => { onQuickAction('invoice'); setShowDropdown(false); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-800 text-white transition"
                >
                  📄 Generate GST Tax Invoice
                </button>
              </div>
            )}
          </div>

          {/* Admin Avatar */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-left pr-1">
              <div className="font-extrabold text-white text-[11px] leading-tight">Admin Master</div>
              <div className="text-[9px] text-emerald-400 font-bold">Ahilyanagar Desk</div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
