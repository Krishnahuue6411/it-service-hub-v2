'use client';

import React, { useState } from 'react';
import { Header } from '../../components/Header';
import { SecondaryNav } from '../../components/SecondaryNav';
import { MediaGallery } from '../../components/pdp/MediaGallery';
import { PdpInfoCenter } from '../../components/pdp/PdpInfoCenter';
import { BuyBoxCard } from '../../components/pdp/BuyBoxCard';
import { BundleUpsell } from '../../components/pdp/BundleUpsell';
import { TechSpecsTabs } from '../../components/pdp/TechSpecsTabs';
import { ReviewsSection } from '../../components/pdp/ReviewsSection';
import { CartDrawer } from '../../components/CartDrawer';
import { LocationModal } from '../../components/LocationModal';
import { Footer } from '../../components/Footer';

import { FLAGSHIP_PRODUCT_PDP } from '../../data/pdpData';
import { PRODUCTS_DATABASE, INITIAL_LOCATION } from '../../data/mockData';
import { ProductVariant, CartItem, LocationInfo, BundleItem, Product } from '../../types';

import { 
  ChevronRight, 
  Share2, 
  Heart, 
  ShoppingCart, 
  ShoppingBag, 
  X, 
  Check, 
  Zap,
  Play
} from 'lucide-react';

export default function ProductDetailPage() {
  const [product] = useState(FLAGSHIP_PRODUCT_PDP);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(FLAGSHIP_PRODUCT_PDP.variants[1]);
  const [selectedFormFactor, setSelectedFormFactor] = useState(FLAGSHIP_PRODUCT_PDP.selectedFormFactor);
  const [quantity, setQuantity] = useState(1);

  // Modals & Drawers
  const [location, setLocation] = useState<LocationInfo>(INITIAL_LOCATION);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Cart State & Toast
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = () => {
    const productToCart: Product = {
      ...product,
      price: selectedVariant.price,
      mrp: selectedVariant.mrp,
      capacity: selectedVariant.capacityLabel as any,
    };

    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id && i.variantId === selectedVariant.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          product: productToCart,
          quantity: quantity,
          variantId: selectedVariant.id,
          capacityLabel: selectedVariant.capacityLabel,
        },
      ];
    });

    showToast(`Added ${quantity}x "${product.name.slice(0, 20)}..." (${selectedVariant.capacityLabel}) to cart ⚡`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setIsCartDrawerOpen(true);
  };

  const handleAddBundleToCart = (selectedBundleItems: BundleItem[]) => {
    selectedBundleItems.forEach((bItem) => {
      const dummyProd: Product = {
        id: bItem.id,
        name: bItem.name,
        category: 'Bundle Accessories',
        brand: product.brand,
        condition: 'New',
        price: bItem.price,
        mrp: bItem.mrp,
        rating: 4.8,
        reviewsCount: 120,
        imageUrl: bItem.imageUrl,
        specBullet: 'High speed accessory',
        discountPercentage: 20,
        inStock: true,
        tabGroup: 'upgrades',
        keySpecsPills: ['Bundle Combo'],
      };

      setCartItems((prev) => [...prev, { product: dummyProd, quantity: 1 }]);
    });

    showToast(`Added ${selectedBundleItems.length} bundle items to cart! ⚡`);
    setIsCartDrawerOpen(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} at ₹${selectedVariant.price.toLocaleString()} on IT Service Hub!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!');
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 pb-16 lg:pb-0">
      
      {/* 1. Sticky Navigation Bar */}
      <Header
        location={location}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        searchQuery=""
        setSearchQuery={() => {}}
        selectedCategory="All Categories"
        setSelectedCategory={() => {}}
        cartItems={cartItems}
        onOpenCartDrawer={() => setIsCartDrawerOpen(true)}
        allProducts={PRODUCTS_DATABASE}
        onSelectSearchProduct={() => {}}
      />

      {/* 2. Secondary Strip Nav */}
      <SecondaryNav
        activeCategory={product.category}
        onSelectCategory={() => {}}
        onScrollToSection={() => {}}
      />

      {/* Main Page Container */}
      <div className="max-w-7xl mx-auto px-4 py-4 w-full flex-1 space-y-6">
        
        {/* Top Breadcrumb & Share/Wishlist Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <nav className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <a href="/" className="hover:text-slate-900 transition">Home</a>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <a href="/products" className="hover:text-slate-900 transition">Hardware & Upgrades</a>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <a href="/products?category=SSD+%26+RAM+Upgrades" className="hover:text-slate-900 transition">Internal SSDs</a>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>

            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                isWishlisted
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
              <span>{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
            </button>
          </div>
        </div>

        {/* Core Product Area (3 Columns Desktop / Stacked Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Column A: Interactive Media Gallery (4 cols) */}
          <div className="md:col-span-12 lg:col-span-5">
            <MediaGallery
              images={product.images}
              productName={product.name}
              videoThumbnail={product.videoThumbnail}
              onOpenVideoModal={() => setIsVideoModalOpen(true)}
              badge={product.badge}
              isBestSeller={product.isBestSeller}
            />
          </div>

          {/* Column B: Information & Variant Selectors (4 cols) */}
          <div className="md:col-span-7 lg:col-span-4">
            <PdpInfoCenter
              product={product}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
              selectedFormFactor={selectedFormFactor}
              onSelectFormFactor={setSelectedFormFactor}
            />
          </div>

          {/* Column C: Sticky Buy Box Card (3 cols) */}
          <div className="md:col-span-5 lg:col-span-3">
            <BuyBoxCard
              product={product}
              selectedVariant={selectedVariant}
              quantity={quantity}
              setQuantity={setQuantity}
              location={location}
              onCheckPincode={(pin) => {
                setLocation((prev) => ({ ...prev, pincode: pin }));
              }}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          </div>

        </div>

        {/* Frequently Bought Together Bundle Upsell */}
        <BundleUpsell
          initialItems={product.bundleItems}
          onAddBundleToCart={handleAddBundleToCart}
        />

        {/* Technical Specs & Installation Tabs */}
        <TechSpecsTabs
          specsTable={product.techSpecsTable}
          installationSteps={product.installationSteps}
          productName={product.name}
        />

        {/* Customer Reviews & Verified Q&A */}
        <ReviewsSection
          rating={product.rating}
          totalReviews={product.reviewsCount}
          distribution={product.ratingDistribution}
          reviews={product.reviewsList}
        />

      </div>

      {/* Footer */}
      <Footer />

      {/* Sticky Bottom Action Bar (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A] text-white border-t border-slate-800 p-3 shadow-2xl lg:hidden flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
        <div>
          <div className="text-xs text-slate-400 font-bold">
            {selectedVariant.capacityLabel}
          </div>
          <div className="text-lg font-black text-amber-400">
            ₹{selectedVariant.price.toLocaleString()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow transition"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow transition"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Video Installation Demo Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative bg-black rounded-2xl max-w-3xl w-full aspect-video overflow-hidden shadow-2xl border border-slate-800">
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-800 text-white p-2 rounded-full z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={product.videoUrl}
              title="Installation Demo"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Cart Drawer Preview */}
      <CartDrawer />

      {/* Location Pincode Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={location}
        onSelectLocation={(loc) => {
          setLocation(loc);
          showToast(`Location set to ${loc.area}`);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 lg:bottom-6 right-6 z-50 bg-[#0F172A] text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-toast">
          <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

    </main>
  );
}
