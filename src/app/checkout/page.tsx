'use client';

import React, { useState } from 'react';
import { CheckoutHeader } from '../../components/checkout/CheckoutHeader';
import { AddressStep } from '../../components/checkout/AddressStep';
import { B2bGstStep } from '../../components/checkout/B2bGstStep';
import { PaymentStep } from '../../components/checkout/PaymentStep';
import { CheckoutOrderSummary } from '../../components/checkout/CheckoutOrderSummary';
import { Footer } from '../../components/Footer';

import { useCart } from '../../context/CartContext';
import { Address, B2BProfile, PaymentMethodType } from '../../types';
import { CheckCircle2, ShieldCheck, Zap, Download, ArrowRight, X } from 'lucide-react';

export default function CheckoutPage() {
  const {
    cartItems,
    location,
    setLocation,
    couponCode,
    appliedDiscount,
    couponMessage,
    applyCoupon,
    isGstInvoiceRequired,
    setIsGstInvoiceRequired,
    clearCart,
  } = useCart();

  // Multi-step progress (1: Address, 2: GST, 3: Payment)
  const [currentStep, setCurrentStep] = useState(1);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([
    {
      id: 'addr-1',
      fullName: 'Rahul Deshmukh (Factory Manager)',
      phone: '9876543210',
      pincode: '414111',
      flatPlot: 'Plot C-14, Sector 3',
      areaStreet: 'MIDC Industrial Area, Nagapur',
      city: 'Ahilyanagar',
      state: 'Maharashtra',
      type: 'Factory / MIDC',
      isDefault: true,
    },
    {
      id: 'addr-2',
      fullName: 'PAIS Trading Office',
      phone: '8787828888',
      pincode: '414003',
      flatPlot: 'Office 204, Commercial Complex',
      areaStreet: 'Savedi Road',
      city: 'Ahilyanagar',
      state: 'Maharashtra',
      type: 'Business Office',
    },
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState('addr-1');
  const [deliverySpeed, setDeliverySpeed] = useState<'express' | 'standard'>('express');

  // B2B GST Profile State
  const [b2bProfile, setB2bProfile] = useState<B2BProfile>({
    companyName: 'PAIS Printing & Trading Pvt Ltd',
    gstin: '27AAAAA0000A1Z5',
    tradeName: 'PAIS Corporate',
    stateCode: '27',
    isValidGstin: true,
  });

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('upi');

  // Submission / Success Modal State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];

  const handleAddNewAddress = (newAddr: Address) => {
    setSavedAddresses((prev) => [newAddr, ...prev]);
    setSelectedAddressId(newAddr.id);
    setLocation({
      city: newAddr.city,
      area: newAddr.areaStreet,
      pincode: newAddr.pincode,
      deliveryEstimate: '⚡ 2-Hour Express Delivery',
    });
  };

  const handlePlaceOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const generatedId = `ITS-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      setConfirmedOrderId(generatedId);
      setOrderConfirmed(true);
    }, 2000);
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Step Header */}
      <CheckoutHeader
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 space-y-6">
        
        {/* 65/35 Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN (65% width) - Interactive Form Steps */}
          <div className="lg:col-span-8 space-y-6">
            
            {currentStep === 1 && (
              <AddressStep
                savedAddresses={savedAddresses}
                selectedAddressId={selectedAddressId}
                onSelectAddress={(addr) => {
                  setSelectedAddressId(addr.id);
                  setLocation({
                    city: addr.city,
                    area: addr.areaStreet,
                    pincode: addr.pincode,
                    deliveryEstimate: '⚡ 2-Hour Express Delivery',
                  });
                }}
                onAddNewAddress={handleAddNewAddress}
                deliverySpeed={deliverySpeed}
                setDeliverySpeed={setDeliverySpeed}
                onNext={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 2 && (
              <B2bGstStep
                isGstRequired={isGstInvoiceRequired}
                setIsGstRequired={setIsGstInvoiceRequired}
                b2bProfile={b2bProfile}
                setB2bProfile={setB2bProfile}
                onPrev={() => setCurrentStep(1)}
                onNext={() => setCurrentStep(3)}
              />
            )}

            {(currentStep === 3 || currentStep === 4) && (
              <PaymentStep
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                grandTotal={cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0)}
                onPrev={() => setCurrentStep(2)}
                onNext={handlePlaceOrder}
              />
            )}

          </div>

          {/* RIGHT COLUMN (35% width, Sticky) - Order Summary */}
          <div className="lg:col-span-4">
            <CheckoutOrderSummary
              cartItems={cartItems}
              location={location}
              selectedAddress={selectedAddress}
              b2bProfile={b2bProfile}
              isGstRequired={isGstInvoiceRequired}
              couponCode={couponCode}
              appliedDiscount={appliedDiscount}
              couponMessage={couponMessage}
              onApplyCoupon={applyCoupon}
              deliverySpeed={deliverySpeed}
              onPlaceOrder={handlePlaceOrder}
              isSubmitting={isSubmitting}
            />
          </div>

        </div>

      </div>

      <Footer />

      {/* Order Confirmation Modal */}
      {orderConfirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-center text-slate-900 border border-slate-200">
            
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div>
              <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                ⚡ Express Dispatch Confirmed
              </span>
              <h2 className="text-2xl font-black text-slate-950 mt-2">
                Thank You for Your Order!
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Order ID: <strong className="text-slate-900 font-mono">{confirmedOrderId}</strong>
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500 font-bold">Delivery Address:</span>
                <span className="font-extrabold text-slate-900 text-right">{selectedAddress.areaStreet}, {selectedAddress.pincode}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500 font-bold">Estimated Dispatch:</span>
                <span className="font-extrabold text-emerald-700 text-right">⚡ Today by 6 PM (MIDC Express)</span>
              </div>
              {isGstInvoiceRequired && b2bProfile.isValidGstin && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">GST Tax Invoice:</span>
                  <span className="font-extrabold text-slate-900 text-right">GSTIN {b2bProfile.gstin}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  alert('Downloading Tax Invoice PDF & Order Receipt...');
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl shadow transition flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download GST Invoice
              </button>

              <button
                onClick={() => {
                  clearCart();
                  window.location.href = '/';
                }}
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs py-3 rounded-xl shadow transition flex items-center justify-center gap-1.5"
              >
                <span>Back to Store Home</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
