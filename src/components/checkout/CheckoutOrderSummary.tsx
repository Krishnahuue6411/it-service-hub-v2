'use client';

import React, { useState } from 'react';
import { CartItem, LocationInfo, Address, B2BProfile } from '../../types';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Building2, 
  Ticket, 
  Check, 
  Lock, 
  Loader2, 
  Zap, 
  RefreshCw, 
  Wrench 
} from 'lucide-react';

interface CheckoutOrderSummaryProps {
  cartItems: CartItem[];
  location: LocationInfo;
  selectedAddress?: Address;
  b2bProfile: B2BProfile;
  isGstRequired: boolean;
  couponCode: string;
  appliedDiscount: number;
  couponMessage: string | null;
  onApplyCoupon: (code: string) => void;
  deliverySpeed: 'express' | 'standard';
  onPlaceOrder: () => void;
  isSubmitting: boolean;
}

export const CheckoutOrderSummary: React.FC<CheckoutOrderSummaryProps> = ({
  cartItems,
  location,
  selectedAddress,
  b2bProfile,
  isGstRequired,
  couponCode,
  appliedDiscount,
  couponMessage,
  onApplyCoupon,
  deliverySpeed,
  onPlaceOrder,
  isSubmitting,
}) => {
  const [inputCoupon, setInputCoupon] = useState(couponCode || '');

  const selectedItems = cartItems.filter((i) => i.isSelected);

  const basePriceTotal = selectedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const mrpTotal = selectedItems.reduce(
    (sum, item) => sum + item.product.mrp * item.quantity,
    0
  );
  const productDiscount = mrpTotal - basePriceTotal;
  const gstTaxAmount = Math.round(basePriceTotal * 0.18);
  const deliveryFee = deliverySpeed === 'express' || basePriceTotal >= 2000 ? 0 : 49;
  const handlingFee = basePriceTotal > 0 ? 19 : 0;
  const grandTotal = Math.max(0, basePriceTotal + deliveryFee + handlingFee - appliedDiscount);

  const handleCouponForm = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyCoupon(inputCoupon);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg space-y-4 sticky top-24">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
        <h3 className="font-black text-lg text-slate-900 leading-tight">
          Order Summary
        </h3>
        <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full">
          {selectedItems.length} {selectedItems.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {/* Mini Order Items List */}
      <div className="max-h-56 overflow-y-auto scrollbar-none divide-y divide-slate-100 pr-1 space-y-2">
        {selectedItems.map((item) => (
          <div key={item.product.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <h5 className="font-bold text-slate-900 truncate">{item.product.name}</h5>
                <div className="text-[10px] text-slate-500 font-medium">
                  Qty: {item.quantity} • {item.capacityLabel || item.product.brand}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 font-black text-slate-950">
              ₹{(item.product.price * item.quantity).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <hr className="border-slate-200" />

      {/* Price Calculation Table */}
      <div className="text-xs space-y-1.5 text-slate-600 font-medium">
        <div className="flex justify-between">
          <span>Items Base Subtotal</span>
          <span className="font-bold text-slate-950">₹{basePriceTotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-emerald-700 font-bold">
          <span>Catalog MRP Savings</span>
          <span>-₹{productDiscount.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span>Estimated GST (18%)</span>
          <span className="font-bold text-slate-900">₹{gstTaxAmount.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span>Dispatch & Delivery Fee</span>
          <span className={deliveryFee === 0 ? 'text-emerald-700 font-extrabold' : 'font-bold'}>
            {deliveryFee === 0 ? 'FREE (MIDC Express)' : `₹${deliveryFee}`}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Handling & Packaging</span>
          <span className="font-bold text-slate-900">₹{handlingFee}</span>
        </div>

        {appliedDiscount > 0 && (
          <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 p-1.5 rounded-lg">
            <span>Promo Coupon ({couponCode})</span>
            <span>-₹{appliedDiscount}</span>
          </div>
        )}
      </div>

      {/* Promo Code Box */}
      <form onSubmit={handleCouponForm} className="space-y-2 pt-2 border-t border-slate-100">
        <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
          Promo Voucher / Coupon Code
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Ticket className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputCoupon}
              onChange={(e) => setInputCoupon(e.target.value)}
              placeholder="e.g. MIDC500"
              className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold uppercase outline-none focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition shadow"
          >
            Apply
          </button>
        </div>
        {couponMessage && (
          <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 p-1.5 rounded-md flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-600" /> {couponMessage}
          </div>
        )}
      </form>

      {/* B2B GST Credit Callout */}
      {isGstRequired && b2bProfile.isValidGstin && (
        <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1 text-xs">
          <div className="font-extrabold text-emerald-400 flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            <span>18% GST Input Credit Active</span>
          </div>
          <div className="text-[11px] text-slate-300">
            GSTIN: <strong>{b2bProfile.gstin}</strong> ({b2bProfile.companyName || 'Firm'}). Save ₹{gstTaxAmount.toLocaleString()} on tax returns.
          </div>
        </div>
      )}

      <hr className="border-slate-200" />

      {/* Grand Total Display */}
      <div className="flex items-baseline justify-between text-base font-black text-slate-950">
        <span>Grand Total:</span>
        <span className="text-2xl text-emerald-700">₹{grandTotal.toLocaleString()}</span>
      </div>

      {/* Primary CTA Button */}
      <button
        onClick={onPlaceOrder}
        disabled={isSubmitting || selectedItems.length === 0}
        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-sm py-3.5 rounded-xl shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing Order...</span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-4 h-4" />
            <span>Place Order & Pay ₹{grandTotal.toLocaleString()}</span>
          </>
        )}
      </button>

      {/* Trust Guarantees */}
      <div className="pt-3 border-t border-slate-200 space-y-2 text-[11px] text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>7-Day Direct Onsite Replacement Guarantee</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Official GST Tax Invoice Included</span>
        </div>
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Free Technical Consultation & Support</span>
        </div>
      </div>

    </div>
  );
};
