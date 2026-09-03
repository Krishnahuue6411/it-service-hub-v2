'use client';

import React, { useState } from 'react';
import { MOCK_ORDER_HISTORY } from '../../data/accountData';
import { Search, FileText, Truck, RotateCcw, ShoppingBag, ShieldCheck, Filter } from 'lucide-react';

export const OrdersTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('2026');

  const filteredOrders = MOCK_ORDER_HISTORY.filter((order) => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleDownloadInvoice = (orderId: string) => {
    alert(`Downloading Tax Invoice PDF for Order #${orderId}...\nIncludes GSTR-3B tax metadata.`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="font-black text-lg text-slate-900 leading-tight">
            My Orders & Hardware Purchases
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track shipments, download tax invoices, or request replacement parts
          </p>
        </div>

        {/* Search & Year Selector */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none"
          >
            <option value="last30">Last 30 Days</option>
            <option value="2026">Year 2026</option>
            <option value="2025">Year 2025</option>
          </select>
        </div>
      </div>

      {/* Order Cards List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-medium text-xs">
            No orders found matching your search query.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.orderId}
              className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-0 hover:border-slate-300 transition"
            >
              {/* Order Card Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">ORDER PLACED</div>
                    <div className="font-extrabold text-slate-900">{order.orderDate}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">TOTAL PAID</div>
                    <div className="font-black text-slate-950">₹{order.totalAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">SHIP TO</div>
                    <div className="font-bold text-slate-800">{order.shipToName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full font-black text-xs ${
                    order.statusColor === 'emerald'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {order.statusBadge}
                  </span>
                  <span className="font-mono text-slate-500 font-bold">#{order.orderId}</span>
                </div>
              </div>

              {/* Order Card Body */}
              <div className="p-4 divide-y divide-slate-100">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 flex flex-col sm:flex-row gap-4 items-start justify-between">
                    <div className="flex items-start gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                      />
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{item.name}</h4>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          Variant: <strong>{item.variant}</strong>
                        </div>
                        <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> {item.warranty}
                        </div>
                      </div>
                    </div>

                    <div className="font-black text-slate-950 text-sm shrink-0">
                      ₹{item.price.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Card Footer Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="/order-success"
                    className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow transition flex items-center gap-1"
                  >
                    <Truck className="w-3.5 h-3.5" /> Track Package
                  </a>

                  <button
                    onClick={() => handleDownloadInvoice(order.orderId)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow transition flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" /> Download Tax Invoice (PDF)
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <button
                    onClick={() => alert('Replacement ticket initialized. A technician will contact you shortly.')}
                    className="hover:text-slate-900 transition flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" /> Return / Replace
                  </button>

                  <a
                    href="/products"
                    className="hover:text-slate-900 transition flex items-center gap-1 pl-2 border-l border-slate-300"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Buy Again
                  </a>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
