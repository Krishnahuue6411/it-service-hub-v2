'use client';

import React, { useState } from 'react';
import { ProductDetail, ProductVariant, LocationInfo } from '../../types';
import { MapPin, ShoppingCart, ShoppingBag, ShieldCheck, RefreshCw, Lock, Zap, Check } from 'lucide-react';

interface BuyBoxCardProps {
  product: ProductDetail;
  selectedVariant: ProductVariant;
  quantity: number;
  setQuantity: (qty: number) => void;
  location: LocationInfo;
  onCheckPincode: (pincode: string) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export const BuyBoxCard: React.FC<BuyBoxCardProps> = ({
  product,
  selectedVariant,
  quantity,
  setQuantity,
  location,
  onCheckPincode,
  onAddToCart,
  onBuyNow,
}) => {
  const [pincodeInput, setPincodeInput] = useState(location.pincode);
  const [pincodeMsg, setPincodeMsg] = useState<string | null>(null);

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincodeInput.trim().length === 6) {
      onCheckPincode(pincodeInput);
      setPincodeMsg(`⚡ Express delivery confirmed for ${pincodeInput} (Today by 6 PM)`);
    } else {
      setPincodeMsg('Please enter a valid 6-digit Pincode');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg space-y-4 sticky top-24">
      
      {/* Total Price & Stock Urgency */}
      <div>
        <div className="text-2xl font-black text-slate-950">
          ₹{(selectedVariant.price * quantity).toLocaleString()}
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total for {quantity} {quantity === 1 ? 'unit' : 'units'} (Includes GST)
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            In-Stock ({selectedVariant.stockCount} Units Left)
          </span>
          {selectedVariant.stockCount <= 5 && (
            <span className="text-[11px] text-rose-600 font-extrabold animate-pulse">
              🔥 Selling Fast!
            </span>
          )}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Pincode & Express Delivery Checker */}
      <div className="space-y-2">
        <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
          Delivery Pincode Check
        </label>
        <form onSubmit={handlePincodeSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              maxLength={6}
              value={pincodeInput}
              onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 414111"
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition shadow"
          >
            Check
          </button>
        </form>

        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
          <div className="font-extrabold text-emerald-950 flex items-center gap-1.5">
            <Zap className="w-4 h-4 fill-emerald-600 text-emerald-600" />
            <span>⚡ Delivery Estimate for {location.area} ({location.pincode}):</span>
          </div>
          <div className="text-[11px] text-emerald-800 font-bold mt-1">
            Order within <strong>18 mins</strong> for <strong>Today 6 PM Express Dispatch</strong>.
          </div>
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="space-y-1.5">
        <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
          Quantity:
        </label>
        <select
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold py-2 px-3 rounded-xl outline-none focus:border-amber-400 cursor-pointer"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <option key={num} value={num}>
              {num} {num === 1 ? 'Unit' : 'Units'}
            </option>
          ))}
        </select>
      </div>

      {/* Primary Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={onAddToCart}
          className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm py-3 rounded-xl shadow-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 group"
        >
          <ShoppingCart className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span>Add to Cart</span>
        </button>

        <button
          onClick={onBuyNow}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-sm py-3 rounded-xl shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Buy Now (Instant Checkout)</span>
        </button>
      </div>

      {/* Trust Badges */}
      <div className="pt-3 border-t border-slate-200 space-y-2 text-[11px] text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>100% Genuine Direct OEM Hardware</span>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>7-Day Direct Onsite Replacement</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>256-Bit Encrypted UPI / Card Checkout</span>
        </div>
      </div>

    </div>
  );
};
