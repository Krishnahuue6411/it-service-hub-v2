'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Star, Plus, Minus, Timer, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { Product, CartItem } from '../types';

interface FlashDealsSectionProps {
  products: Product[];
  cartItems: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
}

export const FlashDealsSection: React.FC<FlashDealsSectionProps> = ({
  products,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
}) => {
  // Countdown timer state (4h 18m 42s countdown)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 18, seconds: 42 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getQuantityInCart = (productId: string) => {
    const found = cartItems.find((item) => item.product.id === productId);
    return found ? found.quantity : 0;
  };

  const scrollLeft = () => {
    const container = document.getElementById('flash-deals-scroll');
    if (container) container.scrollBy({ left: -320, behavior: 'smooth' });
  };

  const scrollRight = () => {
    const container = document.getElementById('flash-deals-scroll');
    if (container) container.scrollBy({ left: 320, behavior: 'smooth' });
  };

  return (
    <section id="flash-deals" className="py-8 px-4 bg-gradient-to-b from-amber-500/10 via-slate-50 to-white border-y border-amber-200/60 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Header with Title & Countdown Timer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md animate-pulse">
              <Flame className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  ⚡ Flash Deals of the Day
                </h3>
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Limited Units
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">Blinkit speed delivery on limited stock pricing</p>
            </div>
          </div>

          {/* Countdown Clock Badge */}
          <div className="flex items-center gap-2 bg-slate-950 text-white px-4 py-2 rounded-xl shadow-lg border border-slate-800 self-start sm:self-auto">
            <Timer className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-xs font-semibold text-slate-400">Ends in:</span>
            <div className="flex items-center gap-1 font-mono font-black text-sm text-amber-400">
              <span className="bg-slate-800 px-1.5 py-0.5 rounded">{String(timeLeft.hours).padStart(2, '0')}h</span> :
              <span className="bg-slate-800 px-1.5 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, '0')}m</span> :
              <span className="bg-slate-800 px-1.5 py-0.5 rounded">{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="relative">
          <button
            onClick={scrollLeft}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-slate-800 hover:bg-amber-400 hover:text-slate-950 items-center justify-center shadow-xl border border-slate-200 z-10 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={scrollRight}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-slate-800 hover:bg-amber-400 hover:text-slate-950 items-center justify-center shadow-xl border border-slate-200 z-10 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Horizontal Swipeable Product Strip */}
          <div
            id="flash-deals-scroll"
            className="flex items-stretch gap-4 overflow-x-auto scrollbar-none pb-4 pt-1 px-1 scroll-smooth"
          >
            {products.map((product) => {
              const qtyInCart = getQuantityInCart(product.id);
              const savings = product.mrp - product.price;

              return (
                <div
                  key={product.id}
                  className="w-[260px] sm:w-[280px] shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  <div className="relative p-3">
                    {/* Discount Badge */}
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-md z-10">
                      {product.badge || `${product.discountPercentage}% OFF`}
                    </div>

                    {/* Delivery Time Pill */}
                    <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md text-amber-400 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
                      <Zap className="w-3 h-3 fill-amber-400" />
                      <span>{product.deliveryTimeMinutes || 30} mins</span>
                    </div>

                    {/* Image with Hover Zoom */}
                    <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-100 mb-3 relative flex items-center justify-center">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Ratings & Title */}
                    <div className="flex items-center gap-1 mb-1 text-xs">
                      <div className="flex items-center text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                        <span>{product.rating}</span>
                      </div>
                      <span className="text-slate-400 text-[11px]">({product.reviewsCount.toLocaleString()})</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 mb-1 group-hover:text-amber-600 transition-colors">
                      {product.name}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-1 mb-3 bg-slate-50 p-1.5 rounded-md border border-slate-100 font-medium">
                      {product.specBullet}
                    </p>
                  </div>

                  {/* Price & Blinkit Style ADD Button */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-black text-slate-950">
                          ₹{product.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 line-through font-semibold">
                          ₹{product.mrp.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-emerald-600">
                        Save ₹{savings.toLocaleString()}
                      </div>
                    </div>

                    {/* Blinkit Interactive + ADD / - [Qty] + Trigger */}
                    {qtyInCart === 0 ? (
                      <button
                        onClick={() => onAddToCart(product)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl border border-emerald-500 shadow-md transition-all duration-200 active:scale-95 flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>ADD</span>
                      </button>
                    ) : (
                      <div className="flex items-center bg-emerald-700 text-white rounded-xl overflow-hidden font-extrabold text-xs shadow-md border border-emerald-600 shrink-0">
                        <button
                          onClick={() => onUpdateQuantity(product.id, -1)}
                          className="px-2.5 py-2 hover:bg-emerald-800 transition active:scale-90"
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <span className="px-2 py-1 text-center min-w-[20px] font-black text-amber-300">
                          {qtyInCart}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(product.id, 1)}
                          className="px-2.5 py-2 hover:bg-emerald-800 transition active:scale-90"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
