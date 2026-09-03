'use client';

import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { User, Building2, Save, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ProfileSettingsTabProps {
  user: UserProfile;
}

export const ProfileSettingsTab: React.FC<ProfileSettingsTabProps> = ({ user }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);
  const [companyName, setCompanyName] = useState(user.companyName);
  const [gstin, setGstin] = useState(user.gstin);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h3 className="font-black text-lg text-slate-900 leading-tight flex items-center gap-2">
            <User className="w-5 h-5 text-amber-500" />
            <span>Profile & Business GST Settings</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage client contact information and B2B GST tax profiles
          </p>
        </div>

        <span className="bg-emerald-100 text-emerald-800 font-black text-xs px-3 py-1 rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> B2B Verified Entity
        </span>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        
        {/* Personal Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            1. Personal Contact Details
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
            <div>
              <label className="block text-slate-700 mb-1">Full Contact Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-amber-400 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Mobile Phone (+91)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-amber-400 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-amber-400 font-bold"
                required
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* Business GST Profile */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-700" />
            <span>2. Business Entity & GST Profile</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
            <div>
              <label className="block text-slate-700 mb-1">Registered Firm Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-amber-400 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">15-Character GSTIN</label>
              <input
                type="text"
                maxLength={15}
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono outline-none focus:border-amber-400 font-bold"
                required
              />
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {savedSuccess && (
          <div className="p-3 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Profile and B2B GSTIN settings saved successfully!</span>
          </div>
        )}

        {/* Save CTA */}
        <div className="pt-2">
          <button
            type="submit"
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
};
