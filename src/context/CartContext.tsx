'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, LocationInfo } from '../types';
import { INITIAL_LOCATION, PRODUCTS_DATABASE } from '../data/mockData';
import { PREDEFINED_COUPONS } from '../data/cartData';

interface CartContextType {
  cartItems: CartItem[];
  savedForLaterItems: CartItem[];
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  location: LocationInfo;
  setLocation: (loc: LocationInfo) => void;
  couponCode: string;
  appliedDiscount: number;
  couponMessage: string | null;
  isGstInvoiceRequired: boolean;
  setIsGstInvoiceRequired: (req: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Actions
  addToCart: (product: Product, quantity?: number, variantId?: string, capacityLabel?: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  toggleItemSelect: (productId: string) => void;
  toggleSelectAll: () => void;
  saveForLater: (productId: string) => void;
  moveToCartFromSaved: (productId: string) => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  clearCart: () => void;

  // Deletion Modal State
  itemToDelete: string | null;
  setItemToDelete: (id: string | null) => void;
  confirmDelete: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pre-populate cart with 2-3 realistic IT items for immediate testing
  const [cartItems, setCartItems] = useState<CartItem[]>(() => [
    {
      product: PRODUCTS_DATABASE[0], // Crucial P3 1TB NVMe SSD
      quantity: 1,
      variantId: 'var-1tb',
      capacityLabel: '1TB NVMe / 3-Year Warranty',
      isSelected: true,
    },
    {
      product: PRODUCTS_DATABASE[2], // Kingston FURY 16GB RAM
      quantity: 2,
      variantId: 'var-16gb',
      capacityLabel: '16GB DDR4 3200MHz',
      isSelected: true,
    },
    {
      product: PRODUCTS_DATABASE[3], // CP Plus Outdoor CCTV
      quantity: 1,
      variantId: 'var-cctv',
      capacityLabel: 'Full HD 1080P Metal',
      isSelected: true,
    },
  ]);

  const [savedForLaterItems, setSavedForLaterItems] = useState<CartItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [location, setLocation] = useState<LocationInfo>(INITIAL_LOCATION);
  const [couponCode, setCouponCode] = useState('MIDC500');
  const [appliedDiscount, setAppliedDiscount] = useState(500);
  const [couponMessage, setCouponMessage] = useState<string | null>('Coupon MIDC500 Applied! Saved ₹500');
  const [isGstInvoiceRequired, setIsGstInvoiceRequired] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addToCart = (product: Product, quantity = 1, variantId?: string, capacityLabel?: string) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id && i.variantId === variantId);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          product,
          quantity,
          variantId,
          capacityLabel: capacityLabel || product.specBullet,
          isSelected: true,
        },
      ];
    });
    showToast(`Added "${product.name.slice(0, 20)}..." to cart ⚡`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) => {
      const found = prev.find((i) => i.product.id === productId);
      if (found && found.quantity + delta <= 0) {
        setItemToDelete(productId);
        return prev;
      }
      return prev.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
    showToast('Item removed from cart');
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      removeFromCart(itemToDelete);
      setItemToDelete(null);
    }
  };

  const toggleItemSelect = (productId: string) => {
    setCartItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, isSelected: !i.isSelected } : i))
    );
  };

  const toggleSelectAll = () => {
    const allSelected = cartItems.every((i) => i.isSelected);
    setCartItems((prev) => prev.map((i) => ({ ...i, isSelected: !allSelected })));
  };

  const saveForLater = (productId: string) => {
    const found = cartItems.find((i) => i.product.id === productId);
    if (found) {
      setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
      setSavedForLaterItems((prev) => [...prev, found]);
      showToast('Moved item to Saved for Later');
    }
  };

  const moveToCartFromSaved = (productId: string) => {
    const found = savedForLaterItems.find((i) => i.product.id === productId);
    if (found) {
      setSavedForLaterItems((prev) => prev.filter((i) => i.product.id !== productId));
      setCartItems((prev) => [...prev, { ...found, isSelected: true }]);
      showToast('Moved item back to cart ⚡');
    }
  };

  const applyCoupon = (code: string) => {
    const formatted = code.trim().toUpperCase();
    const subtotal = cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);

    const found = PREDEFINED_COUPONS.find((c) => c.code === formatted);
    if (found) {
      if (subtotal < found.minOrderValue) {
        setCouponMessage(`Add ₹${found.minOrderValue - subtotal} more to use coupon "${formatted}"`);
        return;
      }
      const disc =
        found.discountType === 'flat' ? found.value : Math.round((subtotal * found.value) / 100);
      setCouponCode(formatted);
      setAppliedDiscount(disc);
      setCouponMessage(`Coupon "${formatted}" Applied! Saved ₹${disc}`);
      showToast(`Coupon "${formatted}" applied! Saved ₹${disc}`);
    } else {
      setCouponMessage('Invalid Coupon. Try "MIDC500" for ₹500 off!');
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setAppliedDiscount(0);
    setCouponMessage(null);
    showToast('Coupon removed');
  };

  const clearCart = () => {
    setCartItems([]);
    setCouponCode('');
    setAppliedDiscount(0);
    setCouponMessage(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        savedForLaterItems,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        location,
        setLocation,
        couponCode,
        appliedDiscount,
        couponMessage,
        isGstInvoiceRequired,
        setIsGstInvoiceRequired,
        toastMessage,
        showToast,
        addToCart,
        updateQuantity,
        removeFromCart,
        toggleItemSelect,
        toggleSelectAll,
        saveForLater,
        moveToCartFromSaved,
        applyCoupon,
        removeCoupon,
        clearCart,
        itemToDelete,
        setItemToDelete,
        confirmDelete,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
