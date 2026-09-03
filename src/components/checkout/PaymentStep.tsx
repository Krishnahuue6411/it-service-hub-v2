'use client';

import React, { useState } from 'react';
import { PaymentMethodType } from '../../types';
import { 
  QrCode, 
  CreditCard, 
  Landmark, 
  Banknote, 
  Building2, 
  Lock, 
  CheckCircle2, 
  ShieldCheck, 
  Phone,
  Zap
} from 'lucide-react';

interface PaymentStepProps {
  paymentMethod: PaymentMethodType;
  setPaymentMethod: (m: PaymentMethodType) => void;
  grandTotal: number;
  onPrev: () => void;
  onNext: () => void;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  paymentMethod,
  setPaymentMethod,
  grandTotal,
  onPrev,
  onNext,
}) => {
  const [upiId, setUpiId] = useState('user@upi');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const paymentTabs = [
    { type: 'upi' as PaymentMethodType, label: 'Instant UPI (Blinkit QR)', icon: QrCode, badge: '⚡ 1-Click Fast' },
    { type: 'card' as PaymentMethodType, label: 'Credit / Debit Card', icon: CreditCard, badge: 'RuPay/Visa/MC' },
    { type: 'netbanking' as PaymentMethodType, label: 'Net Banking', icon: Landmark, badge: 'All Banks' },
    { type: 'cod' as PaymentMethodType, label: 'Pay on Delivery / COD', icon: Banknote, badge: 'Onsite OTP' },
    { type: 'b2b-credit' as PaymentMethodType, label: '30-Day B2B PO Credit', icon: Building2, badge: 'Approved MIDC' },
  ];

  const handleVerifyUpi = () => {
    if (upiId.includes('@')) {
      setIsUpiVerified(true);
    } else {
      alert('Please enter a valid UPI ID (e.g. name@upi)');
    }
  };

  const handleSendOtp = () => {
    setOtpSent(true);
    alert('OTP sent to your registered mobile number: 414111');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h3 className="font-black text-lg text-slate-900 leading-tight flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
              3
            </span>
            <span>Select Payment Method</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Pay ₹{grandTotal.toLocaleString()} safely with 256-Bit SSL encryption
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <Lock className="w-3.5 h-3.5" />
          <span>Razorpay Verified</span>
        </div>
      </div>

      {/* Payment Method Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {paymentTabs.map((tab) => {
          const IconComp = tab.icon;
          const isSelected = paymentMethod === tab.type;

          return (
            <button
              key={tab.type}
              onClick={() => setPaymentMethod(tab.type)}
              className={`p-3 rounded-xl border-2 text-left transition flex items-center justify-between group ${
                isSelected
                  ? 'border-amber-400 bg-amber-50/50 ring-2 ring-amber-400/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-slate-950 text-amber-400' : 'bg-slate-100 text-slate-700'}`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div>
                  <div className={`font-extrabold text-xs ${isSelected ? 'text-slate-950' : 'text-slate-800'}`}>
                    {tab.label.split('(')[0]}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold">{tab.badge}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* TAB A: Instant UPI (Blinkit Style Dynamic QR) */}
      {paymentMethod === 'upi' && (
        <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-4 animate-in fade-in duration-200 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-amber-400" />
              <h4 className="font-extrabold text-sm text-white">Instant UPI & Dynamic QR Code</h4>
            </div>
            <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded">
              ⚡ 0% Gateway Fee
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* Dynamic QR Code Box */}
            <div className="bg-white p-4 rounded-2xl text-slate-900 text-center space-y-2 border border-slate-200">
              <div className="w-36 h-36 bg-slate-950 p-2 rounded-xl mx-auto flex items-center justify-center relative shadow-inner">
                {/* SVG Mock QR Code */}
                <svg viewBox="0 0 100 100" className="w-full h-full fill-amber-400">
                  <rect x="10" y="10" width="25" height="25" fill="#f59e0b" />
                  <rect x="65" y="10" width="25" height="25" fill="#f59e0b" />
                  <rect x="10" y="65" width="25" height="25" fill="#f59e0b" />
                  <rect x="40" y="40" width="20" height="20" fill="#ffffff" />
                  <circle cx="50" cy="50" r="6" fill="#0f172a" />
                </svg>
              </div>
              <div className="text-xs font-black text-slate-900">
                Scan to Pay ₹{grandTotal.toLocaleString()}
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500">
                <span>PhonePe</span> • <span>GPay</span> • <span>Paytm</span> • <span>BHIM</span>
              </div>
            </div>

            {/* VPA UPI Input */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Or Enter Your Virtual Payment Address (VPA / UPI ID)
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@paytm or admin@okhdfc"
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleVerifyUpi}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-xl transition"
                >
                  Verify
                </button>
              </div>

              {isUpiVerified && (
                <div className="text-xs font-bold text-emerald-400 bg-emerald-500/20 p-2 rounded-xl flex items-center gap-1 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" /> UPI VPA Verified! Click "Place Order & Pay" below.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB B: Credit / Debit Card */}
      {paymentMethod === 'card' && (
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
          <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
            Enter Card Information
          </h4>

          <div className="space-y-2 text-xs font-bold">
            <div>
              <label className="block text-slate-700 mb-1">Cardholder Name</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Name as printed on card"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Card Number</label>
              <input
                type="text"
                maxLength={19}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                placeholder="4532 •••• •••• 8912"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 mb-1">Expiry Date (MM/YY)</label>
                <input
                  type="text"
                  maxLength={5}
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="08/28"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Security Code (CVV)</label>
                <input
                  type="password"
                  maxLength={4}
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                  placeholder="•••"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB C: Net Banking */}
      {paymentMethod === 'netbanking' && (
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
          <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
            Select Your Bank
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Bank of Maharashtra'].map((bank) => (
              <button
                key={bank}
                onClick={() => setSelectedBank(bank)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                  selectedBank === bank
                    ? 'bg-slate-950 text-amber-400 border-slate-950 shadow'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                }`}
              >
                {bank}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB D: COD / Pay on Delivery */}
      {paymentMethod === 'cod' && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-amber-600" />
            <h4 className="font-extrabold text-sm text-slate-900">Cash on Delivery / On-Site Payment</h4>
          </div>
          <p className="text-xs text-slate-700 font-medium">
            Pay ₹{grandTotal.toLocaleString()} in cash or via UPI to our field delivery agent upon hardware arrival at your Ahilyanagar location.
          </p>

          {!otpSent ? (
            <button
              onClick={handleSendOtp}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" /> Send Mobile Phone OTP Verification
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={4}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="4-digit OTP"
                className="w-32 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none"
              />
              <button
                type="button"
                onClick={() => alert('Mobile OTP verified successfully!')}
                className="bg-emerald-600 text-white font-bold text-xs px-3 py-2 rounded-xl shadow"
              >
                Verify OTP
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB E: 30-Day B2B Credit */}
      {paymentMethod === 'b2b-credit' && (
        <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-2 border border-slate-800 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h4 className="font-extrabold text-sm text-white">30-Day Corporate Purchase Order Credit</h4>
          </div>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Reserved for verified MIDC Ahilyanagar manufacturing clients with signed Annual AMC Contracts. Invoice payable within 30 days of hardware delivery.
          </p>
        </div>
      )}

      {/* Step Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onPrev}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
        >
          ← Back to GST Details
        </button>

        <button
          onClick={onNext}
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5"
        >
          <span>Review Order & Finalize →</span>
        </button>
      </div>

    </div>
  );
};
