'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Factory,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Layers,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Business, Item, CreateBomRecipeDTO, CreateBomIngredientDTO } from '../../../../../types/erp';
import { getBusinessProfile, getItems, createBomRecipe } from '../../../../../actions/erp-actions';
import { INITIAL_ERP_BUSINESS, MOCK_ERP_ITEMS } from '../../../../../lib/erp/erp-mock-data';

interface RowIngredient {
  id: string;
  raw_material_item_id: string;
  required_quantity: number;
  waste_percentage: number;
}

export default function NewBomRecipePage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business>(INITIAL_ERP_BUSINESS);
  const [items, setItems] = useState<Item[]>(MOCK_ERP_ITEMS);

  const [recipeName, setRecipeName] = useState('');
  const [outputItemId, setOutputItemId] = useState('');
  const [outputQuantity, setOutputQuantity] = useState(1);
  const [overheadCost, setOverheadCost] = useState(150);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rawMaterials = items.filter((i) => i.item_type === 'RAW_MATERIAL');
  const finishedGoods = items.filter((i) => i.item_type === 'FINISHED_GOOD');

  // Initial Ingredient Row
  const [ingredients, setIngredients] = useState<RowIngredient[]>([
    {
      id: 'ing-1',
      raw_material_item_id: rawMaterials[0]?.id || items[0]?.id || '',
      required_quantity: 1,
      waste_percentage: 2,
    },
  ]);

  useEffect(() => {
    async function load() {
      try {
        const [bData, iData] = await Promise.all([getBusinessProfile(), getItems()]);
        if (bData) setBusiness(bData);
        if (iData && iData.length > 0) {
          setItems(iData);
          const fg = iData.filter((i) => i.item_type === 'FINISHED_GOOD');
          if (fg.length > 0) setOutputItemId(fg[0].id);
        }
      } catch (err) {
        console.warn('Recipe builder fallback state:', err);
      }
    }
    load();
  }, []);

  const handleAddIngredient = () => {
    const defaultRaw = rawMaterials[0] || items[0];
    setIngredients((prev) => [
      ...prev,
      {
        id: `ing-${Date.now()}`,
        raw_material_item_id: defaultRaw?.id || '',
        required_quantity: 1,
        waste_percentage: 0,
      },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length === 1) return;
    setIngredients((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleIngredientChange = (index: number, field: keyof RowIngredient, value: any) => {
    setIngredients((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Real-Time Base Production Cost Calculation
  let rawMaterialsSubtotal = 0;
  ingredients.forEach((ing) => {
    const itm = items.find((i) => i.id === ing.raw_material_item_id);
    const price = itm?.purchase_price || 0;
    const wasteFactor = 1 + (ing.waste_percentage || 0) / 100;
    rawMaterialsSubtotal += ing.required_quantity * price * wasteFactor;
  });

  const totalUnitProductionCost = rawMaterialsSubtotal + overheadCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName.trim()) {
      alert('Please enter a recipe name.');
      return;
    }
    if (!outputItemId) {
      alert('Please select a target finished good.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateBomRecipeDTO = {
        business_id: business.id,
        output_item_id: outputItemId,
        recipe_name: recipeName,
        output_quantity: outputQuantity,
        production_cost_overhead: overheadCost,
        notes: notes || undefined,
        ingredients: ingredients.map((ing) => ({
          raw_material_item_id: ing.raw_material_item_id,
          required_quantity: ing.required_quantity,
          waste_percentage: ing.waste_percentage,
        })),
      };

      const res = await createBomRecipe(payload);
      if (res.success && res.data) {
        alert(`BOM Recipe "${res.data.recipe_name}" created successfully!`);
        router.push('/dashboard/manufacturing');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save BOM Recipe');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto text-slate-100">
      
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
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Factory className="w-6 h-6 text-amber-400" />
            <span>Build New Bill of Materials (BOM) Formula</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Map target manufactured finished goods to component raw materials with scrap allowance
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Header Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
            
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Recipe / Assembly Process Name *
              </label>
              <input
                type="text"
                required
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder="e.g. 50M CCTV Cable Assembly Process or Industrial Core PC"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Output Finished Good *
              </label>
              <select
                value={outputItemId}
                onChange={(e) => setOutputItemId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-amber-400"
              >
                {finishedGoods.map((fg) => (
                  <option key={fg.id} value={fg.id}>
                    {fg.name} ({fg.unit})
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Raw Materials Ingredient Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider">
                Raw Material Components Required Per Finished Unit
              </label>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Add Raw Material</span>
              </button>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-extrabold text-[10px] uppercase">
                    <th className="py-2.5 px-3">Component / Raw Material</th>
                    <th className="py-2.5 px-2 text-right w-32">Req. Qty / Unit</th>
                    <th className="py-2.5 px-2 text-right w-28">Scrap / Waste %</th>
                    <th className="py-2.5 px-3 text-right w-32">Estimated Cost</th>
                    <th className="py-2.5 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {ingredients.map((row, idx) => {
                    const itm = items.find((i) => i.id === row.raw_material_item_id);
                    const cost = (row.required_quantity * (itm?.purchase_price || 0)) * (1 + (row.waste_percentage || 0) / 100);

                    return (
                      <tr key={row.id}>
                        <td className="py-2 px-3">
                          <select
                            value={row.raw_material_item_id}
                            onChange={(e) => handleIngredientChange(idx, 'raw_material_item_id', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white outline-none focus:border-amber-400"
                          >
                            {rawMaterials.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name} (Stock: {r.current_stock} {r.unit} • ₹{r.purchase_price}/{r.unit})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            min="0.001"
                            step="any"
                            value={row.required_quantity}
                            onChange={(e) => handleIngredientChange(idx, 'required_quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-right font-mono text-xs font-bold text-white outline-none focus:border-amber-400"
                          />
                        </td>
                        <td className="py-2 px-2 text-right">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="any"
                            value={row.waste_percentage}
                            onChange={(e) => handleIngredientChange(idx, 'waste_percentage', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-right font-mono text-xs text-amber-400 outline-none focus:border-amber-400"
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-white">
                          ₹{cost.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(idx)}
                            disabled={ingredients.length === 1}
                            className="text-slate-500 hover:text-rose-400 disabled:opacity-30 transition p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overheads & Real-Time Cost Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
            
            <div className="sm:col-span-6 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Direct Labor / Electricity Overhead Cost (₹ / Unit)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={overheadCost}
                  onChange={(e) => setOverheadCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs font-bold text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Recipe Instructions / Quality Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Test with fluke tester before packing."
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="sm:col-span-6 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs">
              <div className="font-sans text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Production Cost Breakdown (Per Unit)
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Raw Materials Cost:</span>
                <span>₹{rawMaterialsSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Assembly & Overhead Cost:</span>
                <span>₹{overheadCost.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-black text-sm text-white">
                <span>ESTIMATED UNIT BASE COST:</span>
                <span className="text-emerald-400 text-base">₹{totalUnitProductionCost.toFixed(2)}</span>
              </div>
            </div>

          </div>

          {/* Form Actions */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <Link
              href="/dashboard/manufacturing"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-bold text-xs"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 rounded-xl font-black text-xs shadow-lg transition flex items-center gap-2"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Saving Recipe...' : 'Save BOM Recipe'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
