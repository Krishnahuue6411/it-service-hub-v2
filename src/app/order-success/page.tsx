'use client';

import React from 'react';
import { Header } from '../../components/Header';
import { SecondaryNav } from '../../components/SecondaryNav';
import { TrackingTimeline } from '../../components/order/TrackingTimeline';
import { InvoiceDetails } from '../../components/order/InvoiceDetails';
import { CartDrawer } from '../../components/CartDrawer';
import { Footer } from '../../components/Footer';

import { FLAGSHIP_CONFIRMED_ORDER } from '../../data/orderData';
import { PRODUCTS_DATABASE, INITIAL_LOCATION } from '../../data/mockData';
import { 
  CheckCircle2, 
  MessageSquare, 
  Wrench, 
  Headphones, 
  ShoppingBag, 
  ArrowRight, 
  Building2, 
  Zap,
  Sparkles
} from 'lucide-react';

export default function OrderSuccessPage() {
  const order = FLAGSHIP_CONFIRMED_ORDER;

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
      <div className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 space-y-8">
        
        {/* 1. Top Success Hero Banner */}
        <div className="bg-gradient-to-r from-[#0F172A] via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6 relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg animate-bounce">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    CONFIRMED & DISPATCHED
                  </span>
                  <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Express Order
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
                  Order Placed Successfully! 🎉
                </h1>

                <p className="text-xs text-slate-400 font-medium mt-1">
                  Thank you for shopping with IT Service Hub. Your hardware package is being prepared for MIDC dispatch.
                </p>
              </div>
            </div>

            {/* Order Meta Info Pill */}
            <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 text-xs space-y-1.5 shrink-0">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400 font-bold">Order ID:</span>
                <span className="font-mono font-black text-amber-400">#{order.orderId}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400 font-bold">Date & Time:</span>
                <span className="font-bold text-white">{order.orderDate}, {order.orderTime}</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-slate-700 pt-1 text-emerald-400 font-black">
                <span>Dispatch:</span>
                <span>⚡ Within 2 Hours</span>
              </div>
            </div>

          </div>

          {/* Instant WhatsApp Alert Pill */}
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-2xl text-xs font-bold text-emerald-300 flex items-center gap-2 relative z-10">
            <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              An SMS & WhatsApp confirmation with live tracking link has been sent to <strong>{order.contactPhone}</strong>
            </span>
          </div>

        </div>

        {/* 2. Live Order Lifecycle Stepper (Blinkit Style Tracking Bar) */}
        <TrackingTimeline
          steps={order.trackingSteps}
          technicianName={order.technicianName}
          technicianPhone={order.technicianPhone}
        />

        {/* 3. Detailed Order Breakdown (2-Column Grid) */}
        <InvoiceDetails order={order} />

        {/* 4. Post-Purchase Value & B2B Upsell Strip */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            Post-Purchase Services & Corporate Actions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: B2B AMC Contract */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition space-y-2 group">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
                <Building2 className="w-5 h-5 text-amber-700" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Need AMC or Regular Maintenance?</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Sign up for annual hardware maintenance contracts tailored for MIDC factories.
              </p>
              <a
                href="https://wa.me/918787828888?text=Interested%20in%20Annual%20AMC%20Maintenance%20Contract"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-black text-amber-700 hover:text-amber-800 pt-1"
              >
                <span>Request B2B AMC Quote</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Card 2: Remote AnyDesk Support */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition space-y-2 group">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-black">
                <Headphones className="w-5 h-5 text-blue-700" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Remote Technical Support</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Need immediate remote installation support via AnyDesk or TeamViewer?
              </p>
              <a
                href="https://wa.me/918787828888?text=Need%20Remote%20AnyDesk%20Installation%20Support"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-black text-blue-700 hover:text-blue-800 pt-1"
              >
                <span>Connect Remote Tech</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Card 3: Continue Shopping */}
            <div className="p-5 bg-slate-950 text-white rounded-2xl shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black mb-2">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-white">Continue Shopping</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Browse more CCTV kits, RAM upgrades, or refurbished ThinkPads.
                </p>
              </div>

              <a
                href="/products"
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow transition text-center flex items-center justify-center gap-1.5"
              >
                <span>Return to Hardware Store</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </div>

      </div>

      <Footer />

      {/* Cart Drawer */}
      <CartDrawer />

    </main>
  );
}
