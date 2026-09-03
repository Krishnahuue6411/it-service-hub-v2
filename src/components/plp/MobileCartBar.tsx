'use client';

import React from 'react';
import { ShoppingCart, ArrowRight, Zap } from 'lucide-react';
import { CartItem } from '../../types';

interface MobileCartBarProps {
  cartItems: CartItem[];
  onOpenCartDrawer: () => void;
}

export const MobileCartBar: React.FC<MobileCartBarProps> = ({
  cartItems,
  onOpenCartDrawer,
}) => {
  const totalCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);

  if (totalCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A] text-white border-t border-slate-800 p-3 shadow-2xl lg:hidden animate-in slide-in-from-bottom duration-300">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        
        {/* Left Item Count & Subtotal */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black relative shrink-0">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {totalCount}
            </span>
          </div>

          <div>
            <div className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 fill-emerald-400" />
              <span>{totalCount} {totalCount === 1 ? 'Item' : 'Items'} Added</span>
            </div>
            <div className="text-base font-black text-white leading-tight">
              ₹{subtotal.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Right Action Button */}
        <button
          onClick={onOpenCartDrawer}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95 transition shrink-0"
        >
          <span>View Cart</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
