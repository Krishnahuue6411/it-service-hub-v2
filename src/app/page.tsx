'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { HeroCarousel } from '@/components/HeroCarousel';
import { QuickCategoryGrid } from '@/components/QuickCategoryGrid';
import { SecondaryNav } from '@/components/SecondaryNav';
import { FlashDealsSection } from '@/components/FlashDealsSection';
import { BestSellersTabs } from '@/components/BestSellersTabs';
import { CartDrawer } from '@/components/CartDrawer';
import { LocationModal } from '@/components/LocationModal';
import { TrustBadges } from '@/components/TrustBadges';
import { Footer } from '@/components/Footer';

import { 
  INITIAL_LOCATION, 
  HERO_BANNERS, 
  QUICK_CATEGORIES, 
  PRODUCTS_DATABASE 
} from '@/data/mockData';
import { CartItem, Product, LocationInfo } from '@/types';

export default function Home() {
  const [location, setLocation] = useState<LocationInfo>(INITIAL_LOCATION);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleBuyNow = (product: Product) => {
    handleAddToCart(product);
    setIsCartDrawerOpen(true);
  };

  const handleSelectSearchProduct = (product: Product) => {
    handleAddToCart(product);
    setSearchQuery('');
  };

  const handleCheckout = () => {
    alert(`Checkout: ${cartItems.length} items | Total: ₹${cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toLocaleString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <Header
        location={location}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        cartItems={cartItems}
        onOpenCartDrawer={() => setIsCartDrawerOpen(true)}
        allProducts={PRODUCTS_DATABASE}
        onSelectSearchProduct={handleSelectSearchProduct}
      />

      {/* Secondary Navigation */}
      <SecondaryNav
        activeCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onScrollToSection={(id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Carousel */}
        <HeroCarousel
          banners={HERO_BANNERS}
          onCtaClick={(bannerId) => console.log('CTA clicked:', bannerId)}
        />

        {/* Quick Category Grid */}
        <QuickCategoryGrid
          categories={QUICK_CATEGORIES}
          onSelectCategory={setSelectedCategory}
        />

        {/* Flash Deals Section */}
        <FlashDealsSection
          products={PRODUCTS_DATABASE.filter((p) => p.isFlashDeal)}
          cartItems={cartItems}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
        />

        {/* Best Sellers Tabbed Section */}
        <BestSellersTabs
          products={PRODUCTS_DATABASE}
          cartItems={cartItems}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
          onBuyNow={handleBuyNow}
        />

        {/* Trust Badges */}
        <TrustBadges />
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        location={location}
        onCheckout={handleCheckout}
      />

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={location}
        onSelectLocation={setLocation}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
