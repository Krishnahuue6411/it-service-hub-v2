'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Search, 
  X, 
  ShoppingCart, 
  PhoneCall, 
  ChevronDown, 
  User, 
  Globe, 
  Sparkles,
  Zap,
  ShieldCheck,
  Headphones
} from 'lucide-react';
import { LocationInfo, CartItem, Product } from '../types';
import { CATEGORIES_LIST } from '../data/mockData';

interface HeaderProps {
  location: LocationInfo;
  onOpenLocationModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  cartItems: CartItem[];
  onOpenCartDrawer: () => void;
  allProducts: Product[];
  onSelectSearchProduct: (product: Product) => void;
}

export const Header: React.FC<HeaderProps> = ({
  location,
  onOpenLocationModal,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  cartItems,
  onOpenCartDrawer,
  allProducts,
  onSelectSearchProduct,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [cartAnimate, setCartAnimate] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  // Trigger bounce effect on cart update
  useEffect(() => {
    if (totalCartCount > 0) {
      setCartAnimate(true);
      const timer = setTimeout(() => setCartAnimate(false), 400);
      return () => clearTimeout(timer);
    }
  }, [totalCartCount, cartSubtotal]);

  // Predictive search matching
  const matchingProducts = searchQuery.trim().length > 1
    ? allProducts.filter(p => {
        const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             p.specBullet.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All Categories' || p.category === selectedCategory;
        return matchesQuery && matchesCategory;
      }).slice(0, 5)
    : [];

  // Keyboard shortcut Ctrl+K focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#0F172A] text-white shadow-xl">
      {/* Top Banner Bar - Blinkit Ultra-Fast Guarantee Strip */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-4 py-1.5 text-xs font-semibold text-white flex items-center justify-between overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="flex items-center gap-3 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Zap className="w-3 h-3 fill-slate-950 text-slate-950" /> Blinkit Speed
            </span>
            <span>⚡ Order in next <strong>24 mins</strong> for <strong>2-Hour Express Delivery</strong> in {location.area}</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[11px] font-medium text-emerald-100">
            <span className="flex items-center gap-1 hover:text-white transition cursor-pointer">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> 100% Verified Hardware & GST Billing
            </span>
            <span className="flex items-center gap-1 hover:text-white transition cursor-pointer">
              <Headphones className="w-3.5 h-3.5 text-emerald-300" /> MIDC Emergency AMC Hotline: +91 8787828888
            </span>
          </div>
        </div>
      </div>

      {/* Main Sticky Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left Section: Logo & Location Selector */}
        <div className="flex items-center gap-3 shrink-0">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 text-lg">IT</span>
              </div>
            </div>
            <div className="hidden xs:block">
              <div className="flex items-center gap-1">
                <h1 className="font-black text-sm sm:text-base tracking-tight text-white leading-tight">
                  IT SERVICE <span className="text-amber-400">HUB</span>
                </h1>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase leading-none">
                Blinkit Speed • Amazon Range
              </p>
            </div>
          </a>

          {/* Location Selector Button */}
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-2.5 sm:px-3 py-1.5 rounded-lg text-left transition-all duration-200 group text-xs shrink-0"
            title="Change Delivery Location"
          >
            <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="max-w-[130px] sm:max-w-[160px] truncate">
              <div className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-400 flex items-center gap-1 transition">
                <span>{location.pincode}</span>
                <span className="text-emerald-400 font-normal truncate">• {location.deliveryEstimate.split(' ')[0]}</span>
              </div>
              <div className="text-xs font-semibold text-slate-100 truncate group-hover:text-white">
                {location.area}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-transform group-hover:rotate-180" />
          </button>
        </div>

        {/* Center Section: Amazon-Style Unified Search Bar */}
        <div className="flex-1 max-w-2xl relative mx-1 sm:mx-2">
          <div className={`flex items-center bg-white rounded-lg overflow-hidden border-2 transition-all shadow-inner ${
            isSearchFocused ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-300 hover:border-slate-400'
          }`}>
            
            {/* Category Dropdown Selector */}
            <div className="relative border-r border-slate-200 hidden md:block shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2.5 pl-3 pr-7 cursor-pointer outline-none transition"
              >
                {CATEGORIES_LIST.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Search Input */}
            <div className="relative flex-1 flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Search CCTV, NVMe SSD, RAM, Thermal Printers, ThinkPad..."
                className="w-full py-2 px-3 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium outline-none"
              />
              
              {/* Quick Clear Button */}
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="p-1 mr-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Keyboard Shortcut Indicator */}
              <div className="hidden lg:flex items-center gap-0.5 mr-2 text-[10px] font-mono text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50 pointer-events-none">
                <span>Ctrl</span>
                <span>K</span>
              </div>
            </div>

            {/* Search Action Button */}
            <button className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2.5 transition flex items-center justify-center shrink-0">
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Predictive Search Dropdown Overlay */}
          {isSearchFocused && matchingProducts.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white text-slate-900 rounded-lg shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Matching Hardware & Parts</span>
                <span className="text-amber-600 font-semibold">{matchingProducts.length} suggestions</span>
              </div>
              <div className="divide-y divide-slate-100">
                {matchingProducts.map((product) => (
                  <div
                    key={product.id}
                    onMouseDown={() => onSelectSearchProduct(product)}
                    className="p-2.5 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition"
                  >
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-10 h-10 object-cover rounded-md border border-slate-200 shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{product.name}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{product.specBullet}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-slate-900">₹{product.price.toLocaleString()}</span>
                      <span className="block text-[10px] text-emerald-600 font-semibold">⚡ {product.deliveryTimeMinutes || 30} mins</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Language/Currency, Account, Quick Support & Cart */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          
          {/* Currency Toggle */}
          <button 
            onClick={() => setCurrency(prev => prev === 'INR' ? 'USD' : 'INR')}
            className="hidden xl:flex items-center gap-1 text-slate-300 hover:text-white text-xs font-semibold px-2 py-1 rounded hover:bg-slate-800 transition"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{currency === 'INR' ? '🇮🇳 ₹ INR' : '🇺🇸 $ USD'}</span>
          </button>

          {/* Quick AMC Support Call */}
          <a
            href="tel:+918787828888"
            className="hidden lg:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <PhoneCall className="w-3 h-3" />
            </div>
            <div>
              <div className="text-[9px] text-slate-400 leading-none">24/7 MIDC Hotline</div>
              <div className="text-[11px] font-bold text-emerald-400">+91 8787828888</div>
            </div>
          </a>

          {/* Account & Orders Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
              className="hidden sm:flex items-center gap-1.5 text-left text-xs p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <User className="w-4 h-4 text-slate-300" />
              <div>
                <div className="text-[10px] text-slate-400 leading-none">Hello, Sign in</div>
                <div className="font-bold text-white flex items-center gap-0.5">
                  Account & Lists <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            </button>

            {showAccountDropdown && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 p-3 z-50 text-xs animate-in fade-in zoom-in-95">
                <div className="p-2.5 bg-slate-50 rounded-lg text-center mb-2">
                  <p className="font-bold text-slate-800 mb-1">Sign in to your account</p>
                  <button className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-1.5 rounded-md transition shadow-sm">
                    Sign In
                  </button>
                </div>
                <hr className="my-2 border-slate-100" />
                <div className="space-y-1 text-slate-700">
                  <a href="/account" className="block px-2 py-1.5 rounded hover:bg-slate-100 font-medium">Your Orders & GST Invoices</a>
                  <a href="/admin" className="block px-2 py-1.5 rounded hover:bg-slate-100 font-medium font-bold text-blue-600">⚙️ Admin Control Portal</a>
                  <a href="/technician" className="block px-2 py-1.5 rounded hover:bg-slate-100 font-medium font-bold text-amber-600">👷 Field Technician Portal</a>
                  <a href="#" className="block px-2 py-1.5 rounded hover:bg-slate-100 font-medium">B2B Bulk Quote History</a>
                  <a href="#" className="block px-2 py-1.5 rounded hover:bg-slate-100 font-medium">AMC Active Plan Status</a>
                  <a href="#" className="block px-2 py-1.5 rounded hover:bg-slate-100 font-medium text-emerald-600 font-bold flex items-center justify-between">
                    Saved GSTIN Profiles <Sparkles className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Cart Button (Blinkit Style Live Counter) */}
          <button
            onClick={onOpenCartDrawer}
            className={`flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-3 sm:px-4 py-2 rounded-xl shadow-lg transition-all duration-300 active:scale-95 group ${
              cartAnimate ? 'scale-105 ring-4 ring-emerald-400/40' : ''
            }`}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 group-hover:rotate-6 transition-transform" />
              {totalCartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-md">
                  {totalCartCount}
                </span>
              )}
            </div>

            <div className="text-left hidden xs:block">
              <div className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-200 leading-none">
                My Cart
              </div>
              <div className="text-xs font-black text-white">
                {totalCartCount > 0 ? `₹${cartSubtotal.toLocaleString()}` : '0 Items'}
              </div>
            </div>
          </button>

        </div>
      </div>
    </header>
  );
};
