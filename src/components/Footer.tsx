'use client';

import React from 'react';
import { PhoneCall, Mail, MapPin, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0F172A] text-slate-300 border-t border-slate-800">
      
      {/* Top Banner Strip */}
      <div className="bg-slate-900 border-b border-slate-800 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg">
              IT
            </div>
            <div>
              <h4 className="font-extrabold text-base text-white">Need Custom B2B Quotation or AMC Plan?</h4>
              <p className="text-xs text-slate-400 font-medium">Get instant GST invoices & dedicated field engineers for MIDC industrial factories.</p>
            </div>
          </div>
          <a
            href="tel:+918787828888"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Hotline: +91 8787828888</span>
          </a>
        </div>
      </div>

      {/* Main Multi-Column Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-xs">
        
        {/* Column 1: About */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              IT
            </div>
            <span className="font-black text-base text-white tracking-tight">IT SERVICE HUB</span>
          </div>
          <p className="text-slate-400 leading-relaxed font-medium">
            Combining the hyper-local speed of Blinkit with the massive catalog selection of Amazon. Ahilyanagar's premier destination for computer parts, SSDs, CCTV security setups, and enterprise software solutions.
          </p>
          <div className="text-slate-400 space-y-1 font-medium pt-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>MIDC Industrial Area Sector 3, Ahilyanagar - 414111</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>support@itservicehub.com</span>
            </div>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Customer Portal</h4>
          <ul className="space-y-2 text-slate-400 font-medium">
            <li><a href="#" className="hover:text-amber-400 transition">Products & Hardware Catalog</a></li>
            <li><a href="#flash-deals" className="hover:text-amber-400 transition">Flash Deals & Daily Offers</a></li>
            <li><a href="#" className="hover:text-amber-400 transition">Track Express Delivery Order</a></li>
            <li><a href="#" className="hover:text-amber-400 transition">Annual AMC Maintenance Contract</a></li>
            <li><a href="#" className="hover:text-amber-400 transition">Refurbished Laptop Certification</a></li>
          </ul>
        </div>

        {/* Column 3: Corporate & B2B */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">B2B & Enterprise</h4>
          <ul className="space-y-2 text-slate-400 font-medium">
            <li><a href="#" className="hover:text-amber-400 transition">Factory CCTV Onsite Survey</a></li>
            <li><a href="#" className="hover:text-amber-400 transition">Bulk GST Invoice Purchase</a></li>
            <li><a href="#" className="hover:text-amber-400 transition">Biometric Attendance Hardware</a></li>
            <li><a href="#" className="hover:text-amber-400 transition">Network Rack & Fiber Fitting</a></li>
            <li><a href="../admin/index.php" className="text-amber-400 font-bold hover:underline flex items-center gap-1">Admin Management Portal <ArrowUpRight className="w-3.5 h-3.5" /></a></li>
          </ul>
        </div>

        {/* Column 4: Compliance & Payment Trust Badges */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Policies & Security</h4>
          <ul className="space-y-2 text-slate-400 font-medium">
            <li><a href="#" className="hover:text-amber-400 transition">Return & Direct Replacement Policy</a></li>
            <li><a href="#" className="hover:text-amber-400 transition">Refund & Warranty Terms</a></li>
            <li><a href="#" className="hover:text-amber-400 transition">Privacy & Data Security Policy</a></li>
            <li><a href="#" className="hover:text-amber-400 transition">Terms of Service</a></li>
          </ul>

          <div className="pt-2">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Accepted Payment Modes</span>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
              <span className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-emerald-400">BHIM UPI</span>
              <span className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-amber-400">RuPay</span>
              <span className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-blue-400">Visa</span>
              <span className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-rose-400">Mastercard</span>
              <span className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-indigo-400">NetBanking</span>
            </div>
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800 py-4 px-4 text-center text-slate-500 text-[11px] font-medium">
        © {new Date().getFullYear()} IT Service Hub. All Rights Reserved. Production-grade E-Commerce Platform engineered for speed & catalog depth.
      </div>
    </footer>
  );
};
