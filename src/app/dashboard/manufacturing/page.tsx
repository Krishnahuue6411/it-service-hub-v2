'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Factory,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Package,
  Layers,
  ArrowRight,
  Settings,
  ShieldCheck,
  ChevronRight,
  History,
} from 'lucide-react';
import { Business, BomRecipe, Item } from '../../../types/erp';
import { getBusinessProfile, getBomRecipes, getItems } from '../../../actions/erp-actions';
import {
  INITIAL_ERP_BUSINESS,
  MOCK_ERP_BOM_RECIPES,
  MOCK_ERP_ITEMS,
} from '../../../lib/erp/erp-mock-data';

export default function ManufacturingOverviewPage() {
  const [business, setBusiness] = useState<Business>(INITIAL_ERP_BUSINESS);
  const [recipes, setRecipes] = useState<BomRecipe[]>(MOCK_ERP_BOM_RECIPES);
  const [items, setItems] = useState<Item[]>(MOCK_ERP_ITEMS);

  useEffect(() => {
    async function loadData() {
      try {
        const [bData, rData, iData] = await Promise.all([
          getBusinessProfile(),
          getBomRecipes(),
          getItems(),
        ]);
        if (bData) setBusiness(bData);
        if (rData && rData.length > 0) setRecipes(rData);
        if (iData && iData.length > 0) setItems(iData);
      } catch (err) {
        console.warn('Manufacturing page fallback state:', err);
      }
    }
    loadData();
  }, []);

  // Compute estimated cost for recipe
  const computeRecipeCost = (recipe: BomRecipe) => {
    let rawMaterialsCost = 0;
    recipe.ingredients.forEach((ing) => {
      const itm = items.find((i) => i.id === ing.raw_material_item_id);
      const price = itm?.purchase_price || 0;
      const wasteFactor = 1 + (ing.waste_percentage || 0) / 100;
      rawMaterialsCost += ing.required_quantity * price * wasteFactor;
    });
    return rawMaterialsCost + recipe.production_cost_overhead;
  };

  // If BOM is disabled in tenant settings
  if (!business.settings.enable_bom) {
    return (
      <div className="p-6 sm:p-12 max-w-4xl mx-auto text-slate-100 space-y-6 text-center">
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-amber-400/10 text-amber-400 rounded-3xl flex items-center justify-center mx-auto">
            <Factory className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white">
            Manufacturing & Bill of Materials (BOM) Disabled
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            The Manufacturing module is currently switched off for your business. You can enable multi-level production recipes, raw material consumption tracking, and automated stock conversion in Settings.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/settings/business"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-6 py-3 rounded-2xl shadow-xl transition"
            >
              <Settings className="w-4 h-4" />
              <span>Enable Manufacturing in Settings</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Production & Assembly
            </span>
            <span className="text-xs text-slate-400 font-mono">
              BOM Engine Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Factory className="w-6 h-6 text-amber-400" />
            <span>Manufacturing & Bill of Materials (BOM)</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Define multi-ingredient manufacturing formulas and execute atomic production runs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/manufacturing/recipes/new"
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-3 rounded-2xl border border-slate-700 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Build New Recipe</span>
          </Link>

          <Link
            href="/dashboard/manufacturing/runs/new"
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-xl transition flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Run Production Batch</span>
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase">Configured Recipes</div>
          <div className="text-2xl font-black text-white">{recipes.length}</div>
          <div className="text-[11px] text-slate-400">Active production formulations</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-1">
          <div className="text-xs font-bold text-emerald-400 uppercase">Finished Goods Linked</div>
          <div className="text-2xl font-black text-white">
            {items.filter((i) => i.item_type === 'FINISHED_GOOD').length}
          </div>
          <div className="text-[11px] text-slate-400">Manufactured stock items</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-1">
          <div className="text-xs font-bold text-blue-400 uppercase">Available Raw Materials</div>
          <div className="text-2xl font-black text-white">
            {items.filter((i) => i.item_type === 'RAW_MATERIAL').length}
          </div>
          <div className="text-[11px] text-slate-400">Component items tracked in inventory</div>
        </div>
      </div>

      {/* Recipes Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Production Recipes & Bill of Materials</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {recipes.length} formula{recipes.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map((recipe) => {
            const outItem = items.find((i) => i.id === recipe.output_item_id) || recipe.output_item;
            const unitCost = computeRecipeCost(recipe);

            return (
              <div
                key={recipe.id}
                className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-4 hover:border-slate-700 transition flex flex-col justify-between shadow-xl"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        BOM Formula
                      </span>
                      <h3 className="font-extrabold text-base text-white mt-1">
                        {recipe.recipe_name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Estimated Unit Cost</div>
                      <div className="font-mono font-black text-base text-emerald-400">
                        ₹{unitCost.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>Target Output:</span>
                    <strong className="text-slate-200">
                      {outItem?.name || 'Finished Good'} ({recipe.output_quantity} {outItem?.unit || 'Units'})
                    </strong>
                  </div>

                  {recipe.notes && (
                    <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                      {recipe.notes}
                    </p>
                  )}

                  {/* Ingredients Breakdown */}
                  <div className="space-y-1 pt-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Ingredients & Consumption Ratios:
                    </div>
                    <div className="space-y-1">
                      {recipe.ingredients.map((ing, idx) => {
                        const raw = items.find((i) => i.id === ing.raw_material_item_id) || ing.raw_material_item;
                        return (
                          <div
                            key={idx}
                            className="flex justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800/60"
                          >
                            <span className="text-slate-300 font-medium">
                              {raw?.name || 'Component item'}
                            </span>
                            <span className="font-mono font-bold text-amber-400">
                              {ing.required_quantity} {raw?.unit || 'units'}
                              {ing.waste_percentage ? ` (+${ing.waste_percentage}% scrap)` : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Card Action Bar */}
                <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Overhead: ₹{recipe.production_cost_overhead}/unit
                  </span>

                  <Link
                    href={`/dashboard/manufacturing/runs/new?recipeId=${recipe.id}`}
                    className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Production</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
