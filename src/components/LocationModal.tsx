'use client';

import React, { useState } from 'react';
import { MapPin, X, Check, Zap } from 'lucide-react';
import { LocationInfo } from '../types';
import { POPULAR_PINCODES } from '../data/mockData';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationInfo;
  onSelectLocation: (loc: LocationInfo) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const [customPincode, setCustomPincode] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPincode.trim().length === 6) {
      onSelectLocation({
        city: 'Ahilyanagar Region',
        area: `Pincode Area ${customPincode}`,
        pincode: customPincode,
        deliveryEstimate: '⚡ 2-Hour Express Delivery'
      });
      onClose();
    } else {
      alert('Please enter a valid 6-digit Indian Pincode');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
      />

      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
              Select Delivery Pincode
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              We deliver IT hardware & CCTV parts in 45-120 mins across Ahilyanagar
            </p>
          </div>
        </div>

        {/* Custom Pincode Input Form */}
        <form onSubmit={handleCustomSubmit} className="mb-6">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Enter Your 6-Digit Pincode
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={customPincode}
              onChange={(e) => setCustomPincode(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 414111 or 414003"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
            <button
              type="submit"
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition shadow"
            >
              Check
            </button>
          </div>
        </form>

        <hr className="my-4 border-slate-100" />

        {/* Popular Locations Quick Select */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Popular Delivery Sectors
          </h4>

          {POPULAR_PINCODES.map((loc, idx) => {
            const isSelected = loc.pincode === currentLocation.pincode;

            return (
              <button
                key={idx}
                onClick={() => {
                  onSelectLocation(loc);
                  onClose();
                }}
                className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between group ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-amber-400 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>{loc.area}</span>
                    <span className="text-slate-400 text-[11px] font-normal">({loc.pincode})</span>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                    <Zap className="w-3 h-3 fill-emerald-600" />
                    <span>{loc.deliveryEstimate}</span>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-300 group-hover:border-amber-400" />
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
