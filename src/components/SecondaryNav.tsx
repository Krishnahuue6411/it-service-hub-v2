'use client';

import React from 'react';
import { 
  ShieldAlert, 
  Laptop, 
  HardDrive, 
  Printer, 
  Code, 
  Flame, 
  Wrench,
  ChevronRight
} from 'lucide-react';

interface SecondaryNavProps {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  onScrollToSection: (sectionId: string) => void;
}

export const SecondaryNav: React.FC<SecondaryNavProps> = ({
  activeCategory,
  onSelectCategory,
  onScrollToSection
}) => {
  const navItems = [
    { label: '⚡ Deals of the Day', sectionId: 'flash-deals', icon: Flame, badge: 'HOT', color: 'text-amber-400 font-bold' },
    { label: 'CCTV & Security', category: 'CCTV & Security', icon: ShieldAlert },
    { label: 'Laptops & Refurbished', category: 'Laptops & Refurbished', icon: Laptop, badge: '6-Mo Warranty' },
    { label: 'SSD & PC Upgrades', category: 'SSD & RAM Upgrades', icon: HardDrive, badge: 'Popular' },
    { label: 'Printers & Toners', category: 'Printers & Toners', icon: Printer },
    { label: 'Custom Business Software', category: 'Software & AMC', icon: Code },
    { label: 'Emergency MIDC Support', sectionId: 'trust-strip', icon: Wrench, color: 'text-emerald-400 font-bold' },
  ];

  return (
    <nav className="bg-[#1E293B] text-slate-200 border-b border-slate-700/60 shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto scrollbar-none py-2 gap-2 text-xs font-semibold whitespace-nowrap">
        <div className="flex items-center gap-1.5 sm:gap-3">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeCategory === item.category;

            return (
              <button
                key={idx}
                onClick={() => {
                  if (item.category) {
                    onSelectCategory(item.category);
                  }
                  if (item.sectionId) {
                    onScrollToSection(item.sectionId);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-slate-700/80 active:scale-95 group shrink-0 ${
                  isActive ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm' : 'hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.color || (isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400')} transition-colors`} />
                <span className={item.color || ''}>{item.label}</span>
                
                {item.badge && !isActive && (
                  <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded font-black border border-emerald-500/30 uppercase tracking-wide">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-1 text-[11px] text-amber-400 font-bold uppercase tracking-wider pl-4 border-l border-slate-700/60 shrink-0">
          <span>MIDC Factory Hotline</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </nav>
  );
};
