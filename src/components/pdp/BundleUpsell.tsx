'use client';

import React, { useState } from 'react';
import { BundleItem } from '../../types';
import { Plus, Check, ShoppingCart, Sparkles } from 'lucide-react';

interface BundleUpsellProps {
  initialItems: BundleItem[];
  onAddBundleToCart: (items: BundleItem[]) => void;
}

export const BundleUpsell: React.FC<BundleUpsellProps> = ({
  initialItems,
  onAddBundleToCart,
}) => {
  const [items, setItems] = useState<BundleItem[]>(initialItems);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isSelected: !item.isSelected } : item))
    );
  };

  const selectedItems = items.filter((i) => i.isSelected);
  const bundleTotalPrice = selectedItems.reduce((acc, i) => acc + i.price, 0);
  const bundleTotalMrp = selectedItems.reduce((acc, i) => acc + i.mrp, 0);
  const bundleSavings = bundleTotalMrp - bundleTotalPrice;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
            Frequently Bought Together (Save 15% Extra)
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Combine thermal heatsink cooling & high-speed USB enclosure for maximum SSD performance
          </p>
        </div>
      </div>

      {/* Visual Product Thumbnails Strip */}
      <div className="flex flex-col md:flex-row items-center gap-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 md:pb-0">
          {items.map((item, idx) => (
            <React.Fragment key={item.id}>
              {idx > 0 && <Plus className="w-5 h-5 text-slate-400 shrink-0" />}
              <div
                onClick={() => toggleItem(item.id)}
                className={`w-28 h-28 rounded-2xl border-2 p-2 bg-slate-50 relative cursor-pointer transition shrink-0 ${
                  item.isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-md'
                    : 'border-slate-200 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={item.imageUrl} alt={item.name} className="w-full h-20 object-contain rounded-lg" />
                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center text-[10px]">
                  {item.isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Price & Add All Trigger */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl md:ml-auto space-y-2 text-center md:text-left shrink-0 w-full md:w-64">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Total Bundle Price ({selectedItems.length} items):
          </div>
          <div className="flex items-baseline justify-center md:justify-start gap-2">
            <span className="text-2xl font-black text-amber-400">
              ₹{bundleTotalPrice.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 line-through">
              ₹{bundleTotalMrp.toLocaleString()}
            </span>
          </div>
          <div className="text-[11px] text-emerald-400 font-bold">
            Save ₹{bundleSavings.toLocaleString()} on combo purchase
          </div>

          <button
            onClick={() => onAddBundleToCart(selectedItems)}
            disabled={selectedItems.length === 0}
            className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs py-2.5 px-3 rounded-xl transition shadow active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add Selected ({selectedItems.length}) to Cart</span>
          </button>
        </div>
      </div>

      {/* Checkbox List */}
      <div className="space-y-2 border-t border-slate-100 pt-3">
        {items.map((item) => (
          <label key={item.id} className="flex items-center gap-2.5 text-xs font-medium text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={item.isSelected}
              onChange={() => toggleItem(item.id)}
              className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
            />
            <span className={item.isSelected ? 'font-bold text-slate-950' : 'text-slate-600'}>
              {item.name}
            </span>
            <span className="font-extrabold text-slate-950 ml-auto">₹{item.price.toLocaleString()}</span>
          </label>
        ))}
      </div>

    </div>
  );
};
