'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Factory,
  Play,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Package,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Business, BomRecipe, Item, ExecuteProductionRunDTO } from '../../../../../types/erp';
import {
  getBusinessProfile,
  getBomRecipes,
  getItems,
  executeProductionRun,
} from '../../../../../actions/erp-actions';
import {
  INITIAL_ERP_BUSINESS,
  MOCK_ERP_BOM_RECIPES,
  MOCK_ERP_ITEMS,
} from '../../../../../lib/erp/erp-mock-data';

export default function NewProductionRunPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedRecipeId = searchParams.get('recipeId');

  const [business, setBusiness] = useState<Business>(INITIAL_ERP_BUSINESS);
  const [recipes, setRecipes] = useState<BomRecipe[]>(MOCK_ERP_BOM_RECIPES);
  const [items, setItems] = useState<Item[]>(MOCK_ERP_ITEMS);

  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(
    preSelectedRecipeId || MOCK_ERP_BOM_RECIPES[0]?.id || ''
  );
  const [quantityToProduce, setQuantityToProduce] = useState<number>(10);
  const [isExecuting, setIsExecuting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [bData, rData, iData] = await Promise.all([
          getBusinessProfile(),
          getBomRecipes(),
          getItems(),
        ]);
        if (bData) setBusiness(bData);
        if (rData && rData.length > 0) {
          setRecipes(rData);
          if (preSelectedRecipeId && rData.find((r) => r.id === preSelectedRecipeId)) {
            setSelectedRecipeId(preSelectedRecipeId);
          } else {
            setSelectedRecipeId(rData[0].id);
          }
        }
        if (iData && iData.length > 0) setItems(iData);
      } catch (err) {
        console.warn('Production run fallback state:', err);
      }
    }
    load();
  }, [preSelectedRecipeId]);

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId) || recipes[0];
  const outputItem = items.find((i) => i.id === selectedRecipe?.output_item_id);

  // Check Raw Material Availability & Shortages
  const availabilityAnalysis = (selectedRecipe?.ingredients || []).map((ing) => {
    const raw = items.find((i) => i.id === ing.raw_material_item_id) || ing.raw_material_item;
    const requiredTotal = ing.required_quantity * quantityToProduce * (1 + (ing.waste_percentage || 0) / 100);
    const availableStock = raw?.current_stock || 0;
    const isSufficient = availableStock >= requiredTotal;
    const shortage = isSufficient ? 0 : requiredTotal - availableStock;

    return {
      rawItem: raw,
      requiredTotal: Number(requiredTotal.toFixed(3)),
      availableStock,
      isSufficient,
      shortage: Number(shortage.toFixed(3)),
      unit: raw?.unit || 'Units',
    };
  });

  const hasAnyShortage = availabilityAnalysis.some((a) => !a.isSufficient);

  // Execute Production Run
  const handleExecuteRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasAnyShortage) {
      alert('Cannot execute production run. Raw material stock is insufficient!');
      return;
    }

    setIsExecuting(true);
    setSuccessMessage(null);

    try {
      const payload: ExecuteProductionRunDTO = {
        business_id: business.id,
        recipe_id: selectedRecipe.id,
        quantity: quantityToProduce,
      };

      const res = await executeProductionRun(payload);

      if (res.success) {
        setSuccessMessage(res.message);
        // Refresh items state
        const updatedItems = await getItems();
        if (updatedItems) setItems(updatedItems);
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(err.message || 'Production Run Execution Failed');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto text-slate-100">
      
      {/* Back Link */}
      <Link
        href="/dashboard/manufacturing"
        className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Manufacturing & BOM</span>
      </Link>

      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-6">
        
        <div className="border-b border-slate-800 pb-4">
          <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Atomic Inventory Conversion
          </span>
          <h1 className="text-2xl font-black text-white flex items-center gap-2 mt-2">
            <Play className="w-6 h-6 text-amber-400 fill-current" />
            <span>Execute Production Batch Run</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Deducts raw material components from stock and increments finished goods in a single transaction
          </p>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="font-bold">{successMessage}</div>
            </div>
            <Link
              href="/dashboard/items"
              className="px-3 py-1.5 bg-emerald-400 text-slate-950 rounded-xl font-black text-[10px] shrink-0"
            >
              View Stock Levels &rarr;
            </Link>
          </div>
        )}

        <form onSubmit={handleExecuteRun} className="space-y-6">
          
          {/* Recipe & Batch Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
            
            <div className="sm:col-span-8 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select BOM Recipe *
              </label>
              <select
                value={selectedRecipeId}
                onChange={(e) => setSelectedRecipeId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-amber-400"
              >
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.recipe_name} (Output: {r.output_quantity} unit)
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Batch Quantity to Produce *
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={quantityToProduce}
                onChange={(e) => setQuantityToProduce(parseFloat(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-sm font-black text-amber-400 outline-none focus:border-amber-400"
              />
            </div>

          </div>

          {/* Finished Good Output Preview Strip */}
          {selectedRecipe && (
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Output Finished Good:</div>
                <div className="font-black text-sm text-white">{outputItem?.name}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-medium">Current Stock &rarr; After Batch:</div>
                <div className="font-mono font-bold text-xs text-slate-300">
                  {outputItem?.current_stock || 0} {outputItem?.unit} &rarr;{' '}
                  <strong className="text-emerald-400 font-black">
                    {((outputItem?.current_stock || 0) + (quantityToProduce * selectedRecipe.output_quantity)).toFixed(2)} {outputItem?.unit}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Raw Material Stock Availability Checker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Raw Material Stock Availability Checker</span>
              </label>

              {hasAnyShortage ? (
                <span className="text-[10px] font-black text-rose-400 bg-rose-950/60 border border-rose-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Stock Shortage Detected</span>
                </span>
              ) : (
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>All Components In Stock</span>
                </span>
              )}
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-extrabold text-[10px] uppercase">
                    <th className="py-2.5 px-3">Raw Material Component</th>
                    <th className="py-2.5 px-3 text-right">Required for Batch</th>
                    <th className="py-2.5 px-3 text-right">In Stock Available</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {availabilityAnalysis.map((item, idx) => (
                    <tr key={idx} className={item.isSufficient ? '' : 'bg-rose-950/20'}>
                      <td className="py-2.5 px-3 font-bold text-white">
                        {item.rawItem?.name || 'Raw Component'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-300">
                        {item.requiredTotal} {item.unit}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-mono font-bold ${item.isSufficient ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.availableStock} {item.unit}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {item.isSufficient ? (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Sufficient
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-400 flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Deficit: -{item.shortage} {item.unit}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-800">
            <Link
              href="/dashboard/manufacturing"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-bold text-xs"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isExecuting || hasAnyShortage}
              className="px-7 py-3 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-slate-950 rounded-2xl font-black text-xs shadow-xl transition flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {isExecuting
                  ? 'Converting Inventory...'
                  : hasAnyShortage
                  ? 'Cannot Run (Raw Material Deficit)'
                  : `Execute Batch (${quantityToProduce} Units)`}
              </span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
