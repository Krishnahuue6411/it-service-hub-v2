'use client';

import React, { useState } from 'react';
import { Star, Plus, Minus, Zap, ShoppingBag, Sparkles } from 'lucide-react';
import { Product, CartItem } from '../types';

interface BestSellersTabsProps {
  products: Product[];
  cartItems: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onBuyNow: (product: Product) => void;
}

type TabType = 'top-rated' | 'industrial-cctv' | 'office-it' | 'upgrades';

export const BestSellersTabs: React.FC<BestSellersTabsProps> = ({
  products,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  onBuyNow,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('top-rated');

  const tabs = [
    { id: 'top-rated', label: '⭐ Top Rated & Bestsellers' },
    { id: 'industrial-cctv', label: '📹 Industrial CCTV & Security' },
    { id: 'office-it', label: '💻 Office IT & Workstations' },
    { id: 'upgrades', label: '⚡ SSD & PC Upgrades' },
  ];

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'top-rated') return p.rating >= 4.7;
    return p.tabGroup === activeTab;
  });

  const getQuantityInCart = (productId: string) => {
    const found = cartItems.find((item) => item.product.id === productId);
    return found ? found.quantity : 0;
  };

  return (
    <section className="py-10 px-4 max-w-7xl mx-auto">
      
      {/* Section Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Verified Catalog
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Industrial Equipment & Hardware Catalog
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Amazon-grade comprehensive warranty with Blinkit local express fulfillment
          </p>
        </div>

        {/* Tab Buttons Strip */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 pt-1 border-b border-slate-200">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as TabType)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 active:scale-95 shrink-0 ${
                activeTab === t.id
                  ? 'bg-[#0F172A] text-white shadow-lg ring-2 ring-slate-800'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid (1 col mobile, 2 col tablet, 4 col desktop, 5 col XL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => {
          const qtyInCart = getQuantityInCart(product.id);
          const savings = product.mrp - product.price;

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group p-3.5"
            >
              <div>
                {/* Header Badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {product.category.split(' ')[0]}
                  </span>
                  <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <Zap className="w-3 h-3 fill-emerald-600" />
                    <span>{product.deliveryTimeMinutes || 45} min delivery</span>
                  </span>
                </div>

                {/* Product Image */}
                <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-50 mb-3 relative flex items-center justify-center border border-slate-100">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.badge && (
                    <div className="absolute bottom-2 left-2 bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded shadow">
                      {product.badge}
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="flex items-center text-amber-500 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                    <span>{product.rating}</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">({product.reviewsCount} verified reviews)</span>
                </div>

                {/* Title */}
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 mb-1.5 group-hover:text-amber-600 transition-colors">
                  {product.name}
                </h4>

                {/* Spec Bullet */}
                <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100 font-medium">
                  • {product.specBullet}
                </p>
              </div>

              {/* Price & Action Buttons */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-lg font-black text-slate-950">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 line-through ml-1.5 font-semibold">
                      ₹{product.mrp.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Save ₹{savings.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Quantity / Add to Cart */}
                  {qtyInCart === 0 ? (
                    <button
                      onClick={() => onAddToCart(product)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2 px-3 rounded-xl transition shadow-md flex items-center justify-center gap-1 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" /> ADD
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-700 text-white rounded-xl overflow-hidden font-black text-xs shadow-md border border-emerald-600">
                      <button
                        onClick={() => onUpdateQuantity(product.id, -1)}
                        className="px-2 py-1.5 hover:bg-emerald-800 transition"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                      <span className="text-amber-300">{qtyInCart}</span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, 1)}
                        className="px-2 py-1.5 hover:bg-emerald-800 transition"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  )}

                  {/* Buy Now Button */}
                  <button
                    onClick={() => onBuyNow(product)}
                    className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs py-2 px-3 rounded-xl transition shadow flex items-center justify-center gap-1 active:scale-95"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Buy Now
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
};
