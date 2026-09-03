'use client';

import React, { useState } from 'react';
import { Product } from '../../types';
import { Star, Heart, Plus, Minus, Zap, ShoppingBag, ShieldCheck, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  cartQuantity: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
  onBuyNow,
}) => {
  const [isWishlisted, setIsWishlisted] = useState(product.isWishlisted || false);
  const savings = product.mrp - product.price;

  // LIST VIEW LAYOUT
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400/80 shadow-sm hover:shadow-xl transition-all duration-300 p-4 flex flex-col md:flex-row gap-5 items-stretch group relative overflow-hidden">
        
        {/* Wishlist Floating Heart */}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`absolute top-4 right-4 p-2 rounded-full border transition z-10 ${
            isWishlisted
              ? 'bg-rose-50 border-rose-200 text-rose-600'
              : 'bg-white/80 border-slate-200 text-slate-400 hover:text-rose-500'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Product Image & Badges */}
        <div className="w-full md:w-56 h-48 rounded-xl bg-slate-50 border border-slate-100 relative overflow-hidden shrink-0 flex items-center justify-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            <span className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider shadow">
              {product.badge || `${product.discountPercentage}% OFF`}
            </span>
            {product.isBestSeller && (
              <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md uppercase shadow">
                #1 Best Seller
              </span>
            )}
            {product.isAmazonChoice && (
              <span className="bg-slate-950 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase shadow">
                Amazon&apos;s Choice
              </span>
            )}
          </div>
        </div>

        {/* Details & Specs */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                {product.brand}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md">
                <Zap className="w-3 h-3 fill-emerald-600" />
                <span>{product.deliveryTimeMinutes || 30} min express</span>
              </span>
            </div>

            <h3 
              className="font-extrabold text-slate-900 text-base md:text-lg line-clamp-2 group-hover:text-amber-600 transition-colors"
              title={product.name}
            >
              {product.name}
            </h3>

            {/* Ratings */}
            <div className="flex items-center gap-2 mt-1.5 mb-2">
              <div className="flex items-center text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                <span>{product.rating}</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                ({product.reviewsCount.toLocaleString()} verified ratings)
              </span>
            </div>

            {/* Key Feature Pills */}
            <div className="flex flex-wrap gap-1.5 my-2">
              {product.keySpecsPills.map((pill, idx) => (
                <span
                  key={idx}
                  className="bg-slate-100 text-slate-700 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-slate-200"
                >
                  ✓ {pill}
                </span>
              ))}
            </div>

            {/* GST Eligibility Tag */}
            <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>GST Input Tax Credit Eligible (Instant Tax Invoice)</span>
            </div>
          </div>

          {/* Pricing & Actions */}
          <div className="pt-3 mt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-950">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 line-through font-semibold">
                  ₹{product.mrp.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Save ₹{savings.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Inclusive of all taxes & free installation in MIDC</p>
            </div>

            <div className="flex items-center gap-2">
              {cartQuantity === 0 ? (
                <button
                  onClick={() => onAddToCart(product)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> ADD
                </button>
              ) : (
                <div className="flex items-center bg-emerald-700 text-white rounded-xl overflow-hidden font-extrabold text-xs shadow-md border border-emerald-600">
                  <button
                    onClick={() => onUpdateQuantity(product.id, -1)}
                    className="px-3 py-2 hover:bg-emerald-800 transition"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                  <span className="px-3 text-amber-300 font-black">{cartQuantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(product.id, 1)}
                    className="px-3 py-2 hover:bg-emerald-800 transition"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              )}

              <button
                onClick={() => onBuyNow(product)}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1 active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" /> Buy Now
              </button>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // GRID VIEW LAYOUT
  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400/80 shadow-sm hover:shadow-xl transition-all duration-300 p-3.5 flex flex-col justify-between group relative overflow-hidden">
      
      {/* Top Floating Badges & Wishlist */}
      <div>
        <div className="flex items-start justify-between gap-1 mb-2 z-10">
          <div className="flex flex-col gap-1">
            <span className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider shadow">
              {product.badge || `${product.discountPercentage}% OFF`}
            </span>
            {product.isBestSeller && (
              <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md uppercase shadow">
                Best Seller
              </span>
            )}
          </div>

          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`p-1.5 rounded-full border transition ${
              isWishlisted
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white/80 border-slate-200 text-slate-400 hover:text-rose-500'
            }`}
            title="Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
          </button>
        </div>

        {/* Product Image */}
        <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-50 mb-3 relative flex items-center justify-center border border-slate-100">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md text-emerald-400 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3 fill-emerald-400" />
            <span>{product.deliveryTimeMinutes || 30} mins</span>
          </div>
        </div>

        {/* Brand & Ratings */}
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-extrabold text-slate-400 text-[10px] uppercase tracking-wider">
            {product.brand}
          </span>
          <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{product.rating}</span>
            <span className="text-slate-400 text-[10px]">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Title */}
        <h4 
          className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors leading-tight"
          title={product.name}
        >
          {product.name}
        </h4>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.keySpecsPills.slice(0, 2).map((pill, idx) => (
            <span
              key={idx}
              className="bg-slate-100 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded border border-slate-200"
            >
              {pill}
            </span>
          ))}
        </div>
      </div>

      {/* Pricing & Blinkit Action Bar */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-base sm:text-lg font-black text-slate-950">
              ₹{product.price.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 line-through ml-1 font-semibold">
              ₹{product.mrp.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            Save ₹{savings.toLocaleString()}
          </span>
        </div>

        {/* GST Invoice Tag */}
        <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>GST Credit Eligible</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {cartQuantity === 0 ? (
            <button
              onClick={() => onAddToCart(product)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2 px-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-1 active:scale-95"
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
              <span className="text-amber-300">{cartQuantity}</span>
              <button
                onClick={() => onUpdateQuantity(product.id, 1)}
                className="px-2 py-1.5 hover:bg-emerald-800 transition"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          )}

          <button
            onClick={() => onBuyNow(product)}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs py-2 px-2.5 rounded-xl transition shadow flex items-center justify-center gap-1 active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Buy Now
          </button>
        </div>
      </div>

    </div>
  );
};
