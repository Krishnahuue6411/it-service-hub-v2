'use client';

import React from 'react';
import { ProductDetail, ProductVariant } from '../../types';
import { Star, ShieldCheck, Check, Sparkles, Building2, HelpCircle } from 'lucide-react';

interface PdpInfoCenterProps {
  product: ProductDetail;
  selectedVariant: ProductVariant;
  onSelectVariant: (variant: ProductVariant) => void;
  selectedFormFactor: string;
  onSelectFormFactor: (ff: string) => void;
}

export const PdpInfoCenter: React.FC<PdpInfoCenterProps> = ({
  product,
  selectedVariant,
  onSelectVariant,
  selectedFormFactor,
  onSelectFormFactor,
}) => {
  const savings = selectedVariant.mrp - selectedVariant.price;
  const discountPercent = Math.round((savings / selectedVariant.mrp) * 100);
  const gstSavings = Math.round(selectedVariant.price * 0.18);

  return (
    <div className="space-y-5 text-slate-900">
      
      {/* Brand & Category Tag */}
      <div className="flex items-center gap-2">
        <span className="bg-slate-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
          {product.brand}
        </span>
        <span className="text-slate-300">•</span>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {product.category}
        </span>
        <span className="text-slate-300">•</span>
        <span className="text-xs font-bold text-amber-600">
          Model: {product.modelNumber}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-snug text-slate-900">
        {product.name}
      </h1>

      {/* Star Rating Bar & Q&A */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-bold text-amber-600">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>{product.rating}</span>
        </div>

        <a href="#reviews-section" className="text-slate-600 hover:text-slate-900 font-bold underline">
          {product.reviewsCount} verified ratings
        </a>

        <span className="text-slate-300">|</span>

        <a href="#qa-section" className="text-emerald-700 font-bold hover:underline flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{product.answeredQuestionsCount}+ answered questions</span>
        </a>
      </div>

      <hr className="border-slate-200" />

      {/* Pricing Section */}
      <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-2xl shadow-md space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-white">
            ₹{selectedVariant.price.toLocaleString()}
          </span>
          <span className="text-sm text-slate-400 line-through font-semibold">
            ₹{selectedVariant.mrp.toLocaleString()}
          </span>
          <span className="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-lg uppercase shadow">
            Save {discountPercent}% (₹{savings.toLocaleString()})
          </span>
        </div>

        <div className="text-xs text-slate-300 font-medium">
          Inclusive of all GST taxes & free local express delivery
        </div>

        {/* GST B2B Input Tax Credit Banner */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Building2 className="w-4 h-4" />
            <span>Save ₹{gstSavings.toLocaleString()} with GST Input Credit</span>
          </div>
          <span className="text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-mono font-bold">
            B2B Eligible
          </span>
        </div>
      </div>

      {/* Variant Selector 1: Capacity / Size Pills */}
      <div className="space-y-2">
        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
          Select Storage Capacity:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {product.variants.map((variant) => {
            const isSelected = selectedVariant.id === variant.id;

            return (
              <button
                key={variant.id}
                onClick={() => onSelectVariant(variant)}
                className={`p-3 rounded-xl border-2 text-left transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'border-amber-400 bg-amber-50/50 ring-2 ring-amber-400/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-extrabold text-xs text-slate-900">{variant.capacityLabel}</div>
                <div className="text-xs font-black text-emerald-700 mt-1">₹{variant.price.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 line-through">₹{variant.mrp.toLocaleString()}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Variant Selector 2: Form Factor Options */}
      <div className="space-y-2">
        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
          Select Interface / Form Factor:
        </label>
        <div className="space-y-2">
          {product.formFactorsList.map((ff) => {
            const isSelected = selectedFormFactor === ff;

            return (
              <button
                key={ff}
                onClick={() => onSelectFormFactor(ff)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition ${
                  isSelected
                    ? 'border-slate-950 bg-slate-950 text-amber-400 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                }`}
              >
                <span>{ff}</span>
                {isSelected ? <Check className="w-4 h-4 text-amber-400 stroke-[3]" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Key Feature Checklist */}
      <div className="space-y-2">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" /> Key Hardware Highlights
        </h4>
        <ul className="space-y-2 text-xs text-slate-700 font-medium">
          {product.keyFeatureChecklist.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span className="leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};
