'use client';

import React from 'react';
import { FilterState } from '../../types';
import { Star, X, Check, Zap, RotateCcw } from 'lucide-react';

interface PlpFilterSidebarProps {
  filterState: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onClearAll: () => void;
  brandCounts: Record<string, number>;
  totalProductsCount: number;
  isOpenMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const PlpFilterSidebar: React.FC<PlpFilterSidebarProps> = ({
  filterState,
  onFilterChange,
  onClearAll,
  brandCounts,
  totalProductsCount,
  isOpenMobileDrawer,
  onCloseMobileDrawer,
}) => {
  const brandsList = [
    'Crucial',
    'Kingston',
    'Western Digital',
    'Hikvision',
    'Dahua',
    'CP Plus',
    'Lenovo',
    'HP',
    'Epson',
    'TP-Link',
    'Logitech',
  ];

  const handleBrandToggle = (brand: string) => {
    const exists = filterState.selectedBrands.includes(brand);
    const updated = exists
      ? filterState.selectedBrands.filter((b) => b !== brand)
      : [...filterState.selectedBrands, brand];
    onFilterChange({ selectedBrands: updated });
  };

  const handleConditionToggle = (cond: string) => {
    const exists = filterState.conditions.includes(cond);
    const updated = exists
      ? filterState.conditions.filter((c) => c !== cond)
      : [...filterState.conditions, cond];
    onFilterChange({ conditions: updated });
  };

  const handleCapacityToggle = (cap: string) => {
    const exists = filterState.capacities.includes(cap);
    const updated = exists
      ? filterState.capacities.filter((c) => c !== cap)
      : [...filterState.capacities, cap];
    onFilterChange({ capacities: updated });
  };

  const handleFormFactorToggle = (ff: string) => {
    const exists = filterState.formFactors.includes(ff);
    const updated = exists
      ? filterState.formFactors.filter((f) => f !== ff)
      : [...filterState.formFactors, ff];
    onFilterChange({ formFactors: updated });
  };

  const activeFilterCount =
    filterState.selectedBrands.length +
    filterState.conditions.length +
    filterState.capacities.length +
    filterState.formFactors.length +
    (filterState.minRating > 0 ? 1 : 0) +
    (filterState.inStockOnly ? 1 : 0) +
    (filterState.minPrice > 0 || filterState.maxPrice < 50000 ? 1 : 0);

  const content = (
    <div className="space-y-6 text-slate-900">
      
      {/* Header & Clear All */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-black text-slate-900 text-base">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
              {activeFilterCount} Active
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear All
          </button>
        )}
      </div>

      {/* 1. Fast Delivery Toggle */}
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
            <Zap className="w-4 h-4 fill-emerald-600 text-emerald-600" />
            <span>2-Hour MIDC Express</span>
          </div>
          <button
            type="button"
            onClick={() => onFilterChange({ inStockOnly: !filterState.inStockOnly })}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              filterState.inStockOnly ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                filterState.inStockOnly ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <p className="text-[11px] text-emerald-800 font-medium leading-snug">
          Filter ready-to-dispatch stock in Ahilyanagar
        </p>
      </div>

      {/* 2. Price Range Slider & Rupee Input Boxes */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
          Price Range (₹)
        </h4>

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <span className="text-[10px] font-semibold text-slate-400 block mb-1">Min Price</span>
            <input
              type="number"
              value={filterState.minPrice}
              onChange={(e) => onFilterChange({ minPrice: Number(e.target.value) || 0 })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-amber-400"
              placeholder="0"
            />
          </div>
          <span className="text-slate-400 font-bold self-end mb-2">-</span>
          <div className="flex-1">
            <span className="text-[10px] font-semibold text-slate-400 block mb-1">Max Price</span>
            <input
              type="number"
              value={filterState.maxPrice}
              onChange={(e) => onFilterChange({ maxPrice: Number(e.target.value) || 50000 })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-amber-400"
              placeholder="50000"
            />
          </div>
        </div>

        {/* Dual Range Slider */}
        <input
          type="range"
          min={0}
          max={50000}
          step={500}
          value={filterState.maxPrice}
          onChange={(e) => onFilterChange({ maxPrice: Number(e.target.value) })}
          className="w-full accent-amber-400 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-bold">
          <span>₹0</span>
          <span>₹25,000</span>
          <span>₹50,000+</span>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* 3. Brand Multi-Select Checkboxes with Item Count */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
          Brands
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-none pr-1">
          {brandsList.map((brand) => {
            const isChecked = filterState.selectedBrands.includes(brand);
            const count = brandCounts[brand] || 0;

            return (
              <label
                key={brand}
                className="flex items-center justify-between text-xs text-slate-700 hover:text-slate-900 cursor-pointer group p-1 rounded hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleBrandToggle(brand)}
                    className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
                  />
                  <span className={`group-hover:font-bold transition ${isChecked ? 'font-bold text-slate-950' : ''}`}>
                    {brand}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* 4. Customer Rating Filter */}
      <div className="space-y-2">
        <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
          Customer Rating
        </h4>
        {[4, 3, 2].map((rating) => {
          const isSelected = filterState.minRating === rating;

          return (
            <button
              key={rating}
              onClick={() => onFilterChange({ minRating: isSelected ? 0 : rating })}
              className={`w-full flex items-center justify-between p-1.5 rounded-lg text-xs transition ${
                isSelected ? 'bg-amber-50 border border-amber-300 font-bold' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                    }`}
                  />
                ))}
                <span className="text-slate-800 font-bold ml-1">{rating}★ & Above</span>
              </div>
              {isSelected && <Check className="w-4 h-4 text-amber-600" />}
            </button>
          );
        })}
      </div>

      <hr className="border-slate-200" />

      {/* 5. Condition Filter */}
      <div className="space-y-2">
        <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
          Item Condition
        </h4>
        {['New', 'Manufacturer Refurbished', 'Certified Pre-Owned'].map((cond) => {
          const isChecked = filterState.conditions.includes(cond);

          return (
            <label
              key={cond}
              className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-1 rounded hover:bg-slate-50 transition"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleConditionToggle(cond)}
                className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
              />
              <span className={isChecked ? 'font-bold text-slate-950' : ''}>{cond}</span>
            </label>
          );
        })}
      </div>

      <hr className="border-slate-200" />

      {/* 6. Technical Specs (Capacity & Form Factor) */}
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
            Storage Capacity
          </h4>
          <div className="grid grid-cols-2 gap-1.5">
            {['256GB', '512GB', '1TB', '2TB'].map((cap) => {
              const isSelected = filterState.capacities.includes(cap);

              return (
                <button
                  key={cap}
                  onClick={() => handleCapacityToggle(cap)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                    isSelected
                      ? 'bg-slate-950 text-amber-400 border-slate-950 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cap}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
            Form Factor
          </h4>
          <div className="grid grid-cols-2 gap-1.5">
            {['M.2', '2.5-inch', 'Desktop', 'Laptop'].map((ff) => {
              const isSelected = filterState.formFactors.includes(ff);

              return (
                <button
                  key={ff}
                  onClick={() => handleFormFactorToggle(ff)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                    isSelected
                      ? 'bg-slate-950 text-amber-400 border-slate-950 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {ff}
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );

  // Return mobile drawer or sticky desktop column
  if (isOpenMobileDrawer) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden lg:hidden animate-in fade-in duration-200">
        <div
          onClick={onCloseMobileDrawer}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        />
        <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
          <div className="w-screen max-w-xs bg-white p-5 shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-base">Filter Catalog</h3>
              <button
                onClick={onCloseMobileDrawer}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside className="hidden lg:block w-64 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm sticky top-24 h-fit">
      {content}
    </aside>
  );
};
