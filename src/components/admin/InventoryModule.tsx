'use client';

import React, { useState } from 'react';
import { AdminProduct } from '../../types';
import { MOCK_ADMIN_PRODUCTS } from '../../data/adminData';
import { Package, Plus, Search, AlertTriangle, Check, X, Upload, Edit, Trash2 } from 'lucide-react';

interface InventoryModuleProps {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  showAddModal,
  setShowAddModal,
}) => {
  const [products, setProducts] = useState<AdminProduct[]>(MOCK_ADMIN_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for Add Product
  const [sku, setSku] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('SSD & RAM Upgrades');
  const [hsnCode, setHsnCode] = useState('847170');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [mrp, setMrp] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [gstPercent, setGstPercent] = useState<18 | 12 | 5>(18);
  const [stockCount, setStockCount] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&auto=format&fit=crop&q=80');

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hsnCode.includes(searchQuery)
  );

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !title || !sellingPrice || !stockCount) {
      alert('Please fill in required fields');
      return;
    }

    const newProd: AdminProduct = {
      id: `ap-${Date.now()}`,
      sku,
      title,
      category,
      hsnCode,
      purchaseCost: Number(purchaseCost) || 0,
      mrp: Number(mrp) || Number(sellingPrice) * 1.5,
      sellingPrice: Number(sellingPrice),
      gstPercent,
      stockCount: Number(stockCount),
      lowStockThreshold: Number(lowStockThreshold),
      status: 'Active',
      imageUrl,
    };

    setProducts((prev) => [newProd, ...prev]);
    setShowAddModal(false);
    alert(`Product "${title}" added to store inventory!`);
  };

  const handleStockUpdate = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stockCount: Math.max(0, p.stockCount + delta) } : p
      )
    );
  };

  const toggleStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === 'Active' ? 'Draft' : 'Active' }
          : p
      )
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="font-black text-lg text-slate-900 leading-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" />
            <span>Product & Hardware Inventory Manager</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage hardware stock counts, HSN codes, and GST tax rates for MIDC catalog
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, SKU, HSN..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:border-amber-400"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition shadow flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Product & SKU</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">HSN Code</th>
                <th className="p-3.5 text-right">Selling Price</th>
                <th className="p-3.5 text-center">GST %</th>
                <th className="p-3.5 text-center">Stock Count</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
              {filteredProducts.map((p) => {
                const isLow = p.stockCount <= p.lowStockThreshold;

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} alt={p.title} className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0" />
                        <div>
                          <div className="font-extrabold text-slate-900 line-clamp-1">{p.title}</div>
                          <div className="font-mono text-[10px] text-slate-400 font-bold">SKU: {p.sku}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-bold text-slate-600">{p.category}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-800">{p.hsnCode}</td>
                    <td className="p-3.5 text-right font-black text-slate-950">₹{p.sellingPrice.toLocaleString()}</td>
                    <td className="p-3.5 text-center font-bold">{p.gstPercent}%</td>

                    {/* Stock Modifier */}
                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl font-black">
                        <button onClick={() => handleStockUpdate(p.id, -1)} className="w-5 h-5 bg-white rounded-md text-slate-800 shadow font-bold text-xs hover:bg-slate-200">-</button>
                        <span className={`px-1.5 font-mono ${isLow ? 'text-rose-600 font-black' : 'text-slate-900'}`}>{p.stockCount}</span>
                        <button onClick={() => handleStockUpdate(p.id, 1)} className="w-5 h-5 bg-white rounded-md text-slate-800 shadow font-bold text-xs hover:bg-slate-200">+</button>
                      </div>
                      {isLow && <span className="block text-[9px] font-bold text-rose-600 mt-0.5">LOW STOCK</span>}
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => toggleStatus(p.id)}
                        className={`px-2.5 py-1 rounded-full font-black text-[10px] uppercase ${
                          p.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {p.status}
                      </button>
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1 text-slate-500 hover:text-slate-900" title="Edit Product">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setProducts(prev => prev.filter(item => item.id !== p.id))} className="p-1 text-slate-400 hover:text-rose-600" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-slate-900 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Add New Hardware Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs font-bold">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1">SKU / Barcode *</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="CT1000P3PSSSD8"
                    className="w-full px-3 py-2 border rounded-xl outline-none font-mono focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-amber-400"
                  >
                    <option value="SSD & RAM Upgrades">SSD & RAM Upgrades</option>
                    <option value="CCTV & Surveillance">CCTV & Surveillance</option>
                    <option value="Refurbished Laptops">Refurbished Laptops</option>
                    <option value="Printers & Toners">Printers & Toners</option>
                    <option value="Networking">Networking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Crucial P3 Plus 1TB NVMe SSD"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    placeholder="847170"
                    className="w-full px-3 py-2 border rounded-xl outline-none font-mono focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="5999"
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">GST Tax Rate</label>
                  <select
                    value={gstPercent}
                    onChange={(e) => setGstPercent(Number(e.target.value) as any)}
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-amber-400"
                  >
                    <option value={18}>18% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={5}>5% GST</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1">Initial Stock Count *</label>
                  <input
                    type="number"
                    value={stockCount}
                    onChange={(e) => setStockCount(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Low-Stock Alert Threshold</label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    placeholder="5"
                    className="w-full px-3 py-2 border rounded-xl outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs py-3 rounded-xl shadow transition"
                >
                  Save Product to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
