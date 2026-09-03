'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  Factory,
  ShoppingBag,
  FileText,
  PieChart,
  Settings,
  Building2,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { BusinessSettings } from '../../types/erp';

interface ErpSidebarProps {
  businessName: string;
  gstin?: string;
  settings: BusinessSettings;
}

export const ErpSidebar: React.FC<ErpSidebarProps> = ({
  businessName,
  gstin,
  settings,
}) => {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
    },
    {
      label: 'Parties & Khata',
      href: '/dashboard/parties',
      icon: Users,
      badge: 'Ledger',
      active: pathname.startsWith('/dashboard/parties'),
    },
    {
      label: 'Items & Stock',
      href: '/dashboard/items',
      icon: Package,
      badge: 'Inventory',
      active: pathname.startsWith('/dashboard/items'),
    },
    // Dynamically displayed based on settings.enable_bom
    ...(settings.enable_bom
      ? [
          {
            label: 'Manufacturing (BOM)',
            href: '/dashboard/manufacturing',
            icon: Factory,
            badge: 'BOM Active',
            badgeColor: 'bg-amber-400 text-slate-950',
            active: pathname.startsWith('/dashboard/manufacturing'),
          },
        ]
      : []),
    // Dynamically displayed based on settings.enable_po
    ...(settings.enable_po
      ? [
          {
            label: 'Purchase Orders',
            href: '/dashboard/purchases',
            icon: ShoppingBag,
            badge: 'Procurement',
            active: pathname.startsWith('/dashboard/purchases'),
          },
        ]
      : []),
    {
      label: 'Sales Invoices',
      href: '/dashboard/invoices',
      icon: FileText,
      badge: settings.enable_gst ? 'GST Ready' : 'Standard',
      active: pathname.startsWith('/dashboard/invoices'),
    },
    {
      label: 'Reports & GSTR',
      href: '/dashboard/reports',
      icon: PieChart,
      active: pathname.startsWith('/dashboard/reports'),
    },
    {
      label: 'Business Settings',
      href: '/dashboard/settings/business',
      icon: Settings,
      active: pathname.startsWith('/dashboard/settings'),
      highlight: true,
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen text-slate-300">
      
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-600 text-slate-950 flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform">
              B2B
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-sm text-white truncate leading-tight group-hover:text-amber-400 transition-colors">
                {businessName}
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>GST: {gstin || 'Non-GST'}</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 text-xs font-bold">
          {/* Fast Billing CTA */}
          <Link
            href="/dashboard/billing/new"
            className="w-full mb-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-slate-950 px-3.5 py-2.5 rounded-xl font-black shadow-lg flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <span className="text-base font-black">+</span>
              <span>New Sales Invoice</span>
            </div>
            <span className="text-[10px] bg-slate-950 text-amber-400 px-2 py-0.5 rounded-md font-mono">
              POS Fast
            </span>
          </Link>

          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-3 py-1.5">
            Operations & Accounting
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition group ${
                  item.active
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'hover:bg-slate-900 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${item.active ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                    item.badgeColor || (item.active ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400')
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Banner */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <div className="flex items-center gap-2 text-xs font-black text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Vyapar / ERP Core v1.0</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium leading-snug">
            Multi-Tenant RLS Enabled with Live GST & Thermal Engine
          </p>
        </div>

        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-white font-bold flex items-center justify-between px-2 py-1 transition"
        >
          <span>Exit to Main Hub</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </aside>
  );
};
