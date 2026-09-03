'use client';

import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Ticket, 
  Check, 
  Truck, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { CROSS_SELL_ESSENTIALS } from '../data/cartData';
import { Product } from '../types';

export const CartDrawer: React.FC = () => {
  const {
    cartItems,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    location,
    updateQuantity,
    removeFromCart,
    addToCart,
    applyCoupon,
    couponCode,
    appliedDiscount,
    couponMessage,
    itemToDelete,
    setItemToDelete,
    confirmDelete,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState(couponCode || '');

  if (!isCartDrawerOpen) return null;

  // Calculations
  const itemSubtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const mrpTotal = cartItems.reduce(
    (sum, item) => sum + item.product.mrp * item.quantity,
    0
  );
  const productDiscount = mrpTotal - itemSubtotal;
  const freeDeliveryThreshold = 2000;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - itemSubtotal);
  const deliveryFee = itemSubtotal >= freeDeliveryThreshold || itemSubtotal === 0 ? 0 : 49;
  const handlingFee = itemSubtotal > 0 ? 19 : 0;
  const gstTaxAmount = Math.round(itemSubtotal * 0.18);
  const grandTotal = Math.max(0, itemSubtotal + deliveryFee + handlingFee - appliedDiscount);
  const totalSavings = productDiscount + appliedDiscount + (deliveryFee === 0 && itemSubtotal > 0 ? 49 : 0);

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyCoupon(inputCoupon);
  };

  const handleAddCrossSell = (item: typeof CROSS_SELL_ESSENTIALS[0]) => {
    const dummyProd: Product = {
      id: item.id,
      name: item.name,
      category: item.category,
      brand: 'Essential Spares',
      condition: 'New',
      price: item.price,
      mrp: item.mrp,
      rating: 4.8,
      reviewsCount: 150,
      imageUrl: item.imageUrl,
      specBullet: 'Essential IT accessory',
      discountPercentage: Math.round(((item.mrp - item.price) / item.mrp) * 100),
      inStock: true,
      tabGroup: 'upgrades',
      keySpecsPills: ['Essential Extra'],
    };
    addToCart(dummyProd, 1);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div 
        onClick={() => setIsCartDrawerOpen(false)} 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white text-slate-900 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-4 bg-[#0F172A] text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm">
                ⚡
              </div>
              <div>
                <h3 className="font-extrabold text-base leading-tight flex items-center gap-1.5">
                  <span>My Cart</span>
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                  </span>
                </h3>
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-emerald-400" />
                  <span>Delivering to {location.area} in 2 Hours</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Progress Bar */}
          <div className="bg-emerald-50 p-3 border-b border-emerald-200 text-xs">
            <div className="flex items-center justify-between font-bold text-emerald-950 mb-1">
              <span className="flex items-center gap-1">
                <Truck className="w-4 h-4 text-emerald-600" />
                {amountNeededForFreeDelivery === 0
                  ? '🎉 You unlocked FREE On-Site Delivery & Setup!'
                  : `Add ₹${amountNeededForFreeDelivery.toLocaleString()} more for FREE Delivery!`}
              </span>
              <span className="text-[10px] text-emerald-700 font-mono">
                {Math.min(100, Math.round((itemSubtotal / freeDeliveryThreshold) * 100))}%
              </span>
            </div>
            <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, (itemSubtotal / freeDeliveryThreshold) * 100)}%` }}
              />
            </div>
          </div>

          {/* Scrollable Cart Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-slate-100">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-3xl">
                  🛒
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">Your Cart is Empty</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Add SSDs, CCTV cameras, or refurbished laptops to get 2-Hour Express Delivery in Ahilyanagar.
                  </p>
                </div>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.product.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight">
                      {item.product.name}
                    </h5>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {item.capacityLabel || item.product.specBullet}
                    </div>

                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xs font-black text-slate-950">
                        ₹{item.product.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 line-through">
                        ₹{item.product.mrp.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Modifier */}
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="flex items-center bg-emerald-700 text-white rounded-xl overflow-hidden font-black text-xs shadow-md">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="px-2.5 py-1.5 hover:bg-emerald-800 transition active:scale-90"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                      <span className="px-2 text-amber-300 min-w-[18px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="px-2.5 py-1.5 hover:bg-emerald-800 transition active:scale-90"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>

                    <button
                      onClick={() => setItemToDelete(item.product.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Smart Cross-Sell Micro-Carousel Strip */}
            {cartItems.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Don't Forget These Essentials
                  </h4>
                </div>

                <div className="flex items-stretch gap-2.5 overflow-x-auto scrollbar-none pb-2">
                  {CROSS_SELL_ESSENTIALS.map((item) => (
                    <div
                      key={item.id}
                      className="w-36 p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between shrink-0 group hover:border-amber-400 transition"
                    >
                      <div>
                        <img src={item.imageUrl} alt={item.name} className="w-full h-16 object-contain rounded-md mb-1 bg-white p-1" />
                        <div className="text-[11px] font-bold text-slate-900 line-clamp-2 leading-tight">
                          {item.name}
                        </div>
                      </div>

                      <div className="mt-2 pt-1 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-black text-slate-950">₹{item.price}</span>
                        <button
                          onClick={() => handleAddCrossSell(item)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-2 py-1 rounded-lg transition active:scale-95 flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" /> ADD
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bill Details Breakdown & Sticky Bottom CTA */}
          {cartItems.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 shadow-inner">
              
              {/* Coupon Box */}
              <form onSubmit={handleCouponSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Ticket className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    placeholder="Coupon (MIDC500)"
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs uppercase font-bold outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
                >
                  Apply
                </button>
              </form>

              {couponMessage && (
                <div className="text-[11px] font-bold text-emerald-800 bg-emerald-100 p-1.5 rounded-md flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-700" /> {couponMessage}
                </div>
              )}

              {/* Bill Breakdown Table */}
              <div className="text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Item Total (MRP)</span>
                  <span className="font-bold text-slate-800">₹{mrpTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Product Discount</span>
                  <span>-₹{productDiscount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Local Delivery</span>
                  <span className={deliveryFee === 0 ? 'text-emerald-700 font-black' : 'font-bold'}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Handling / Packaging Charge</span>
                  <span className="font-bold text-slate-800">₹{handlingFee}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Voucher Discount</span>
                    <span>-₹{appliedDiscount}</span>
                  </div>
                )}

                {/* Total Savings Badge */}
                {totalSavings > 0 && (
                  <div className="p-1.5 bg-emerald-100 text-emerald-800 font-black text-[11px] rounded-lg text-center">
                    🎉 You saved ₹{totalSavings.toLocaleString()} on this order!
                  </div>
                )}

                <hr className="border-slate-200" />

                <div className="flex justify-between text-sm font-black text-slate-950 pt-1">
                  <span>Grand Total</span>
                  <span className="text-emerald-700 text-base">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Sticky Checkout CTA */}
              <a
                href="/cart"
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-sm py-3 rounded-xl shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <div className="text-[10px] text-slate-500 text-center font-medium flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Safe Payments • Razorpay & UPI Verified
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Zero State Deletion Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900">Remove Item?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this item from your cart?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow transition"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
