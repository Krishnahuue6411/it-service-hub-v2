'use client';

import React, { useState } from 'react';
import { Address } from '../../types';
import { MapPin, Plus, Check, Zap, Truck, Building2, Home, X } from 'lucide-react';

interface AddressStepProps {
  savedAddresses: Address[];
  selectedAddressId: string;
  onSelectAddress: (addr: Address) => void;
  onAddNewAddress: (newAddr: Address) => void;
  deliverySpeed: 'express' | 'standard';
  setDeliverySpeed: (speed: 'express' | 'standard') => void;
  onNext: () => void;
}

export const AddressStep: React.FC<AddressStepProps> = ({
  savedAddresses,
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
  deliverySpeed,
  setDeliverySpeed,
  onNext,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for New Address
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('414111');
  const [flatPlot, setFlatPlot] = useState('');
  const [areaStreet, setAreaStreet] = useState('');
  const [type, setType] = useState<'Factory / MIDC' | 'Business Office' | 'Home'>('Factory / MIDC');

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !flatPlot || !areaStreet) {
      alert('Please fill out all address fields');
      return;
    }
    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      fullName,
      phone,
      pincode,
      flatPlot,
      areaStreet,
      city: 'Ahilyanagar',
      state: 'Maharashtra',
      type,
    };
    onAddNewAddress(newAddr);
    setShowAddModal(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Step Title */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h3 className="font-black text-lg text-slate-900 leading-tight flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
              1
            </span>
            <span>Delivery Address & Dispatch Speed</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Select your factory or office location in Ahilyanagar
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4 text-amber-400 stroke-[3]" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Saved Address Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {savedAddresses.map((addr) => {
          const isSelected = selectedAddressId === addr.id;

          return (
            <div
              key={addr.id}
              onClick={() => onSelectAddress(addr)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-400 bg-amber-50/40 ring-2 ring-amber-400/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="bg-slate-900 text-amber-400 font-black text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                    {addr.type === 'Factory / MIDC' && <Building2 className="w-3 h-3 text-amber-400" />}
                    {addr.type === 'Home' && <Home className="w-3 h-3 text-amber-400" />}
                    {addr.type}
                  </span>

                  {addr.isDefault && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>

                <h4 className="font-extrabold text-sm text-slate-900">{addr.fullName}</h4>
                <p className="text-xs text-slate-600 font-medium mt-1 leading-snug">
                  {addr.flatPlot}, {addr.areaStreet}
                </p>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  📞 Phone: <strong>+91 {addr.phone}</strong>
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <input
                    type="radio"
                    name="address-radio"
                    checked={isSelected}
                    onChange={() => onSelectAddress(addr)}
                    className="accent-amber-500"
                  />
                  <span>Deliver Here</span>
                </span>
                {isSelected && <Check className="w-4 h-4 text-amber-600 stroke-[3]" />}
              </div>
            </div>
          );
        })}
      </div>

      <hr className="border-slate-200" />

      {/* Delivery Speed Selector */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
          Choose Delivery Speed
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => setDeliverySpeed('express')}
            className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
              deliverySpeed === 'express'
                ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                <span>Express MIDC 2-Hour Dispatch</span>
                <span className="bg-emerald-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded">FREE</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Direct dispatch from Ahilyanagar MIDC warehouse. Delivered today by 6 PM.
              </p>
            </div>
          </div>

          <div
            onClick={() => setDeliverySpeed('standard')}
            className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
              deliverySpeed === 'standard'
                ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-xs text-slate-900">
                Standard Courier Delivery (1-2 Days)
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Shipped via Bluedart / DTDC insured courier network.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step Next Action Button */}
      <div className="pt-2">
        <button
          onClick={onNext}
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5 ml-auto"
        >
          <span>Continue to B2B GST Details →</span>
        </button>
      </div>

      {/* Add New Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-900 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Add New Shipping Address</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAddress} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Full Contact Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Patil (Factory Manager)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1">10-Digit Mobile Phone</label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="414111"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Flat / Plot / Gala No.</label>
                <input
                  type="text"
                  value={flatPlot}
                  onChange={(e) => setFlatPlot(e.target.value)}
                  placeholder="Plot C-14, Gala No. 3"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Industrial Area / Street / Landmark</label>
                <input
                  type="text"
                  value={areaStreet}
                  onChange={(e) => setAreaStreet(e.target.value)}
                  placeholder="MIDC Nagapur Sector 3, Near Water Tank"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Address Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Factory / MIDC', 'Business Office', 'Home'] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setType(t)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition ${
                        type === t
                          ? 'bg-slate-950 text-amber-400 border-slate-950'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs py-3 rounded-xl shadow transition"
                >
                  Save & Select Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
