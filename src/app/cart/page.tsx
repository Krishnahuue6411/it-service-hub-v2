'use client';

import React, { useState } from 'react';
import { Header } from '../../components/Header';
import { SecondaryNav } from '../../components/SecondaryNav';
import { CartDrawer } from '../../components/CartDrawer';
import { LocationModal } from '../../components/LocationModal';
import { Footer } from '../../components/Footer';

import { useCart } from '../../context/CartContext';
import { PRODUCTS_DATABASE } from '../../data/mockData';
import { 
  Trash2, 
  Bookmark, 
  Share2, 
  GitCompare, 
  ShieldCheck, 
  Building2, 
  Ticket, 
  Check, 
  ArrowRight, 
  Lock, 
  ShoppingBag, 
  Zap,
  Plus,
  Minus,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function CartPage() {
  const {
    cartItems,
    savedForLaterItems,
    location,
    setLocation,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    toggleItemSelect,
    toggleSelectAll,
    saveForLater,
    moveToCartFromSaved,
    couponCode,
    appliedDiscount,
    couponMessage,
    applyCoupon,
    removeCoupon,
    isGstInvoiceRequired,
    setIsGstInvoiceRequired,
    showToast,
    itemToDelete,
    setItemToDelete,
    confirmDelete,
  } = useCart();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [inputCoupon, setInputCoupon] = useState(couponCode || '');

  const selectedCartItems = cartItems.filter((i) => i.isSelected);
  const allSelected = cartItems.length > 0 && cartItems.every((i) => i.isSelected);

  // Calculations
  const itemSubtotal = selectedCartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const mrpTotal = selectedCartItems.reduce(
    (sum, item) => sum + item.product.mrp * item.quantity,
    0
  );
  const productDiscount = mrpTotal - itemSubtotal;
  const deliveryFee = itemSubtotal >= 2000 || itemSubtotal === 0 ? 0 : 49;
  const handlingFee = itemSubtotal > 0 ? 19 : 0;
  const gstInputCredit = Math.round(itemSubtotal * 0.18);
  const grandTotal = Math.max(0, itemSubtotal + deliveryFee + handlingFee - appliedDiscount);

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyCoupon(inputCoupon);
  };

  const handleProceedToBuy = () => {
    if (selectedCartItems.length === 0) {
      alert('Please select at least one item to proceed to checkout!');
      return;
    }
    alert(
      `Order Confirmed! Express delivery dispatched to ${location.area}. Grand Total: ₹${grandTotal.toLocaleString()}`
    );
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Header */}
      <Header
        location={location}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        searchQuery=""
        setSearchQuery={() => {}}
        selectedCategory="All Categories"
        setSelectedCategory={() => {}}
        cartItems={cartItems}
        onOpenCartDrawer={() => setIsCartDrawerOpen(true)}
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
      <div className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 space-y-6">
        
        {/* Page Title & Delivery Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Shopping Cart & Order Summary</span>
              <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full">
                {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Amazon-grade order protection with Blinkit 2-Hour Express Delivery
            </p>
          </div>

          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-950 flex items-center gap-2 self-start sm:self-auto">
            <Zap className="w-4 h-4 fill-emerald-600 text-emerald-600 shrink-0" />
            <span>Delivering to <strong>{location.area} ({location.pincode})</strong></span>
          </div>
        </div>

        {/* 70/30 Desktop Grid Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN (70% width) - Cart Items & Controls */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Main Cart Items Container */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              
              {/* Bulk Select Header */}
              {cartItems.length > 0 && (
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs font-extrabold text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
                    />
                    <span>Select all items ({cartItems.length})</span>
                  </label>

                  <span className="text-slate-400 font-medium">Price</span>
                </div>
              )}

              {/* Cart Item Rows */}
              {cartItems.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-3xl">
                    🛒
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">Your Shopping Cart is Empty</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Explore our hardware catalog for Crucial SSDs, Kingston RAM, and Hikvision CCTV kits.
                    </p>
                  </div>
                  <a
                    href="/products"
                    className="inline-block bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow transition"
                  >
                    Browse Hardware Catalog
                  </a>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="py-4 flex flex-col sm:flex-row gap-4 items-start">
                      
                      {/* Checkbox & Product Image */}
                      <div className="flex items-start gap-3 shrink-0">
                        <input
                          type="checkbox"
                          checked={item.isSelected || false}
                          onChange={() => toggleItemSelect(item.product.id)}
                          className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer mt-2"
                        />
                        <div className="w-24 h-24 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Info & Options */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-900 text-white font-black text-[9px] px-2 py-0.5 rounded uppercase">
                            {item.product.brand}
                          </span>
                          <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded">
                            In Stock • 2-Hour Dispatch
                          </span>
                        </div>

                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 line-clamp-2">
                          {item.product.name}
                        </h3>

                        <div className="text-xs text-slate-500 font-medium">
                          Variant: <strong className="text-slate-800">{item.capacityLabel || item.product.specBullet}</strong>
                        </div>

                        {/* B2B GST Invoice Checkbox Option */}
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-200 w-fit">
                          <input
                            type="checkbox"
                            checked={isGstInvoiceRequired}
                            onChange={(e) => setIsGstInvoiceRequired(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                          />
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Claim 18% GST Input Credit for Business</span>
                          </span>
                        </label>

                        {/* Quantity Modifier & Action Links */}
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                          {/* Quantity Counter */}
                          <div className="flex items-center bg-emerald-700 text-white rounded-xl overflow-hidden font-black text-xs shadow-sm">
                            <button
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="px-2.5 py-1.5 hover:bg-emerald-800 transition active:scale-90"
                            >
                              <Minus className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                            <span className="px-3 text-amber-300 font-black">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="px-2.5 py-1.5 hover:bg-emerald-800 transition active:scale-90"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-bold text-slate-500 divide-x divide-slate-200">
                            <button
                              onClick={() => setItemToDelete(item.product.id)}
                              className="hover:text-rose-600 transition flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Delete
                            </button>

                            <button
                              onClick={() => saveForLater(item.product.id)}
                              className="pl-3 hover:text-slate-900 transition flex items-center gap-1"
                            >
                              <Bookmark className="w-3.5 h-3.5 text-amber-500" /> Save for Later
                            </button>

                            <button
                              onClick={() => showToast('Product link copied!')}
                              className="pl-3 hover:text-slate-900 transition hidden sm:flex items-center gap-1"
                            >
                              <Share2 className="w-3.5 h-3.5" /> Share
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right Price Display */}
                      <div className="text-left sm:text-right shrink-0">
                        <div className="text-lg font-black text-slate-950">
                          ₹{(item.product.price * item.quantity).toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-400 line-through">
                          ₹{(item.product.mrp * item.quantity).toLocaleString()}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-600">
                          Save ₹{((item.product.mrp - item.product.price) * item.quantity).toLocaleString()}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* "Saved for Later" Section */}
            {savedForLaterItems.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>Saved for Later ({savedForLaterItems.length} items)</span>
                  </h3>
                </div>

                <div className="divide-y divide-slate-100">
                  {savedForLaterItems.map((item) => (
                    <div key={item.product.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-14 h-14 object-cover rounded-xl border border-slate-200"
                        />
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <div className="text-xs font-black text-slate-950 mt-0.5">
                            ₹{item.product.price.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => moveToCartFromSaved(item.product.id)}
                        className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-xl transition shadow active:scale-95 shrink-0"
                      >
                        Move to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN (30% width, Sticky) - Order Summary Box */}
          <div className="lg:col-span-4 space-y-4 sticky top-24">
            
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg space-y-4">
              
              <h3 className="font-black text-lg text-slate-900 border-b border-slate-200 pb-3">
                Order Summary
              </h3>

              {/* Subtotal */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Subtotal ({selectedCartItems.length} selected items):</span>
                  <span className="text-slate-950 text-sm font-black">₹{itemSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Total MRP:</span>
                  <span className="line-through">₹{mrpTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Product Discount:</span>
                  <span>-₹{productDiscount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Express Local Delivery:</span>
                  <span className={deliveryFee === 0 ? 'text-emerald-700 font-extrabold' : ''}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Handling / Packaging:</span>
                  <span>₹{handlingFee}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 p-1.5 rounded-lg">
                    <span>Coupon ({couponCode}):</span>
                    <span>-₹{appliedDiscount}</span>
                  </div>
                )}
              </div>

              {/* Coupon Code Input */}
              <form onSubmit={handleCouponSubmit} className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
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

              {/* B2B GST Input Credit Banner */}
              {isGstInvoiceRequired && (
                <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1 text-xs">
                  <div className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span>GST Input Tax Credit Claimable</span>
                  </div>
                  <div className="text-[11px] text-slate-300 leading-snug">
                    Save up to <strong>₹{gstInputCredit.toLocaleString()}</strong> on your GSTR-3B tax return!
                  </div>
                </div>
              )}

              <hr className="border-slate-200" />

              {/* Grand Total */}
              <div className="flex items-baseline justify-between text-base font-black text-slate-950">
                <span>Grand Total:</span>
                <span className="text-xl text-emerald-700">₹{grandTotal.toLocaleString()}</span>
              </div>

              {/* Primary CTA */}
              <button
                onClick={handleProceedToBuy}
                className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm py-3.5 rounded-xl shadow-xl transition duration-200 active:scale-95 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Proceed to Buy</span>
              </button>

              {/* Security Seals */}
              <div className="pt-3 border-t border-slate-200 space-y-2 text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>256-Bit SSL Encrypted Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Genuine IT Hardware Spares</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Footer */}
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={location}
        onSelectLocation={(loc) => {
          setLocation(loc);
          showToast(`Location set to ${loc.area}`);
        }}
      />

      {/* Zero State Deletion Confirm Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900">Remove Item?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this item from your shopping cart?
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

    </main>
  );
}
